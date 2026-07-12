# Rumia Phase 3 Traveler Workspace and Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a complete traveler command center where one persisted route can be viewed, edited, unlocked, exported, locally reviewed, archived, and shared without exposing locked or cross-user data.

**Architecture:** Immutable `RouteVersion` records are the source of every traveler projection. A server projection layer physically removes locked fields, explicit lifecycle machines govern trips, orders, entitlements, exports, reviews, and shares, and every mutation uses optimistic concurrency plus an idempotency key. Provider work runs through durable job interfaces and never holds a database transaction open.

**Tech Stack:** Next.js 16 App Router, React 19.2, TypeScript 5.9 strict mode, Supabase Postgres/Auth/Storage, MapLibre, Stripe Checkout/webhooks, worker adapters, Vitest, Playwright, and axe.

## Global Constraints

- The deterministic path is `/` → `/planner` → `/trip/new` only for unresolved exceptions → `/trip/[tripId]` → checkout, review, or export.
- Free preview and Full itinerary are physically different server projections; locked route detail is absent from HTML, React payloads, API responses, analytics, and caches.
- Full itinerary (`full_itinerary_v1`) and Local expert polish (`local_polish_v1`) are independent, versioned entitlements; Local Polish requires active Full.
- Query parameters never prove ownership, payment, entitlement, reviewer assignment, or share access.
- Every route edit publishes an immutable new version after recomputing legs, timing, warnings, and logistical integrity.
- Checkout fulfillment is webhook-authoritative, signature-verified from the raw body, idempotent, and scoped to the persisted order owner and trip.
- Export, offline, review attachment, and share objects are private; authorization precedes every short-lived signed URL.
- Trip messaging is available only for a paid Local Polish review with an active assigned reviewer and the messaging feature ready.
- Mobile trip workspaces provide deliberate Summary, Agenda, and Map modes with no document-level horizontal overflow.

---

### Task 3.1: Complete lifecycle, route mutation, and projection contracts

**Files:**
- Create: `packages/types/src/commerce.ts`
- Create: `packages/types/src/commerce.test.ts`
- Create: `packages/types/src/review.ts`
- Create: `packages/types/src/review.test.ts`
- Create: `packages/types/src/trip-export.ts`
- Create: `packages/types/src/trip-export.test.ts`
- Create: `packages/types/src/sharing.ts`
- Create: `packages/types/src/sharing.test.ts`
- Modify: `packages/types/src/route-version.ts`
- Modify: `packages/types/src/route-version.test.ts`
- Modify: `packages/types/src/trip-lifecycle.ts`
- Modify: `packages/types/src/trip-lifecycle.test.ts`
- Modify: `packages/types/src/index.ts`
- Create: `packages/db/src/trips.ts`
- Create: `packages/db/src/trips.test.ts`
- Create: `packages/db/src/trip-state.ts`
- Create: `packages/db/src/trip-state.test.ts`
- Create: `packages/db/src/route-generation-jobs.ts`
- Create: `packages/db/src/route-generation-jobs.test.ts`
- Modify: `packages/db/src/index.ts`
- Create via CLI: `supabase/migrations/*_complete_trip_lifecycle_and_state_events.sql`

**Interfaces:**

```ts
export type RouteChange =
  | { id: string; kind: "add_stop"; day: number; index: number; stop: RouteStop }
  | { id: string; kind: "remove_stop"; stopId: string }
  | { id: string; kind: "move_stop"; stopId: string; day: number; index: number }
  | { id: string; kind: "replace_stop"; stopId: string; replacement: RouteStop }
  | { id: string; kind: "change_leg_mode"; legId: string; mode: RouteTravelMode }
  | { id: string; kind: "apply_route_setting"; setting: "less_driving" | "one_slower_base" };

export type SaveRouteRequest = { baseVersion: number; changes: readonly RouteChange[] };
export type SaveRouteResult =
  | { kind: "published"; routeVersion: RouteVersion }
  | { kind: "conflict"; currentVersion: number };

export type ProductSku = "full_itinerary_v1" | "local_polish_v1";
export type ShareScope = "preview" | "full";
```

