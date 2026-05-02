# Learnings


## 2026-05-01T14:18:45+00:00 — Task: T1 Secret Lockdown
- `.env.local` and `apps/web/.env.local` exist locally with Supabase env names, but they are ignored/untracked; never print their values in future evidence.
- Tracked env-sensitive paths from the required set are `.env.example`, `README.md`, and `packages/db/src/index.ts`; `supabase/README.md` also documents the same env setup.
- Supabase key hygiene guidance: browser code may use publishable/anon keys, while service_role/secret keys are backend-only and bypass RLS; prefer `sb_secret_...` for server code when available.

## 2026-05-01T00:00:00Z — Task: T2 Provider Audit
- `packages/payments` and `packages/emails` already provide deterministic plan/preview contracts, which makes them safe launch anchors for Stripe Checkout and Resend without adding provider code yet.
- `packages/analytics`, `packages/maps`, and `packages/config` are README-only placeholders, so T7/T25/T26 need to treat them as scaffolded surfaces rather than production-ready integrations.
- `apps/workers` already models export/review/routing jobs deterministically, so T27 can focus on runtime delivery rather than redesigning job semantics.
- Launch defaults are now locked for audit purposes: Stripe Checkout, Resend transactional email, PostHog product analytics, and Mapbox maps.

## 2026-05-01T14:31:05Z — Task: T3 Access Inventory
- Glob enumeration found 22 `page.tsx` route files and 14 API `route.ts` files; all are recorded in `.sisyphus/evidence/future-roadmap/task-3-access-matrix.md`.
- There is no `apps/web/middleware.{ts,tsx}` and only the root app layout, so current access behavior is file-local: schema validation, paid-trip checks, object existence checks, and redirect query state rather than session/role guards.
- Current reviewer/admin test assumptions are mock cookie/localStorage states, while production targets must use authenticated Supabase users plus trusted role mapping and later RLS.

## 2026-05-01T00:00:00Z — Task: T4 Roadmap Reconciliation
- Audit rule: route existence is not enough to call a roadmap item production-complete, especially for `/trip/new`, `/trip/[tripId]`, and `/trip/[tripId]/map`.
- Provider packages stay classified as deterministic or scaffolded contracts until the live provider integrations are wired.
- Completed Stitch slices 4 through 7 remain UI-complete only, and the audit should not reopen them as fresh UI redesign work.

## 2026-05-01T14:42:01Z — Task: T5 QA Performance Baseline
- Root and web package scripts currently only expose build/typecheck; no lint/test/e2e/visual/a11y/lighthouse/analyze/web-vitals scripts were present in the repo scan.
- `apps/web/playwright/fixtures/admin-auth.ts` and `reviewer-auth.ts` already model mocked auth state, which is useful evidence for future Playwright persona work but not a replacement for real auth tests.
- `pnpm --dir apps/web build` and `pnpm --dir apps/web typecheck` both passed; Next.js warned about inferred workspace root because of multiple lockfiles, but the build still completed.
- Baseline routes `/trip/new`, `/trip/3`, `/trip/3/map`, `/trip/3/export`, `/reviewer/queue`, and `/admin/analytics` all returned HTTP 200 and rendered `rumia.pt` on the production build.

## 2026-05-01T14:50:21Z — Task: T6 Supabase Schema Audit
- Supabase MCP read-only access was available and confirmed eight public tables with RLS enabled, zero RLS policies, primary-key-only indexes, no public views, and no public functions.
- Current catalog grants differ from migrations: migrations grant CRUD to `service_role`, while the catalog reports broad `anon` and `authenticated` privileges that are currently blocked only because RLS has no policies.
- Hot DB paths are concentrated in `packages/db/src/*.ts`: trip detail/list joins, reviewer assignment queues/history, booking-click analytics, and admin CMS lists ordered by `created_at`.

## 2026-05-01T15:09:49+00:00 — Task: T7 Config Registry
- Added `packages/config` as a typed env registry with separate public and server factories.
- Web integration now uses the config package in `apps/web/tsconfig.json` and `apps/web/next.config.ts`; the root layout stays unaffected.
- Verified `pnpm typecheck`, `pnpm --dir apps/web build`, a redacted missing-env scenario, and a client-secret scan with no server-secret matches.

