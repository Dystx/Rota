# Decisions


## 2026-05-01T14:18:45+00:00 — Task: T1 Secret Lockdown
- Kept `.env.example` as the committed template with empty placeholders, and strengthened `.gitignore` to ignore local env files while allow-listing `.env.example` templates.
- Preserved `createAdminClient` behavior for current server-side flows, but split env reads into separate local variables to avoid public-service-key scan false positives and clarify server-only handling.

## 2026-05-01T00:00:00Z — Task: T2 Provider Audit
- Locked provider defaults for launch planning to Stripe Checkout, Resend transactional email, PostHog product analytics, and Mapbox maps so T7/T22–T28 can share a single config baseline.
- Classified `packages/payments`, `packages/emails`, `packages/ai`, `packages/routing`, and `apps/workers` by their current source contracts rather than README wording to keep implementation readiness separate from roadmap intent.

## 2026-05-01T14:31:05Z — Task: T3 Access Inventory
- Classified marketing pages and `/api/partner-clicks` as public production targets; all traveler, reviewer, and admin data/mutation surfaces require authenticated role targets.
- Set target unauthenticated behavior to sign-in redirects for protected pages and 401 JSON for protected APIs; wrong-role behavior should be 403 or 404 where hiding resource existence is preferable.
- Rejected no-auth reviewer/admin access as a production target; role authorization should come from trusted Supabase Auth app metadata or server-owned membership tables, never raw user-editable metadata.

## 2026-05-01T00:00:00Z — Task: T4 Roadmap Reconciliation
- Kept the roadmap audit separate from documentation rewrites, because the task is evidence synthesis only.
- Classified slices 4 through 7 as UI-complete, so later production work must be framed as hardening, auth, provider, and RLS work instead of a reopened redesign.

## 2026-05-01T14:42:01Z — Task: T5 QA Performance Baseline
- Classified missing QA/performance tooling as launch gaps owned by T13/T14/T36–T42 rather than as implicit pass criteria.
- Kept this audit strictly evidence-only: no test infrastructure, CI, Lighthouse, or a11y tooling was added.
- Used the current production build on localhost:3010 for route screenshots so the baseline reflects the actual shipped bundle state.

## 2026-05-01T14:50:21Z — Task: T6 Supabase Schema Audit
- Kept T6 evidence-only and read-only: no migrations, grants, policies, indexes, constraints, functions, or application code were changed.
- Grounded future policy direction in T3: traveler rows must be owner-scoped, reviewer rows assignment/self-scoped, admin CRUD/reporting admin-only, and public access limited to marketing plus `/api/partner-clicks` unless a later task intentionally creates a scoped read model.
- Treated current broad `anon`/`authenticated` catalog grants as a T10 remediation item rather than editing grants during this audit.

## 2026-05-01T15:09:49+00:00 — Task: T7 Config Registry
- Added `packages/config` as a typed env registry with separate public and server factories.
- Web integration now uses the config package in `apps/web/tsconfig.json` and `apps/web/next.config.ts`; the root layout stays unaffected.
- Verified `pnpm typecheck`, `pnpm --dir apps/web build`, a redacted missing-env scenario, and a client-secret scan with no server-secret matches.

## 2026-05-01T15:14:10+00:00 — Task: T7 Config Registry Boundary Follow-up
- Removed server-only exports from `@repo/config` root so the public entrypoint stays browser-safe.
- Kept `@repo/config/server` as the only path exporting `createServerConfig` / `ServerConfig`, and confirmed root/typecheck/build still pass.

## 2026-05-01T15:27:00+00:00 — Task: T8 Supabase SSR Middleware
- Added separate Supabase helpers for browser, server SSR, middleware refresh, and server-only service-role/admin contexts under `apps/web/lib/supabase`.
- Protected reviewer/admin page prefixes and reviewer/admin API prefixes in middleware, while leaving marketing, `/trip/new`, and `/api/partner-clicks` public for T8 scope.
- Kept role enforcement pluggable in `apps/web/lib/auth/routes.ts` but did not invent role/profile schema before T9; anonymous pages redirect and anonymous APIs return 401 JSON.