- [ ] **Step 1: Write failing contract tests** for every legal and illegal trip, generation, order, entitlement, export, review, and share transition; include refunded/disputed/suspended states and stale base versions.
- [ ] **Step 2: Run** `pnpm exec vitest run packages/types/src packages/db/src/trip-state.test.ts` **and confirm missing contracts.**
- [ ] **Step 3: Generate `complete_trip_lifecycle_and_state_events`** and add immutable transition events, published-version foreign keys, job state/indexes, ownership constraints, and forward-only reconciliation fields. Do not infer a paid SKU from legacy `trips.is_paid`.
- [ ] **Step 4: Implement pure transition predicates and explicit user/system DB contexts.** Provider calls occur after a short `FOR UPDATE SKIP LOCKED` claim and before a short publish transaction.
- [ ] **Step 5: Run focused tests, reset/lint Supabase, run typechecks, and commit** with `git commit -m "feat: complete traveler lifecycle contracts"`.

### Task 3.2: Enforce physically redacted trip projections

**Files:**
- Modify: `packages/types/src/route-version.ts`
- Modify: `packages/types/src/route-version.test.ts`
- Modify: `packages/db/src/trip-projections.ts`
- Modify: `packages/db/src/trip-projections.test.ts`
- Modify: `apps/web/app/api/trips/[tripId]/route.ts`
- Create: `apps/web/app/api/trips/[tripId]/route.test.ts`
- Modify: `apps/web/app/lib/trip-access.ts`
- Modify: `apps/web/app/lib/trip-access.test.ts`
- Modify: `supabase/policy-tests/phase-2-route-version-matrix.sql`

**Interfaces:**

```ts
export type FreePreviewProjection = {
  access: "preview";
  routeVersion: number;
  bases: readonly RouteBaseSummary[];
  coarseGeometry: GeoJSON.MultiLineString;
  totalDays: number;
  dailyThemes: readonly string[];
  aggregateTravelMinutes: number;
  warnings: readonly PublicWarningSummary[];
  sampleStops: readonly PublicStopSummary[];
};

export type FullTravelerProjection = { access: "full"; routeVersion: RouteVersion };
export type AssignedReviewerProjection = { access: "reviewer"; routeVersion: RouteVersion; review: ReviewerProjection };
export type TripProjection = FreePreviewProjection | FullTravelerProjection | AssignedReviewerProjection;
```

- [ ] **Step 1: Write failing projection/API tests** that scan serialized output for stop descriptions beyond the two samples, precise hidden coordinates, partner details, reviewer notes, payment fields, and route-version rows.
- [ ] **Step 2: Run focused tests and verify current responses leak or lack the new discriminant.**
- [ ] **Step 3: Implement server-produced projections** using owner, active entitlement, and active reviewer assignment. Return one uniform `404` for absent and foreign trips without a privileged existence probe on the request path.
- [ ] **Step 4: Add cache controls:** owner/reviewer responses `private, no-store`; token share responses use the policy in Task 3.9; no projection is written to a public cache.
- [ ] **Step 5: Run tests, policy matrix, and typechecks; commit** with `git commit -m "feat: enforce trip projection boundaries"`.

### Task 3.3: Build the traveler command center