## 2026-05-01T15:27:00+00:00 — Task: T8 Supabase SSR Middleware
- Current Supabase SSR guidance uses `@supabase/ssr` browser/server clients with cookie `getAll`/`setAll`; this implementation validates auth-sensitive checks with `auth.getUser()`.
- Middleware can depend on a narrow `createPublicSupabaseConfig()` so missing Stripe/PostHog/Mapbox env does not break public route checks.
- Anonymous QA confirmed `/`, `/portugal`, and `/trip/new` remain HTTP 200, while `/reviewer/queue`, `/admin/places`, and `/api/reviewer-assignments` are blocked deterministically.


## 2026-05-01T16:00:00+00:00 — Task: T9 Role/Profile Schema
- Supabase role authorization is now grounded in trusted `raw_app_meta_data.role`/`app_metadata` claims plus server-owned `public.user_profiles`; `user_metadata` remains display-only for local persona labels.
- Direct nullable `owner_user_id` columns on `trip_briefs` and `trips` are the simplest durable launch prerequisite for T10 traveler-owner RLS and avoid an extra ownership join on hot trip reads.
- Reviewer self/assignment policy prerequisites now have a trusted `reviewer_auth_links` mapping from auth user to reviewer id, preserving the existing local `ines-almeida` scaffold as a non-production persona link.


## 2026-05-01T16:20:00+00:00 Task: T9 Role/Profile Schema Follow-up
- Root-executed ESM scripts under `/scripts` need their runtime imports declared in the root `package.json` because `/scripts` is not a workspace package; adding `@supabase/supabase-js` at root lets `node scripts/seed-local-personas.mjs` reach safe env validation.


## 2026-05-01T17:00:00+00:00 Task: T10 RLS Policies
- Added the T10 policy foundation in a new migration using private security-definer helpers outside the exposed public schema, explicit `TO authenticated` policies, and wrapped auth helper calls.
- Traveler isolation now keys off T9 `owner_user_id`; reviewer isolation keys off T9 `reviewer_auth_links` plus `reviewer_assignments`; admin access keys off trusted `user_profiles`/`app_metadata` role foundation.
- Public-safe reads were interpreted as no direct anon table reads for this task because marketing and `/api/partner-clicks` do not require public Data API table exposure.


## 2026-05-01T18:00:00+00:00 Task: T11 Database Indexes and Integrity
- Hot T11 indexes were mapped to concrete package queries and T10 policy predicates: newest-first trip/CMS lists, trip-brief joins, reviewer assignment reviewer/trip/status paths, and booking-click partner/trip/date analytics.
- `createTripDraft` now uses a single service-role-only Postgres RPC, so the `trip_briefs` and `trips` inserts run in one database statement transaction instead of two client round trips.
- Supabase index docs note that planners can still prefer seq scans on tiny seed tables, so future live EXPLAIN evidence should judge representative data or document tiny-table row counts.


## 2026-05-01T19:00:00+00:00 Task: T12 Data Access Client Split
- DB helpers now accept injected data clients so API routes can use the Supabase SSR authenticated request client and T10 RLS instead of implicit service-role access.
- Non-privileged DB helpers default to the public anon/RLS client; privileged defaults are isolated to the T11 trip-draft RPC and T10 server-owned booking-click insert path.
- Shared API auth uses Supabase SSR `auth.getClaims()` plus trusted app metadata role normalization; no TypeScript authorization references to `user_metadata` or `raw_user_meta_data` were found.

## 2026-05-01T20:40:00+00:00 Task: T13 Test Infrastructure Setup
- Vitest works cleanly for deterministic package logic when each package owns its own `vitest.config.ts`; the root config is optional but a package-local config avoids empty-glob resolution issues.
- Playwright storage-state fixtures typecheck best when they return `NonNullable<BrowserContextOptions["storageState"]>` and use the actual local dev host (`127.0.0.1`) rather than `localhost`.
- The current landing-page hero copy is the stable smoke assertion target; seeded auth personas can be validated as storage-state conventions without needing live Supabase sign-in yet.

## 2026-05-01T20:50:00+00:00 — Task: T14 CI Workflow Skeleton
- CI should keep `typecheck` before `build`; rerunning `tsc` after `next build` can hit a generated `.next/types/validator.ts` import mismatch even though the pre-build typecheck passes.
- The repo already provides the right CI-facing script surface (`lint`, `test`, `typecheck`, `build`, and `apps/web test:e2e`) so the workflow can stay thin and secret-free.
- Playwright artifacts are already aligned with `apps/web/playwright-report` and `apps/web/playwright/test-results`, making artifact upload wiring straightforward.