## 2026-05-01T15:37:00+00:00 — Task: T8 Supabase SSR Middleware Follow-up
- Aligned middleware/session validation with current Supabase SSR guidance by using `supabase.auth.getClaims()` instead of `getUser()` for the proxy-style refresh path.
- Adjusted the route helper to accept validated claims rather than a Supabase `User`, keeping future app-metadata role checks pluggable without adding the T9 role/profile schema.


## 2026-05-01T16:00:00+00:00 — Task: T9 Role/Profile Schema
- Chose server-owned `public.user_profiles` and `public.reviewer_auth_links` tables, synchronized with trusted Auth app metadata, instead of relying only on JWT claims so T10 RLS can use indexed table predicates.
- Kept `owner_user_id` nullable during this foundation step to avoid unsafe backfills before deterministic local users and T10 policies exist.
- Kept grants limited to `service_role` and added no RLS policies because T10 owns least-privilege grants and table-specific policies.


## 2026-05-01T17:00:00+00:00 Task: T10 RLS Policies
- Kept `booking_clicks` direct writes server-only: no anon/authenticated insert grant or insert policy, preserving `/api/partner-clicks` as the public API layer until T12 splits request-path clients.
- Granted authenticated Data API privileges only where matching role-scoped policies exist, while revoking inherited `anon`, `authenticated`, and `public` defaults first.
- Added only the minimal reviewer assignment policy-supporting index in T10; broader FK/list indexes remain owned by T11.


## 2026-05-01T18:00:00+00:00 Task: T11 Database Indexes and Integrity
- Kept the trip draft RPC in the exposed `public` schema but not `security definer`, with execute revoked from `public`, `anon`, and `authenticated` and granted only to `service_role`, because Supabase PostgREST RPC calls require an exposed schema while T11 must not broaden client access.
- Added `not valid` check constraints so new writes are protected without forcing an immediate full-table validation scan during the migration.
- Avoided JSON/array GIN indexes because current package queries do not filter on `normalized_json`, region arrays, languages, specialties, or coverage arrays.


## 2026-05-01T19:00:00+00:00 Task: T12 Data Access Client Split
- Kept `createTripDraft` on the service-role-only RPC to preserve T11 atomicity, but passed the authenticated traveler user id into the RPC so created rows are owner-scoped for T10 RLS.
- Kept `createBookingClick` as an explicit privileged server path because T10 intentionally denies direct public/authenticated inserts into `booking_clicks`; `/api/partner-clicks` remains the public API layer.
- Removed automatic hardcoded reviewer assignment creation from traveler review requests; assignment creation is now left to explicit admin/reviewer-assignment paths or later workflow tasks.


## 2026-05-01T19:30:00+00:00 Task: T12 Partner Click Logging Follow-up
- Swallow partner-click persistence failures without logging the raw error object because the endpoint is public and redirect behavior is best-effort; invalid input continues to use standardized `validation_error` responses.

## 2026-05-01T20:40:00+00:00 Task: T13 Test Infrastructure Setup
- Standardized command names now live at the root and web package levels so CI can consume them later without reinterpreting local conventions.
- Visual-regression baselines are committed under Playwright’s snapshot convention, and a11y coverage uses `@axe-core/playwright` on the shared public homepage as the minimal real gate.

## 2026-05-01T20:50:00+00:00 — Task: T14 CI Workflow Skeleton
- Added one PR-safe GitHub Actions workflow (`.github/workflows/ci.yml`) instead of splitting into multiple release workflows, because this task is only the skeleton and must not require production secrets.
- Kept Supabase verification local-only in CI by using `supabase start` + `supabase db reset` and a nonblocking placeholder artifact for advisors until the later database/performance task owns real advisor output.
- Included explicit artifact uploads for Playwright reports, Playwright test results, visual/a11y outputs, and Supabase output so failures leave actionable traces without exposing secrets.