**Files:**
- Modify: `apps/web/app/(app)/trip/[tripId]/page.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/page.test.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-command-center.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-command-center.test.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-workspace-map.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-agenda.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-mobile-modes.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-integrity-ledger.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-context-capsule.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/trip-next-action.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_lib/trip-mode.ts`
- Create: `apps/web/app/(app)/trip/[tripId]/_lib/trip-mode.test.ts`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/cinematic-hero.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/cinematic-hero.stories.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/cinematic-map-section.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/cinematic-map-section.test.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/intersection-observer-gate.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/chapter-day-sync.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/pace-tone-control.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/stop-filmstrip.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_components/workspace-trip-canvas.tsx`
- Remove: `apps/web/app/(app)/trip/[tripId]/_lib/chapter-mapping-defaults.ts`
- Remove: `apps/web/app/(app)/trip/[tripId]/_lib/chapter-mapping.ts`

- [ ] **Step 1: Write failing tests** for hierarchy (summary/one next action → route overview → agenda/detail → entitlement/review/export), preview/full views, loading/empty/error/unauthorized states, and destination-local Today logic for `Europe/Lisbon` and `Atlantic/Azores`.
- [ ] **Step 2: Run the tests and confirm the current cinematic page does not satisfy the command hierarchy.**
- [ ] **Step 3: Implement desktop split workspace and mobile modes:** before travel uses Overview/Map/Plan/Pack, during travel uses Today/Map/Plan/Pack, and after travel uses Recap/Map/Plan/Pack. The mobile agenda uses a one-card snap carousel with visible pagination and “View day agenda”; desktop uses a multi-card strip inside the new command-center component.
- [ ] **Step 4: Consume only persisted `TripProjection`.** Remove on-page calls that regenerate from the trip brief. Every map-only warning, leg, and stop has a synchronized accessible list representation.
- [ ] **Step 5: Run component tests, web typecheck, 390px/1440px screenshots, axe, and overflow checks; commit** with `git commit -m "feat: build the trip command center"`.

### Task 3.4: Add the versioned route editor with undo and conflict recovery

**Files:**
- Create: `packages/routing/src/route-edits.ts`
- Create: `packages/routing/src/route-edits.test.ts`
- Modify: `packages/routing/src/index.ts`
- Modify: `apps/web/app/(app)/trip/[tripId]/map/page.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/map/page.test.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/map/route-editor.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/map/route-editor-store.ts`
- Create: `apps/web/app/(app)/trip/[tripId]/map/route-editor.test.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/map/dirty-navigation-guard.tsx`
- Modify: `apps/web/app/(app)/trip/[tripId]/map/map-components.tsx`
- Modify: `apps/web/app/api/trips/[tripId]/route.ts`

**Interfaces:**

```ts
export function applyRouteChanges(route: RouteVersionContent, changes: readonly RouteChange[]): RouteVersionContent;
export function recomputeRouteIntegrity(route: RouteVersionContent): readonly RouteIntegrityResult[];
```

- [ ] **Step 1: Write failing tests** for all six edit kinds, invalid targets, 20-action undo cap, clean/dirty/saving/saved/conflict/save-failed states, stale `baseVersion`, map/list/detail synchronization, and navigation with unsaved edits.
- [ ] **Step 2: Run tests and confirm route mutation APIs are missing.**
- [ ] **Step 3: Implement pure edit/recompute functions** and reject publication when required integrity checks fail. Saving creates a new immutable version and returns `409` with `currentVersion` for a stale base.
- [ ] **Step 4: Implement the editor** with explicit Save, Undo, Discard, conflict reload/reapply guidance, keyboard reordering controls, and map-independent list editing. No drag action is the only way to mutate a stop.
- [ ] **Step 5: Run tests/typechecks and keyboard/manual map verification; commit** with `git commit -m "feat: add versioned route editing"`.

### Task 3.5: Implement independent orders, entitlements, and Stripe fulfillment

**Files:**
- Modify: `packages/payments/src/catalogue.ts`
- Modify: `packages/payments/src/index.ts`
- Modify: `packages/payments/src/index.test.ts`
- Create: `packages/db/src/commerce.ts`
- Create: `packages/db/src/commerce.test.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `apps/web/app/checkout/page.tsx`
- Create: `apps/web/app/checkout/page.test.tsx`
- Modify: `apps/web/app/checkout/_components/package-selector.tsx`
- Create: `apps/web/app/checkout/_components/package-selector.test.tsx`
- Create: `apps/web/app/api/checkout/sessions/route.ts`
- Create: `apps/web/app/api/checkout/sessions/route.test.ts`
- Modify: `apps/web/app/api/webhooks/stripe/route.ts`
- Modify: `apps/web/app/api/webhooks/stripe/route.test.ts`
- Modify: `apps/web/app/api/trips/[tripId]/unlock/route.ts`
- Modify: `apps/web/app/api/trips/[tripId]/unlock/route.test.ts`
- Create via CLI: `supabase/migrations/*_create_trip_orders_entitlements.sql`
- Create: `supabase/policy-tests/phase-3-commerce-matrix.sql`

**Interfaces:**

```ts
export type CheckoutSessionInput = {
  orderId: string;
  tripId: string;
  ownerUserId: string;
  sku: ProductSku;
  catalogueVersion: string;
  successUrl: string;
  cancelUrl: string;
};
```

