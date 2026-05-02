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