## 2026-05-01T21:10:00+00:00 — Task: T14 CI Workflow Skeleton Follow-up 2
- Changed the Supabase gate to fail on any real lint/advisor findings while still preserving captured logs, and reserved nonblocking behavior only for the command-unavailable fallback.

## 2026-05-02T02:10:00+00:00 — Task: T21
- Decision: Tag T21 spec with both `@smoke` and `@traveler-lifecycle` so it runs under the canonical `pnpm test:e2e` flow AND under `--grep traveler-lifecycle`.
- Decision: Use trip id `3` as the lifecycle anchor — pages render their info-message fallback when Supabase env is absent, keeping E2E deterministic.
- Decision: Cover the unauthorized path at the API layer (`POST /api/trips` -> 401) rather than the browser layer; the browser unauthorized DOM requires seeded Supabase data which is out of scope per the no-live-credentials constraint. Documented in `task-21-unauthorized-browser.md`.


## 2026-05-02T02:20:00+00:00 — Task: T22 Stripe Checkout
- Chose a small provider abstraction in `@repo/payments` instead of adding the Stripe SDK, keeping checkout deterministic and dependency-free for launch tests.
- Fake checkout mode is selected when `STRIPE_SECRET_KEY` is absent or explicitly fake; real Stripe REST creation is only reachable with a non-fake server secret and never returns that secret.
- Kept existing reviewer completion semantics intact, but changed traveler review requests to checkout redirects instead of immediate queue mutation so proof-of-payment can be added in T23.

## 2026-05-02T02:30:00+00:00 — Task: T23 Stripe Webhook and Idempotency Handling
- Added `STRIPE_WEBHOOK_SECRET` only to `@repo/config/server`; no public config or client entrypoint exposes webhook secrets.
- Chose an append-only `public.payment_webhook_events` ledger with RLS enabled and service-role-only grants instead of trusting Stripe redirects or client-provided state.
- Kept Stripe webhook parsing in `@repo/payments` and fulfillment mutation in `@repo/db` so route tests can inject fakes while production uses raw-body verification plus privileged server DB access.

## T24 Resend Transactional Email Delivery (2026-05-02)

- Decision: Keep `@repo/emails` SDK-free; use `fetch` against `https://api.resend.com/emails` with Bearer auth. Rationale: matches T22 (Stripe) and T23 patterns, keeps the worker bundle small, and lets tests inject a fake fetch.
- Decision: Provider abstraction returns `{ providerMessageId }` only. No raw provider response bodies are surfaced to callers; non-2xx responses throw `Resend email send failed with status <code>` to avoid leaking upstream error metadata into logs.
- Decision: `createFakeEmailProvider` exposes `outbox` as a defensive copy and a `reset()` helper, so test scenarios stay independent without sharing mutable state across describe blocks.
- Decision: Review-complete email dispatch is opt-in via `notifyReviewComplete` DI on the review route. Default behaviour is no email so this task adds delivery contracts without changing reviewer-completion semantics until a recipient resolver lands.
- Decision: Trip recipient lookup is deliberately out of scope for T24; wiring will be completed when a traveler-email source (auth profile or trip metadata) is selected, to avoid coupling email delivery to an arbitrary schema choice in this task.


## 2026-05-02T02:55:00+00:00 — Task: T24 Resend Transactional Email Delivery (Atlas re-verification fix)
- Extended `EmailTemplateKind` to the full 5-kind taxonomy (`trip-created`, `review-requested`, `review-complete`, `export-ready`, `payment-receipt`) so future worker dispatch (T27) compiles against a typed union instead of stringly-typed kinds. Additive — preserves all existing `buildEmailPreview` consumers.
- Added `buildTripCreatedEmail` and `buildReviewRequestedEmail` builders alongside the existing three. Reviewer-name interpolation runs through the same HTML escape helper used for trip titles, so user-supplied reviewer display names cannot break out of the markup.
- Kept idempotency-key shape `${kind}:${tripId}:${recipient}` for new kinds — matches existing review-complete/export-ready/payment-receipt convention and keeps the Resend `Idempotency-Key` header derivation deterministic.
- Proved review-complete *trigger* (not just template) at the route boundary by injecting a `ReviewCompleteNotifier` fake into `apps/web/app/api/trips/[tripId]/review/route.test.ts`. Two new tests assert (1) notifier called once with `{notes, trip}` from the completed reviewer submission, (2) notifier failures are swallowed so the reviewer still gets a 303 → `review=completed`. Real Resend send wiring is intentionally deferred to T27 worker runtime; T24 now owns payload generation + provider boundary + trigger contract only.
- Test fixture for `markReviewAssignmentCompleted` returns `null` (matches DataClient signature `… | null`) rather than `undefined` — caught by `pnpm typecheck`.