- [ ] **Step 1: Write failing tests** for owner/SKU eligibility, Local Polish without Full, repeated checkout, canceled/failed/webhook-pending/confirmed/refunded/disputed, metadata mismatch, duplicate/out-of-order webhook events, raw-body signature failure, and query-string spoofing.
- [ ] **Step 2: Generate `create_trip_orders_entitlements`** with immutable order amounts/currency/catalogue version, unique Stripe IDs/events, unique trip/SKU entitlement, lifecycle events, review-request outbox uniqueness, and no direct authenticated grants.
- [ ] **Step 3: Implement checkout creation** from the server-owned catalogue/order only. Set Stripe metadata to order ID, trip ID, owner ID, SKU, and catalogue version; never accept price or currency from the browser.
- [ ] **Step 4: Implement webhook fulfillment** by verifying the raw body signature, persisting the event before side effects, checking `payment_status`, locking the order, validating metadata, transitioning entitlement once, and enqueuing receipt/review work once. Make `/api/trips/[tripId]/unlock` a fixed typed `410 Gone`.
- [ ] **Step 5: Make the return page poll persisted order state** and render pending, confirmed, canceled, failed, refunded, and disputed states without treating `success=true` as payment evidence.
- [ ] **Step 6: Run focused tests, Supabase reset/policy tests, Stripe fixture tests, and typechecks; commit** with `git commit -m "feat: add itinerary and polish entitlements"`.

### Task 3.6: Make exports durable and version-bound

