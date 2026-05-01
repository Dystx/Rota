# Local implementation roadmap

This file tracks the implementation order for the repo, grounded in the original Rota roadmap and updated after dependency research.

## Current position

- Phase 1 foundation scaffolded
- Stitch reference captured in `docs/design/stitch-design-reference.md`
- live Stitch MCP is now available for the `Rota: Portugal Travel Concierge` project
- dependency research completed and folded into repo docs

## Stitch-driven UI implementation order

This rollout order is now part of the roadmap. The goal is to replace the current scaffold UI with the real Stitch direction in the same sequence that users experience the product, while reusing the data and workflow slices already implemented.

### Ground rules

- pull structure, hierarchy, and design tokens from the live Stitch project before each surface pass
- preserve the roadmap's product rules: no generic AI chat UI, structured cards instead of message threads, clear separation between consumer, reviewer, and admin surfaces
- prefer wiring Stitch layouts onto existing persistence, routing, review, export, and analytics flows instead of rebuilding logic
- each slice is only complete after LSP/build pass and real browser verification on the affected routes

### Ordered rollout

#### 0. Shared foundation and reusable UI primitives

Status: in progress

Goal:

- keep aligning shared shell, typography, spacing, cards, buttons, and map-adjacent panels to the live Stitch design system
- extract only the reusable primitives needed by the consumer, reviewer, and admin surfaces below

Primary files:

- `packages/ui/src/styles.css`
- `packages/ui/src/components/shell.tsx`
- `packages/ui/src/components/card.tsx`
- `packages/ui/src/components/button.tsx`
- `packages/ui/src/components/badge.tsx`

#### 1. Consumer trip creation and refinement flow

Status: next

Stitch sources:

- `Rota — Polish Your Plan`

Routes to implement in this pass:

- `/trip/new`

Why first:

- this is the first high-intent product surface after marketing and sets the tone for the rest of the app
- the structured brief flow already exists, so this is primarily a real UI replacement, not a new backend slice

Primary files:

- `apps/web/app/(app)/trip/new/page.tsx`

#### 2. Consumer generated journey overview

Status: queued after trip creation UI

Stitch sources:

- `Rota — Your Portugal Journey (Refined)`

Routes to implement in this pass:

- `/trip/[tripId]`

Why second:

- this is the core post-generation experience and already has persisted data, trust markers, and partner sources wired in
- it should become the main reference surface for the rest of the consumer UI language

Primary files:

- `apps/web/app/(app)/trip/[tripId]/page.tsx`

#### 3. Consumer map, route audit, and day-layer views

Status: queued after journey overview

Stitch sources:

- `Rota — Five Days in Porto & Douro`
- `Rota — Your Plan Audit`

Routes to implement in this pass:

- `/trip/[tripId]/map`

Why third:

- the route validation logic now exists, including travel-time warnings, so this pass can focus on making the route view match the real Stitch map/editorial composition

Primary files:

- `apps/web/app/(app)/trip/[tripId]/map/page.tsx`

#### 4. Consumer export and polished delivery surfaces

Status: completed

Stitch sources:

- `Rota — Your Polished Journey is Ready`

Routes to implement in this pass:

- `/trip/[tripId]/export`

Why fourth:

- unlock, export, and delivery logic are already present, but the delivery experience still needs the actual product-grade Stitch treatment

Completed: 2026-05-01 (`e4ef29e`).

Primary files:

- `apps/web/app/(app)/trip/[tripId]/export/page.tsx`

#### 5. Consumer archive and saved-trip browsing

Status: completed

Stitch sources:

- `Rota — Curated Portugal Archive`

Routes to implement in this pass:

- `/account`
- `/portugal`

Why fifth:

- once the main planning and delivery flow looks correct, the archive/browsing surfaces can inherit the same editorial language for saved and destination-focused discovery

Completed: 2026-05-01 (`859c81b`, `baa17c8`).

Primary files:

- `apps/web/app/(app)/account/page.tsx`
- `apps/web/app/(marketing)/portugal/page.tsx`

#### 6. Reviewer workspace real UI pass

Status: completed

Stitch sources:

- `Rota — Expert Reviewer Workspace`

Routes to implement in this pass:

- `/reviewer/queue`
- `/reviewer/trips/[tripId]`
- `/reviewer/history`
- `/reviewer/profile`
- `/reviewer/operations`

Why sixth:

- reviewer functionality already exists and should now be expressed with the real operational UI from Stitch once the consumer journey is visually stable

Completed: 2026-05-01 (`bf415da`, `fab3c54`, `2e348b6`, `803d810`, `a2499d1`).

Primary files:

- `apps/web/app/(reviewer)/reviewer/queue/page.tsx`
- `apps/web/app/(reviewer)/reviewer/trips/[tripId]/page.tsx`
- `apps/web/app/(reviewer)/reviewer/history/page.tsx`
- `apps/web/app/(reviewer)/reviewer/profile/page.tsx`
- `apps/web/app/(reviewer)/reviewer/operations/page.tsx`

#### 7. Admin CMS and archive-style control surfaces

Status: queued after reviewer workspace

Stitch sources:

- `Rota — Curated Portugal Archive`
- shared design system and editorial surfaces from the consumer flows

Routes to implement in this pass:

- `/admin/places`
- `/admin/countries`
- `/admin/regions`
- `/admin/partners`
- `/admin/reviewers`
- `/admin/quality`
- `/admin/analytics`