## 2026-05-01T21:00:00+00:00 — Task: T14 CI Workflow Skeleton Follow-up
- GitHub Actions pnpm setup is safest when `pnpm/action-setup` comes before `actions/setup-node` caching in each job.
- For Supabase CI, prefer a real CLI-discovered local check after `supabase db reset` and capture its output; only the advisor/lint step should degrade gracefully when the local CLI or container runtime is unavailable.
- Recording `supabase db --help` output is a cheap way to prove the CI job is using the current local CLI surface instead of a hardcoded assumption.

## 2026-05-01T21:10:00+00:00 — Task: T14 CI Workflow Skeleton Follow-up 2
- The Supabase advisor/lint gate must fail on real findings after preserving output; only the command-unavailable branch is a skeleton limitation.

## 2026-05-02T02:10:00+00:00 — Task: T21 Core Trip Lifecycle E2E Suite
- `apps/web/package.json` `test:e2e` hardcodes `--grep @smoke`. Tag any new lifecycle/lifecycle-adjacent suites with `@smoke` plus a domain tag (e.g. `@traveler-lifecycle`) so both `pnpm test:e2e` and direct `--grep <domain>` invocations match.
- `pnpm test:e2e -- --grep <foo>` does NOT additively narrow the grep — pnpm's `--` makes the second `--grep` a positional arg, leaving the script's own `--grep @smoke` in effect. Run direct `pnpm exec playwright test --config playwright.config.ts --grep <foo>` for tag intersection.
- Trip lifecycle pages (`/trip/[id]`, `/trip/[id]/map`, `/trip/[id]/export`) gracefully fall back to an info-message branch when Supabase env vars are absent (via `isPersistenceConfigError`), which keeps E2E coverage deterministic without live Supabase. Use stable `data-testid` headers: `trip-overview-header`, `trip-map-header`, `trip-export-header`.
- The unauthorized "Trip not found" DOM branch in `/trip/[tripId]/page.tsx` only renders when a real trip row exists with a foreign `owner_user_id`; cannot be triggered without seeded Supabase data, so the negative case is covered at the API layer (`POST /api/trips` -> 401 `unauthenticated`).


## 2026-05-02T02:20:00+00:00 — Task: T22 Stripe Checkout
- Checkout creation now has deterministic fake-mode coverage, so CI can verify Stripe-shaped URLs and metadata without live Stripe credentials or network calls.
- Current task intentionally leaves payment fulfillment state unchanged: checkout creation redirects only, while paid/review queue mutation remains webhook-owned by T23.
- Route-level checkout tests can inject auth, trip lookup, and checkout providers, matching the existing API test pattern from trip creation while preserving Supabase auth guards in production.

## 2026-05-02T02:30:00+00:00 — Task: T23 Stripe Webhook and Idempotency Handling
- Stripe webhook verification is dependency-free in `@repo/payments`: tests generate deterministic HMAC SHA-256 `v1` signatures from raw payloads and fixture webhook secrets, so no Stripe CLI/network is needed.
- Webhook fulfillment uses a separate privileged DB path plus `payment_webhook_events` as an insert-first idempotency ledger; duplicate event IDs return safe success before trip updates.
- Human-review checkout fulfillment is webhook-owned: verified `purchase_kind=human_review` first unlocks the trip, then queues `in_review`, preserving T22 redirect behavior as non-authoritative.

## 2026-05-02T02:45:00+00:00 — Task: T23 Follow-up
- `.env.example` and `packages/config/README.md` now list `STRIPE_WEBHOOK_SECRET` as server-only config; never prefix webhook signing secrets with `NEXT_PUBLIC_`.
- Signed malformed webhook payloads are treated as HTTP 400 bad requests while signature mismatches and stale timestamps preserve the existing rejection path.
- Config package env validation throws `ConfigValidationError`, not the DB package persistence-env error; routes using `@repo/config/server` need to classify that error explicitly for safe 503 responses.

## T24 Resend Transactional Email Delivery (2026-05-02)

- packages/emails was preview-only; extending in place avoided a sibling-package proliferation and kept `buildEmailPreview` consumers (5 web pages) untouched.
- Mirrored T22/T23 fetch-based provider pattern (no SDK dep) to keep `@repo/emails` zero-runtime-deps. `createResendEmailProvider({ apiKey, fetch? })` accepts an injected fetch for deterministic tests.
- Idempotency key shape `<kind>:<tripId>:<recipient>` doubles as the Resend `Idempotency-Key` header and avoids leaking PII or secrets while still de-duplicating retries at the provider edge.
- HTML bodies are rendered via `escapeHtml` because trip titles flow from user input via the brief; tests assert `<script>` payloads survive as `&lt;script&gt;`.
- Server-only Resend config now has its own narrow factory `createServerResendConfig()` alongside `createServerStripeSecretConfig`, so routes/workers can opt into just the resend secret without forcing every other server env to be present.
- Email dispatch on review completion is wired as an optional `notifyReviewComplete` DI hook with a try/catch swallow — email failures must never block the reviewer completion redirect or the assignment-completed bookkeeping.