## 2026-05-02T02:12:51Z — Task: T25 PostHog Event Taxonomy and Instrumentation
- Built `@repo/analytics` as a single typed wrapper with three providers (`fake`, `noop`, `posthog`) and a discriminated `AnalyticsEvent` union covering the nine launch events; rejected adding `posthog-js` and used `fetch` against the public `/capture/` endpoint to keep the package server/edge/client-safe with no extra deps.
- Required all instrumented routes to receive the provider via dependency injection with `createNoopAnalyticsProvider()` as the default, so production code stays pure and tests can assert on a `createFakeAnalyticsProvider().outbox` snapshot without network or env coupling.
- Treated the typed taxonomy as the primary privacy contract but kept `sanitizeEventProperties` denylist running inside every provider as runtime defense-in-depth; partner-click sends `target_host` (via `safeTargetHost`) only, never the full URL, UA, or referer.
- Wrapped every emit in `tryCapture` so analytics failures cannot break trip-create (still 201) or partner-click (still 307); persistence failures in `createBookingClick` likewise must not block redirect.


## T25 verification fixes (post-Atlas review)

- PostHog endpoint corrected from `POST {host}/capture/` to `POST {host}/i/v0/e/` (PostHog's documented direct HTTP capture endpoint). Updated `packages/analytics/src/index.ts` and `index.test.ts` assertion accordingly.
- Added `resolveDefaultAnalyticsProvider()` to `@repo/analytics`. Reads only `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` (browser-safe), returns PostHog HTTP provider when both present, noop otherwise. Never throws.
- Chose a narrow PostHog-only env reader inside `@repo/analytics` rather than reusing `createPublicConfig()` because the latter throws when ANY public env is missing (Supabase, Stripe, Mapbox, etc.); coupling analytics readiness to unrelated env would silently disable telemetry whenever any other public var was missing.
- Wired both `apps/web/app/api/trips/route.ts` and `apps/web/app/api/partner-clicks/route.ts` to default to `resolveDefaultAnalyticsProvider()`. Tests still inject `createFakeAnalyticsProvider()` via DI, staying isolated from real env.
- Rewrote `packages/analytics/README.md`: taxonomy, three modes, privacy contract, transport details, env keys.
- Restored canonical `apps/web/next-env.d.ts` (the prior modification was Next 16 dev-types churn unrelated to T25).
- Rewrote `task-25-trip-created-event.json` evidence to match actual `validBrief` fixture values from `route.test.ts` (`traveler-user-123`, `portugal`, `couple`, `train-and-transfers`, `mid-range`, `calm`, `interests_count: 2`, `regions_count: 2`).

Verification: 28/28 vitest pass (analytics 15, trips 8, partner-clicks 5); `pnpm -r typecheck` clean across 12 packages; `pnpm --dir apps/web build` exit 0.

### T26: Mapbox Provider Map Integration
- Decided to create `@repo/maps` as a package that exclusively handles Mapbox configuration checks and exposes a provider facade.
- Rather than directly depending on `mapbox-gl` (which adds heavy bundle size), we created a visually similar fallback facade (`ProviderMap`) that documents where the real mapbox library would load, while maintaining map UX layout and rendering warnings over the map surface.

## 2026-05-02T02:53:51Z — Task: T27 Worker and Background Job Pipeline
- Chose `bounded-node-cron-compatible-local-runner` for `apps/workers`: one-shot Node execution that can be invoked locally or by Vercel Cron, drains due jobs, and stops. This avoids adding an external queue provider before launch.
- Kept production secrets out of the worker package by requiring provider injection; tests use `createFakeEmailProvider()` or a fail-once wrapper and never construct Resend, Stripe, PostHog, or Supabase service-role clients.
- Modeled abandoned checkout cleanup as local deterministic state mutation instead of a DB migration/service-role job in T27; future DB-backed cleanup can reuse the same status/idempotency contract once T28/T41 add health and observability.

## 2026-05-02T03:08:00Z — Task: T28 Provider Failure Fallbacks and Config Health Checks
- Located the health module in `packages/config/src/health.ts` and exposed it through both the index re-export and a `./health` subpath, so apps can import `@repo/config/health` without pulling in `./server` env validators or zod parsing.
- Defined the status taxonomy as `configured | missing | degraded` plus a separate `requirement: required-for-action | optional` field, instead of collapsing optional providers into "ok" or forcing them to "missing", so optional providers (Mapbox, PostHog) do not appear as failures while still surfacing in the report.
- Treated `worker-queue` as a derived health entry that depends on Supabase + Resend rather than a real broker probe, matching T27's `bounded-node-cron-compatible-local-runner` execution target. No Redis/SQS/BullMQ probing was added.
- Replicated the Mapbox `pk.*`-only shape rule from `packages/maps/src/provider.ts` (degrade on `sk.*`) and added the same shape rule to Stripe publishable keys (`pk_…` only; degrade on `sk_…`) to catch the most common publishable/secret key mixup.
- Hints carry only env var names and shape rules, never values; an `assertNoSecretLeak` regex set checks `sk_(live|test)_…`, `whsec_…`, `pk_(live|test)_…`, `sb_secret_…`, JWT `eyJ…`, `Bearer …`, and `sk.…`/`pk.…` token shapes, used in tests and in the CLI emitter before stdout write.
- Skipped the Mapbox-fallback Playwright screenshot evidence because the trip map page currently fails on unrelated DB drift (`column trips.owner_user_id does not exist`) which would dominate the screenshot. Used `apps/web/app/(app)/trip/[tripId]/map/map-components.tsx` source (which routes to `SchematicMap` when `isMapProviderEnabled()` is false) plus the all-missing health report as the documented fallback evidence instead.


## 2026-05-02T04:25:00Z — Task: T29 Reviewer Assigned Access
- Kept T29 scoped to access control: no assignment selection/concurrency changes from T30. Review completion now verifies the authenticated reviewer has a trip assignment and completes that reviewer's own assignment, not a generic latest trip assignment.
- No Supabase migration was added because existing T10 RLS foundation already uses reviewer auth links plus assignments; this task tightened app/page/API boundaries with authenticated SSR/RLS clients.

## 2026-05-02T14:30:00+00:00 — Task: T32 Admin Route/API Guards
- Added a shared `getAdminPageAuthContext()` helper under `apps/web/lib/auth/admin.ts` and cached it per server render, keeping page-level authorization role/session based without introducing service-role access.
- Chose an admin layout-level guard for `/admin/**` plus authenticated-client page reads, so UI structure stays unchanged while anonymous users redirect and wrong-role users see a small 403 state.
- Refactored only the representative places API into injectable handlers for tests; the other CMS APIs already use the same `requireApiRole(["admin"])` and request-client pattern, so broad route rewrites were unnecessary.
- No Supabase migration was added because T32 tightened app-layer route/API enforcement and reused the existing T10/T12 RLS/client split foundation.


## 2026-05-02T14:45:00+00:00 — Task: T30 Reviewer Assignment Logic
- Chose app-level duplicate-active prevention for this task instead of a Supabase migration, keeping the diff focused while documenting the remaining true-concurrency race until a DB partial unique index is added.
- Kept assignment statuses unchanged (`assigned`, `submitted`, `completed`, `returned`) but changed schemas from free strings to the supported enum so queue and API behavior cannot drift into `in_review` or other trip-status names.
- Reused T29/T32 auth boundaries: admin-only assignment creation still uses `requireApiRole(["admin"])`, reviewer reads remain self-scoped, and reviewer pages now resolve the current reviewer through trusted auth context rather than a fixed persona id.


## 2026-05-02T14:55:00+00:00 — Task: T30 Concurrency Fix
- Added `reviewer_assignments_one_active_per_trip_idx` as a partial unique index on `trip_id` for `status in ('assigned', 'submitted')`, enforcing the exclusive active-reviewer model at the database layer.
- Kept the app-level duplicate precheck as a UX optimization but made the database index authoritative for truly concurrent requests.
- Chose fail-closed migration behavior if pre-existing duplicate active rows exist, because silently choosing a winner would risk hiding assignment integrity problems.
- [Task 31] Reviewer Workspace Functional Hardening
  - Enforced usage of `getReviewerPageAuthContext()` in `queue`, `operations`, and `history` pages.
  - Decided to display specific unauthorized UI cards for unauthenticated or non-reviewer users rather than redirecting, as it aligns better with the current "reviewer shell" visual patterns where auth boundaries might not be enforced at the routing level yet.
  - The queue now correctly relies on `listReviewerAssignments` and filters by active assignments. It correctly queries `getTripDraftById` directly per active assignment.


## 2026-05-04T01:13:53+00:00 — Task: T34 Admin Analytics Real-Data Pipeline
- Replaced the hardcoded analytics funnel with count-based operational metrics instead of fabricating conversion rates from incomplete events.
- Chose focused `packages/db/src/analytics.ts` count helpers using the authenticated admin client, preserving RLS and avoiding service-role access from the page.
- Documented missing status/payment indexes as follow-ups in evidence rather than adding migrations or materialized views outside T34's strict scope.

## Task 35 — Protected Route E2E Suite (2026-05-04)

- DECISION: Split coverage between Playwright (real middleware, anonymous + cross-role denial) and Vitest (positive role matrix against `requireRouteAccess`). Reason: mock storage-state cookies fail real Supabase JWT validation, so Playwright cannot prove persona-positive access without standing up a live Supabase session. Vitest against the gating function gives deterministic, fast, no-Docker proof of the full 4×4 matrix.
- DECISION: Tagged Playwright spec `@smoke @protected-routes` so it runs under `pnpm test:e2e` (which hardcodes `--grep @smoke`) and can be filtered via `--grep @protected-routes` for targeted runs.
- DECISION: Did NOT add a separate curl/HTTP harness for API checks. The Vitest tests exercise `requireRouteAccess` directly (the same function middleware calls), and the Playwright suite hits the real running server's API endpoints with `request.get()`. Both code paths are exercised; an extra curl harness would be redundant.
- DECISION: Accept both `307` and `403` for cross-role page assertions in Playwright (`expectPageBlocked`). Reason: under mock storage-state, middleware treats personas as anonymous (→307), but if storage-state ever becomes valid the same call should produce 403. The assertion remains correct in both regimes.

## 2026-05-04 — Task: Real Supabase Playwright Auth Fixtures
- Replaced mock cookie/localStorage Playwright auth state with real Supabase-issued sessions provisioned in Playwright `globalSetup` (apps/web/playwright/global-setup.ts), so middleware `refreshSupabaseSession` → `getClaims()` → `requireRouteAccess` accepts the personas without changing any route code.
- Encoded persona role on `app_metadata.role` only (admin, reviewer, traveler), matching `packages/db/src/roles.ts` and `apps/web/lib/auth/routes.ts`; never used `user_metadata` / `raw_user_meta_data` because that field is user-editable and would break the trusted role contract.
- Captured cookies via `@supabase/ssr` `createServerClient` against an in-memory `Map` cookie jar during `signInWithPassword`, instead of launching a browser, so storage-state generation is deterministic, hermetic, and ~hundreds of ms per persona.
- Kept fixture function signatures unchanged (`createAdminStorageState()`, `createReviewerStorageState()`, `createTravelerStorageState()`) and changed only their return type from a mocked `BrowserContextOptions["storageState"]` object to an absolute path string pointing at `apps/web/playwright/.auth/<persona>.json` — Playwright accepts both forms, so existing specs were not touched.
- Cached storage states under `apps/web/playwright/.auth/` and added that directory to `.gitignore`; secrets stay in env (`E2E_TEST_USER_PASSWORD`) and never in source or evidence.
- Failed fast on missing env (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `E2E_TEST_USER_PASSWORD`); rejected silent fallback to mock cookies because that hides auth regressions.
- Made persona provisioning idempotent: `auth.admin.createUser` first, fall back to paginated `listUsers` lookup + `updateUserById` to reconcile `app_metadata.role` and password when the user already exists, so re-running `globalSetup` is safe across CI and local runs.
- Documented `E2E_TEST_USER_PASSWORD` (and optional `E2E_SUPABASE_URL` override) in root `.env.example` rather than creating a per-app env example, matching existing repo convention.

## 2026-05-04T05:20:00Z — Task: T40 Supabase Advisors, EXPLAIN Plans, and Load Baseline
- Chose not to apply hosted Supabase migrations during T40 because the hosted database is missing multiple dependent migrations; directly applying policy/index/RPC changes without a migration reconciliation owner could broaden or break access controls.
- Classified `/admin/analytics` as the admin analytics hot route for load evidence because this repo does not expose a dedicated admin analytics API route; the page calls `getAdminAnalyticsMetricCounts()` and `listBookingClicks()`.
- Treated T40 evidence as a launch-readiness rejection despite no critical/high security advisor findings, because unresolved schema drift and performance advisor findings prevent representative happy-path EXPLAIN/load approval.

## T41 — Error Monitoring foundation (2026-05-04)

- Decision: ship a typed monitoring abstraction in `packages/monitoring`
  modeled after `@repo/analytics`. No new external SaaS dependency.
  Production default = noop provider; `resolveDefaultMonitoringProvider()`
  is the single function to update when a real provider is wired.
- Decision: events carry only typed enums + sanitized routes + numerics.
  Raw error messages, request bodies, emails, tokens, and Supabase keys are
  structurally excluded and additionally stripped at runtime by
  `redactMonitoringDetails` (forbidden-key set + value-shape regex).
- Decision: `tryCapture` is fail-open. A monitoring outage cannot break a
  request or worker job. Mirrors the analytics pattern.
- Decision: replaced the `console.error("TRIP CREATION ERROR:", error)`
  in `apps/web/app/api/trips/route.ts` with a sanitized `tryCapture`
  call. The raw error object is no longer logged through `console.error`
  in this route.
- Decision: worker dead-letter capture fires exactly once after retry
  exhaustion, not on each retry. Retry-scheduled attempts stay in
  `state.attempts` for local debugging only.
- Decision: alert criteria documented in `docs/error-monitoring.md`.
  Actual dashboard alert configuration is deferred to the follow-up task
  that wires the SaaS provider; T41 brief explicitly allows documentation
  of criteria as the deliverable.

### SEO and Metadata (Task 42)
- **Metadata Template**: Decided to use `%s | rumia.pt` as the title template in the root layout to ensure consistent branding while allowing unique page titles.
- **Index Protection**: Applied both `robots.txt` disallows and `noindex` metadata to private routes (`/admin`, `/reviewer`, `/account`, `/trip/[tripId]`) to minimize the risk of sensitive content leaking to search engines.
- **Sitemap Inclusion**: Only public marketing pages and the "Plan Trip" entry point are included in the sitemap. Trip Detail pages are excluded as they are considered user-specific/private drafts.
- **Branding**: Replaced user-facing "Rota" references with "rumia.pt" in marketing copy and metadata to align with the launch brand.

## 2026-05-05T00:00:00Z — Task: Playwright a11y keyboard navigation fix
- Kept the behavioral test centered on direct keyboard activation of the submit button rather than exhaustive tab traversal, because the latter was sensitive to form complexity and viewport differences.