**Files:**
- Create: `packages/db/src/exports.ts`
- Create: `packages/db/src/exports.test.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `apps/web/app/lib/export-jobs.ts`
- Modify: `apps/web/app/lib/export-jobs.test.ts`
- Create: `apps/workers/src/trip-export.ts`
- Create: `apps/workers/src/trip-export.test.ts`
- Modify: `apps/workers/src/index.ts`
- Modify: `apps/web/app/(app)/trip/[tripId]/export/page.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/export/page.test.tsx`
- Modify: `apps/web/app/api/trips/[tripId]/export/route.ts`
- Create: `apps/web/app/api/trips/[tripId]/export/route.test.ts`
- Modify: `apps/web/app/api/trips/[tripId]/export/retry/route.ts`
- Create: `apps/web/app/api/trips/[tripId]/export/retry/route.test.ts`
- Create via CLI: `supabase/migrations/*_harden_trip_export_jobs_and_storage.sql`
- Modify: `supabase/policy-tests/phase-3-commerce-matrix.sql`

- [ ] **Step 1: Write failing tests** for `pdf | calendar | print`, Full eligibility, queued/generating/ready/failed/expired/stale, duplicate requests, route-version invalidation, retry bounds, durable-object reuse, and short signed-URL reissue.
- [ ] **Step 2: Generate the forward migration** that adds `route_version_id`, print format, checksum, bytes, private object path, artifact expiry, signed-URL expiry, attempts, error code, and unique `(trip_id, route_version_id, format)`; create a private `trip-exports` bucket and revoke direct reads.
- [ ] **Step 3: Implement worker generation** as idempotent content-addressed output. A ready object survives page reload; GET reauthorizes and reissues a URL without regenerating. Publishing a route marks older jobs stale.
- [ ] **Step 4: Implement export center states** with exact format availability, current route version, progress, result, expiry, retry guidance, and print action. No disabled decorative controls.
- [ ] **Step 5: Run worker/DB/API/UI tests, policy tests, typechecks, and artifact inspection; commit** with `git commit -m "feat: deliver durable trip exports"`.

### Task 3.7: Separate the trip library, Vault, account, and offline packs

**Files:**
- Create: `packages/db/src/trip-library.ts`
- Create: `packages/db/src/trip-library.test.ts`
- Create: `packages/db/src/offline-packs.ts`
- Create: `packages/db/src/offline-packs.test.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `apps/web/app/itineraries/page.tsx`
- Create: `apps/web/app/itineraries/page.test.tsx`
- Remove: `apps/web/app/itineraries/_components/itinerary-search.tsx`
- Create: `apps/web/app/itineraries/_components/trip-library.tsx`
- Create: `apps/web/app/itineraries/_components/trip-library.test.tsx`
- Modify: `apps/web/app/itineraries/_components/itinerary-export-drawer.tsx`
- Modify: `apps/web/app/vault/page.tsx`
- Modify: `apps/web/app/vault/_components/vault-gallery.tsx`
- Modify: `apps/web/app/(app)/account/page.tsx`
- Remove: `apps/web/app/(app)/account/_components/trip-card.tsx`
- Create: `apps/web/app/(app)/account/_components/receipts-list.tsx`
- Create: `apps/web/app/(app)/account/_components/receipts-list.test.tsx`
- Modify: `apps/web/app/_lib/offline-cache.ts`
- Create via CLI: `supabase/migrations/*_create_trip_offline_packs.sql`

- [ ] **Step 1: Write failing projection/UI tests** proving Library owns trip search/filter/next actions, Vault owns only export/offline/share artifacts, Account owns identity/preferences/receipts, empty states link to `/planner`, and no Kyoto/demo/internal IDs render.
- [ ] **Step 2: Generate offline-pack tables/private Storage policies** bound to owner, route version, entitlement, checksum, expiry, and byte size.
- [ ] **Step 3: Implement typed projections** for lifecycle, entitlement, review, exact/flexible dates, destination timezone, published thumbnail, receipt totals, and next action. Keep each route’s query surface separate.
- [ ] **Step 4: Implement offline pack creation/removal** with explicit cached coverage and recovery copy; revoked/refunded Full prevents new URL issuance and removes cached protected detail at next sync.
- [ ] **Step 5: Run focused tests, visual/a11y/overflow checks, policy tests, and commit** with `git commit -m "feat: separate library vault and account"`.

### Task 3.8: Add proposal-led traveler review and scoped messaging

**Files:**
- Create: `packages/db/src/reviews.ts`
- Create: `packages/db/src/reviews.test.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `apps/web/app/api/trips/[tripId]/review/route.ts`
- Modify: `apps/web/app/api/trips/[tripId]/review/route.test.ts`
- Modify: `apps/web/app/api/trips/[tripId]/messages/route.ts`
- Modify: `apps/web/app/api/trips/[tripId]/messages/route.test.ts`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/review-workspace.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/review-workspace.test.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/review-proposal-card.tsx`
- Create: `apps/web/app/(app)/trip/[tripId]/_components/review-ledger.tsx`
- Modify: `apps/web/app/expert-chat/page.tsx`
- Modify: `apps/web/app/expert-chat/_components/expert-chat.tsx`
- Modify: `apps/web/app/expert-chat/_components/expert-chat.test.tsx`
- Create via CLI: `supabase/migrations/*_create_trip_reviews_proposals_messages.sql`
- Create: `supabase/policy-tests/phase-3-review-messaging-matrix.sql`

**Interfaces:**

```ts
export type TravelerProposalAction = {
  proposalId: string;
  targetRouteVersion: number;
  action: "accept" | "decline" | "ask_why";
  acceptedChangeIds?: readonly string[];
  reason?: string;
};
```

- [ ] **Step 1: Write failing tests** for review eligibility, request idempotency, proposal atomic/partial acceptance, decline, ask-why, stale target version, rebase marking, completion blockers, messaging disabled, no active reviewer, attachment authorization, and traveler/reviewer/admin isolation.
- [ ] **Step 2: Generate review, check, proposal/change, state-event, conversation/message, and attachment tables** with no direct raw-row reads. In the same forward migration, revoke the legacy broad `chat_messages` participant policy.
- [ ] **Step 3: Implement traveler proposal decisions transactionally:** lock trip/version/proposal, verify owner and current entitlement, apply accepted atomic changes, recompute route integrity, publish one version, mark affected proposals for rebase, append audit/state events, and enqueue notifications.
- [ ] **Step 4: Replace canned expert chat** with the trip review conversation when composite messaging readiness is ready; otherwise render the truthful disabled state. Messages require active Local Polish and active assignment on every read/write.
- [ ] **Step 5: Run DB/API/UI tests, policy matrices, and typechecks; commit** with `git commit -m "feat: add traveler review proposals and messaging"`.

### Task 3.9: Add revocable read-only sharing

**Files:**
- Create: `packages/db/src/sharing.ts`
- Create: `packages/db/src/sharing.test.ts`
- Modify: `packages/db/src/index.ts`
- Create: `apps/web/app/api/trips/[tripId]/shares/route.ts`
- Create: `apps/web/app/api/trips/[tripId]/shares/route.test.ts`
- Create: `apps/web/app/api/trips/[tripId]/shares/[shareId]/route.ts`
- Create: `apps/web/app/api/trips/[tripId]/shares/[shareId]/route.test.ts`
- Create: `apps/web/app/share/trip/[token]/page.tsx`
- Create: `apps/web/app/share/trip/[token]/page.test.tsx`
- Create: `apps/web/app/share/trip/[token]/not-found.tsx`
- Modify: `apps/web/next.config.ts`
- Create via CLI: `supabase/migrations/*_create_trip_share_links.sql`
- Create: `supabase/policy-tests/phase-3-sharing-matrix.sql`

- [ ] **Step 1: Write failing tests** for exactly 32 random bytes, one-time token return, SHA-256-only storage, preview/full scope, maximum 30-day expiry, immediate revocation, route-version binding, rate limiting, last-access update, noindex, and identical malformed/unknown/expired/revoked responses.
- [ ] **Step 2: Generate share-link schema** with unique token hash, owner/trip/version constraints, scope, expiry, revocation, access metadata, and no authenticated table grants.
- [ ] **Step 3: Implement owner create/revoke APIs** and a token resolver that performs constant-shape lookup and returns only the selected projection. Full shares require Full at creation and stop resolving after suspension/revocation/refund.
- [ ] **Step 4: Render a read-only shell** with `robots: noindex,nofollow`, `Referrer-Policy: no-referrer`, no account leakage, no editing/messaging/actions, and the same accessible map/list content.
- [ ] **Step 5: Run focused tests, policy tests, security headers check, and commit** with `git commit -m "feat: add revocable trip sharing"`.

### Task 3.10: Gate the complete traveler release

**Files:**
- Create: `apps/web/playwright/tests/trip-command-center.spec.ts`
- Create: `apps/web/playwright/tests/route-editor.spec.ts`
- Create: `apps/web/playwright/tests/commerce-export.spec.ts`
- Create: `apps/web/playwright/tests/review-sharing.spec.ts`
- Modify: `apps/web/playwright/global-setup.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `apps/web/playwright/tests/perf.spec.ts`
- Modify: `docs/audit/route-matrix.md`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add failing traveler journeys** for preview/full projection, generation retry, edit conflict/reapply, delayed webhook, duplicate webhook, refund, export retry/stale regeneration, offline pack, Local Polish request, partial proposal acceptance, message isolation, share revoke, and foreign-trip uniform `404`.
- [ ] **Step 2: Add anonymous and two distinct traveler personas** so cross-owner API, Storage, share, and direct-table attempts are exercised after successful authenticated rendering.
- [ ] **Step 3: Run the full Phase 3 gate:**

```bash
pnpm lint
pnpm typecheck
pnpm exec vitest run
pnpm build
pnpm check:migrations
pnpm exec supabase db reset
pnpm test:rls
pnpm --dir apps/web test:e2e
pnpm --dir apps/web test:visual
pnpm --dir apps/web test:a11y
pnpm --dir apps/web test:perf
pnpm qa:motion-gate
pnpm qa:mapbox-budget
pnpm qa:perf-budget
git diff --check
```

- [ ] **Step 4: Manually verify at 390px and 1440px** all loading/empty/error/unauthorized states, one `main`/visible `h1`, keyboard-complete route edit/checkout-return/export/proposal/share flows, no document overflow, no locked markup, and usable list equivalents before map readiness.
- [ ] **Step 5: Record exact evidence in the route matrix and commit** with `git commit -m "test: gate the traveler commerce release"`.

## Phase 3 release condition

Release each capability independently. Full itinerary requires verified Stripe staging fulfillment and projection non-disclosure; export requires durable-object and signed-URL tests; Local Polish requires review-request idempotency; messaging requires the Phase 4 active-assignment boundary; sharing requires uniform-token failure and revocation tests. No flag is enabled solely because its UI exists.