## 2026-05-02T02:55:00+00:00 — Task: T24 Resend Transactional Email Delivery (Atlas re-verification fix)
- Atlas distinguishes between *template payload coverage* and *trigger wiring*. The first T24 pass shipped review-complete/export-ready/payment-receipt builders but had no test proving the route actually invokes the notifier — that gap was the rejection reason, not the templates themselves. Lesson: when a task acceptance line says "send email when X happens", deliver both a deterministic payload test in the email package AND a route/handler test that asserts the dispatch hook fires (and is failure-isolated from the user-facing redirect/response).
- HTML escaping must cover every interpolated user-controlled string, not just the trip title. The reviewer-display-name path (`Inês <Specialist>`) was an easy miss until the new `review-requested` template forced an explicit escape test.
- DI-style notifier hook (`notifyReviewComplete?: ReviewCompleteNotifier`) plus a default no-op keeps existing route consumers and tests untouched while making the trigger trivially testable. Pattern worth reusing for other side-effect dispatches (export-ready, payment-receipt) in T27.
- `pnpm typecheck` (turbo) catches fixture-vs-signature mismatches that vitest happily ignores at runtime — `() => Promise<undefined>` vs declared `… | null` return type. Always run typecheck after touching test stubs that mirror real DataClient methods, even when vitest is green.
- Recursive grep over the workspace root will hit `.next/` build artifacts and burn the 120s timeout. Scope secret-boundary scans to `packages/config/src`, `apps/web/{app,components,lib}` etc. via the Grep tool with explicit `path` and `include` instead of shelling out to `grep -r .`.

## 2026-05-02T02:12:51Z — Task: T25 PostHog Event Taxonomy and Instrumentation
- `packages/analytics` was a README-only placeholder; mirroring `packages/emails` (ESM, `exports: "./src/index.ts"`, vitest devDep, root `tsconfig.json` path aliases for both `@repo/analytics` and `@repo/analytics/*`) was sufficient to make it a first-class workspace package without touching turbo config.
- `createBookingClick` returns the full `BookingClick` row (id, partnerId, partnerName, tripId, source, target, referer, userAgent, createdAt), so test mocks must satisfy the full type — a `fakeBookingClick()` helper kept the five partner-click tests typesafe under repo-wide `tsc --noEmit`.
- The pre-existing empty `catch {}` in `apps/web/app/api/partner-clicks/route.ts` is intentional (preserve redirect on DB failure); kept the explanatory comment because removing it would make the swallow look like a bug to future readers.
- Repo-wide `pnpm -r typecheck` passes across 12 packages with the new analytics wiring; `pnpm test` has unrelated pre-existing visual baseline failures, so T25 verification used targeted vitest runs (`@repo/analytics` 15/15, `apps/web/app/api/trips/route.test.ts` 8/8, `apps/web/app/api/partner-clicks/route.test.ts` 5/5) plus repo-wide typecheck.


## T25 — testing env-dependent factories deterministically

When a factory reads `process.env` (e.g. `resolveDefaultAnalyticsProvider`),
test it via a small `withEnv(overrides, fn)` helper that:

1. snapshots the original values of ONLY the keys it touches,
2. sets/deletes the keys for the duration of `fn()`,
3. restores or deletes them in a `finally` block.

This keeps tests deterministic across run order, avoids leaking env into
unrelated tests in the same file, and never depends on real env or
network. Pattern lives in `packages/analytics/src/index.test.ts` (block
`describe("resolveDefaultAnalyticsProvider")`).

### T26: Mapbox Provider Map Integration
- The map abstraction requires safe checking of `NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN`.
- To avoid Next.js hydration issues when deciding between a fallback component and a lazily-loaded provider component, use a `useClient` state check inside an effect combined with initial SSR rendering of the fallback.
- For Playwright testing without modifying environment variables, we implemented a safe backdoor using `typeof window !== 'undefined' && window.location.search.includes('forceMapboxProvider=1')` which only affects the client and cleanly enables deterministic provider screenshots.
