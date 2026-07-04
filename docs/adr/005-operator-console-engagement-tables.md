# ADR: Operator Console Engagement Tables

- **Status**: Accepted
- **Date**: 2026-07-04

## Context

The operator console (`/console/messages`, `/console/pipeline`) is the
Tier 2 specialist review surface. Until this ADR, the "Push to Timeline"
form on the messages page and the chat composer had `e.preventDefault()`
on submit — they were wireframes, not wired to any persistence. The
Pipeline dnd-kit board (operations kanban) updated local React state on
drag-end but never wrote to the `trips` table.

The 2026-07-04 polish + functional-fixes pass scoped this as Phase 3 in
`docs/reviews/2026-07-04-polish-and-functional-fixes.md`. The form
comments themselves flagged the gap:

- `apps/web/app/console/messages/page.tsx:526-607` — Push to Timeline
  form had no `onSubmit` wiring.
- `apps/web/app/console/messages/page.tsx:480-510` — chat composer had
  no submit handler.
- `apps/web/app/console/_components/pipeline-board.tsx:200-213` —
  `handleDragEnd` set local state only.

## Decision

We add two new tables to the schema (`itinerary_events`,
`chat_messages`) and three new route handlers under
`/api/console/*`. The route handlers use the existing
`getAdminPageAuthContext()` helper (ADR 001) for auth, and the
`RotaDataClient` from `@repo/db` for the actual writes.

### `public.itinerary_events`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | `gen_random_uuid()` |
| `conversation_id` | text | The `CONVERSATIONS[].id` slug (`"eleanor"`, `"hastings"`). Text not uuid so the operator surface can use human-friendly slugs without coordinating with `auth.users`. |
| `event_type` | text | `check` in `('activity', 'accommodation', 'transfer', 'dining')`. Mirrors the form `<select>` options. |
| `title` | text | |
| `event_date` | date | |
| `event_time` | time | |
| `internal_notes` | text nullable | |
| `created_at` | timestamptz | default `now()` |
| `created_by` | uuid | references `auth.users(id) on delete set null` |

### `public.chat_messages`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `conversation_id` | text | |
| `author_role` | text | `check` in `('operator', 'traveler')` |
| `author_user_id` | uuid | references `auth.users(id) on delete set null` |
| `body` | text | `check (length(body) > 0)` |
| `source_snippet_id` | text nullable | a snippet card id (JSON) the operator dropped in |
| `created_at` | timestamptz | default `now()` |

### RLS

Both tables follow the same RLS posture as the rest of the schema
(ADR 001):

- `itinerary_events` — admin role can do everything; travelers can
  read/insert their own.
- `chat_messages` — any authenticated user can read all; both
  `operator` and `traveler` roles can insert.

The `private.current_app_role()` and `private.current_reviewer_id()`
helpers (added in earlier sessions) gate the admin policy on a
PostgreSQL function that reads `app_metadata.claims`. This avoids
running a subquery per RLS check.

### Indexes

- `itinerary_events(conversation_id, created_at desc)` — the operator's
  "latest events for this conversation" view.
- `itinerary_events(event_date)` — the future "events on this date"
  view.
- `chat_messages(conversation_id, created_at)` — the conversation
  thread view.

### API routes

- `POST /api/console/itinerary-events` — admin-only; Zod-validated body
  with `eventDate` matching `YYYY-MM-DD` and `eventTime` matching
  `HH:MM`; returns `{ ok, id, createdAt }`.
- `POST /api/console/chat-messages` — admin-only; Zod-validated body
  with `body` non-empty.
- `POST /api/console/pipeline/move` — admin-only; maps the local
  `PipelineItem["status"]` enum (`draft | in_revision | active_chat`) to
  the real `trips.status` value (`draft | in_review | active`); rejects
  items with `id` starting with `"fallback-"` (the board's offline
  placeholder ids) with a 500.

All three routes follow the same shape: Zod validation, admin auth,
`RotaDataClient.from(table).insert/update()`, structured error response.
The pattern is the one documented in `docs/architecture.md` for the
existing `/api/trips/[id]/unlock` route.

### Client wiring

- **Push to Timeline form** `apps/web/app/console/messages/page.tsx:526-607`:
  real `name` attrs, `onSubmit` posts to the API, optimistic state for
  `submitting / ok / error` with the row id in the success message.
- **Chat composer** `apps/web/app/console/messages/page.tsx:480-510`:
  real form, `onSubmit` posts to the API, optimistic insert of the
  message into local `sentMessages` state, `Cmd/Ctrl+Enter` shortcut.
- **Pipeline board** `apps/web/app/console/_components/pipeline-board.tsx:200-213`:
  optimistic local move on `handleDragEnd`, then `fetch` to the API with
  rollback on failure (the card snaps back to its previous lane).

## Consequences

### Positive

- The forms are real now, not wireframes. The operator's work persists.
- The pipeline kanban is the source of truth for the `trips.status`
  column; the Realtime subscription (already in place) will pick up
  other operators' moves.
- The new `chat_messages` table is the foundation for the Tier 2
  async chat feature (specialist ↔ traveler). The schema is ready
  before the UI; the next step is rendering the thread in
  `console/messages`.

### Negative / Trade-offs

- The chat composer doesn't yet render the conversation thread. The
  `sentMessages` local state is unused — the API call succeeds but
  the user doesn't see the message appear. This is a Phase 7 follow-up
  (read from `chat_messages` table on the messages page).
- The pipeline dnd-kit revert on failure is a `console.warn`, not a UI
  toast. Acceptable for the demo, but a real product should surface
  the failure to the operator.
- The 2 new tables add 2 more RLS policies to keep aligned with the
  schema. RLS drift between local migrations and hosted Supabase has
  been a recurring problem; this migration is applied via psql and
  the CLI tracking may not reflect it (see
  `docs/reviews/2026-07-03-llm-review.md` LOW-1 for the drift
  pattern).
- The `id` for fallback pipeline items is a sentinel string
  (`"fallback-"`). If the real `trips.id` ever collides with this
  prefix, the dnd-kit move will incorrectly reject. Unlikely in
  practice — UUIDs don't start with `"fallback-"` — but worth noting.

### Rejected alternatives

- **Server actions instead of route handlers** — would have avoided
  the `fetch` boilerplate in the client, but the page is `"use client"`
  and the existing pattern for similar routes is Next.js route
  handlers. Consistency won.
- **Service-role client for the writes** — would have bypassed RLS,
  which is the wrong default for operator actions. The admin client
  with RLS keeps the policy as the source of truth.
- **JSONB payload column** for the form data — would have been more
  flexible but harder to query (`WHERE event_type = 'activity'` would
  require a JSONB index). Typed columns with `check` constraints
  surface bad data at insert time, which is the right tradeoff.