Why seventh:

- the admin data layer is already in place for the core CMS entities, so the remaining work is to turn the shells into a coherent, real product UI rather than placeholders

Primary files:

- `apps/web/app/(admin)/admin/places/page.tsx`
- `apps/web/app/(admin)/admin/countries/page.tsx`
- `apps/web/app/(admin)/admin/regions/page.tsx`
- `apps/web/app/(admin)/admin/partners/page.tsx`
- `apps/web/app/(admin)/admin/reviewers/page.tsx`
- `apps/web/app/(admin)/admin/quality/page.tsx`
- `apps/web/app/(admin)/admin/analytics/page.tsx`

### Working rule for the next implementation cycles

Implement the ordered slices above one at a time. Do not jump across consumer, reviewer, and admin surfaces in parallel unless a shared primitive blocks the active slice.

## Immediate next steps

### 1. Structured trip brief

Status: completed

Build now:

- shared `TripBriefSchema`
- structured trip brief form
- roadmap-aligned option sets for Portugal launch
- validated client-side payload preview

Dependency decision for this phase:

- add `zod` now
- defer heavier form/state/animation packages until their surfaces require them

### 2. Trip creation and persistence

Status: in progress

Build next:

- Supabase wiring
- trip creation API or server action
- save validated trip briefs
- revisit saved trips

Implemented now:

- `.env.example` for Supabase configuration
- first Supabase migration for `trip_briefs` and `trips`
- shared db package with a minimal draft-trip write path
- `POST /api/trips` route for validated trip brief persistence
- client form submission that redirects to the draft trip page on success
- db read methods for trip detail and saved draft lists
- `/trip/[tripId]` backed by persisted brief data when available
- `/account` backed by saved draft trip records when available

### 3. AI itinerary engine

Status: in progress

Build after persistence:

- brief normalization
- missing info detection
- structured follow-up question cards
- itinerary generation with validated JSON output

Implemented now:

- shared `TripQuestionSchema`, `TripStopSchema`, `TripDaySchema`, and `ItinerarySchema`
- deterministic `@repo/ai` itinerary generator behind a swappable interface
- trip detail page now renders a schema-validated route overview, day themes, stops, warnings, and follow-up questions

### 4. Maps and route validation

Status: in progress

Build after itinerary generation:

- map route view
- route layers and stop markers
- travel time validation
- rushed-day and closure warnings

Implemented now:

- shared route-layer and warning schemas
- deterministic routing package with route summary and warning generation
- route day layers and warnings ready to feed the map and reviewer surfaces
- `/trip/[tripId]/map` now renders itinerary-backed day filters, route layers, stop markers, and validation notes
- `/reviewer/trips/[tripId]` now renders the same route data inside the reviewer workspace shell

### 5. Monetization and human review

Status: in progress

Build after the core route loop works:

- trip unlocks
- export options
- reviewer queue and edits
- visible review trust markers

Implemented now:

- shared trip-commerce state helper for unlock, export, and review labels
- trip detail and account pages now surface unlock and human-review trust markers
- pricing and human-review marketing pages now link directly into unlock and trust flows
- reviewer queue and reviewer trip detail now show the same unlock/review state language
- `POST /api/trips/[tripId]/unlock` now flips a draft trip into an unlocked paid state
- `GET /api/trips/[tripId]/export?format=markdown` now returns a generated markdown trip export for unlocked trips
- trip and account pages now expose real unlock/export actions when trip data exists
- `POST /api/trips/[tripId]/review` now supports both requesting human review and marking the trip as reviewed
- trip detail and reviewer trip pages now surface the real review workflow instead of trust labels only
- shared worker job schemas now define export, review, and route-refresh background tasks
- `apps/workers` now exposes a deterministic worker-plan builder instead of a placeholder only
- `/reviewer/operations` now shows the planned background jobs for exports and review handoff
- `@repo/payments` now exposes deterministic checkout plan data for free preview, paid unlock, and human review tiers
- `@repo/emails` now exposes deterministic transactional preview content for payment receipt, export delivery, and review completion
- pricing, trip detail, account, human-review, and reviewer operations surfaces now render checkout and delivery-preview content from those shared packages
- `/trip/[tripId]/export` now acts as the roadmap-aligned export center for PDF, calendar, markdown, share-path, and print-friendly actions
- `GET /api/trips/[tripId]/export` now supports deterministic `pdf`, `calendar`, and `markdown` downloads for unlocked trips
- the worker plan now includes a dedicated PDF export job alongside the existing markdown export flow
- reviewer dashboard v1 now includes explicit reviewer profile and review history surfaces alongside queue, trip detail, and operations
- admin places now includes a client-side place editor shell for curation, quality score, and source-confidence workflow rehearsal
- admin route coverage now includes explicit regions, partners, reviewers, quality, and analytics shells to match the roadmap's CMS module list
- the first real admin place data layer now exists: shared place schema, places migration, db CRUD helpers, and `/api/places` routes
- the next admin persistence slice now exists for regions and reviewers: shared schemas, migrations, db CRUD helpers, and `/api/regions` + `/api/reviewers` routes
- partner persistence and reviewer assignment/history persistence now exist via shared schemas, migrations, db helpers, and `/api/partners` + `/api/reviewer-assignments` routes
