# Rumia Phase 6 Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove and safely activate Rumia’s complete route, data, provider, worker, accessibility, performance, observability, and rollback contracts in staging and production.

**Architecture:** Readiness is a persisted evidence decision rather than a feature-flag shortcut. Database migrations and policy matrices are reconciled against hosted Supabase; durable jobs use leases, attempts, idempotent effects, verified QStash delivery, and dead-letter states; provider canaries write privacy-safe evidence. CI and a complete route/persona/state matrix block release until every required artifact is current.

**Tech Stack:** pnpm 10.34.5, Node 24, Next.js 16, Supabase CLI 2.109.1/Postgres 17, QStash 2.11.1, Stripe, OpenAI adapter, Resend adapter, MapLibre/CARTO, Sentry Next.js/Node 10.65.0, PostHog/no-op analytics adapter, Vitest, Playwright, axe, and GitHub Actions.

## Global Constraints

- Upgrade and pin pnpm to `10.34.5`; versions below `10.34.0` are prohibited because of CVE-2026-50017 and related 2026 package-manager hardening fixes.
- No hosted mutation occurs before a dry-run, backup/restore checkpoint, migration-order review, and explicit environment confirmation.
- Production migration history is never repaired automatically; `db reset --linked` is forbidden and rollback is forward-fix first, with PITR reserved for disaster recovery.
- Feature flags default off; readiness additionally requires credentials, migration evidence, RLS evidence, provider evidence, and capability evidence where applicable.
- Production never uses fixture, deterministic provider, in-memory worker, permissive signature, or no-op monitoring behavior for an enabled feature.
- Job side effects are idempotent at the database boundary even when the queue’s deduplication window expires.
- Logs, traces, analytics, canaries, and errors exclude trip prose, message bodies, email addresses, tokens, precise accommodation, payment identifiers, and private Storage URLs.
- QStash wakeups contain only job ID, kind, correlation ID, and schema version. Sentry Session Replay and error Replay sampling are both `0`.
- Every route/persona/state visual is regenerated only from a production build and successfully authenticated seeded persona.
- Public/traveler p75 budgets are LCP ≤2.5s, INP ≤200ms, CLS ≤0.10; operator mobile LCP ≤3.5s; all other operator p75 budgets match public.
- Initial compressed JavaScript is public ≤220KB, planner/trip ≤320KB, operator ≤300KB excluding a lazy map chunk; no measured interaction contains a task over 50ms.
- Activation is one capability/provider at a time with a production canary, 30-minute alert-free observation, and verified flag-off rollback.

---

### Task 6.1: Secure the toolchain and reconcile local/hosted Supabase history

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.github/workflows/ci.yml`
- Create: `scripts/check-package-manager-version.mjs`
- Create: `scripts/check-package-manager-version.test.mjs`
- Create: `scripts/reconcile-supabase-migrations.mjs`
- Create: `scripts/reconcile-supabase-migrations.test.mjs`
- Create: `docs/ops/supabase-migration-runbook.md`
- Modify: `docs/ops/backup-restore.md`
- Modify: `docs/ops/launch.md`
- Modify: `docs/ops/deploy-rollback.md`
- Modify: `supabase/README.md`

- [ ] **Step 1: Write failing tool/migration tests** that reject pnpm below `10.34.5`, duplicate/out-of-order local migrations, hosted-only versions, checksum divergence, unapplied local versions, wrong project reference label, and missing backup/restore evidence.
- [ ] **Step 2: Run** `node --test scripts/check-package-manager-version.test.mjs scripts/reconcile-supabase-migrations.test.mjs` **and confirm missing scripts.**
- [ ] **Step 3: Pin `packageManager` and CI Corepack to `pnpm@10.34.5`, regenerate the lockfile with that binary, and add a zero-secret-output version guard.** Never print npm/Supabase configuration or tokens.
- [ ] **Step 4: Implement read-only reconciliation first:** consume `supabase migration list --linked` output through a parser, compare version/name/checksum evidence, and emit only version/status labels. The runbook requires environment banner, operator identity, backup ID label, dry run, ordered apply, policy tests, advisors, rollback criteria, and evidence path.
- [ ] **Step 5: In staging, run** `pnpm exec supabase --help`, `pnpm exec supabase migration --help`, `pnpm exec supabase db --help`, then use the exact supported commands to link, list, dry-run/apply, lint, and run advisors. Never infer hosted success from a local reset.
- [ ] **Step 6: Run tests, local reset/lint/policy matrices, a backup restore drill, and commit** with `git commit -m "chore: secure toolchain and migration reconciliation"`.

### Task 6.2: Replace in-memory workers with durable leased jobs and verified QStash

**Files:**
- Create: `apps/workers/src/job-repository.ts`
- Create: `apps/workers/src/job-repository.test.ts`
- Create: `apps/workers/src/job-runner.ts`
- Create: `apps/workers/src/job-runner.test.ts`
- Create: `apps/workers/src/qstash.ts`
- Create: `apps/workers/src/qstash.test.ts`
- Modify: `apps/workers/src/index.ts`
- Modify: `apps/workers/src/index.test.ts`
- Modify: `apps/workers/src/plan.ts`
- Modify: `apps/workers/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/types/src/worker-jobs.ts`
- Create: `packages/types/src/worker-jobs.test.ts`
- Create via CLI: `supabase/migrations/*_create_durable_worker_jobs_and_attempts.sql`
- Create: `supabase/policy-tests/phase-6-worker-matrix.sql`

**Interfaces:**

```ts
export type DurableJobState = "queued" | "leased" | "running" | "retry_wait" | "succeeded" | "dead_letter" | "canceled";

export type JobLease = {
  jobId: string;
  attemptId: string;
  leaseToken: string;
  leaseExpiresAt: string;
  idempotencyKey: string;
};
```

- [ ] **Step 1: Write failing tests** for atomic claim, `FOR UPDATE SKIP LOCKED`, lease expiry/recovery, heartbeat, bounded exponential backoff with jitter, max attempts, dead letter, cancellation, concurrent delivery, duplicate effect, crash before/after effect, and queue-unavailable polling fallback.
- [ ] **Step 2: Write failing QStash tests** for missing/invalid/current/next signing key, exact raw body and URL verification, replayed message ID, `Upstash-Retried`, and publishing with `Upstash-Deduplication-Id` while retaining database idempotency beyond QStash’s ten-minute window.
- [ ] **Step 3: Generate durable jobs/attempts/effects schema** with unique type/idempotency key, lease token/expiry/heartbeat, attempt history, next run, terminal error code, result checksum, and no direct client access.
- [ ] **Step 4: Pin `@upstash/qstash` to `2.11.1` and replace `LocalWorkerState` plus permissive signature code.** Use async `Receiver.verify({ body, signature, url })` with current/next signing keys; publisher uses SDK `deduplicationId` (HTTP `Upstash-Deduplication-Id`), while database uniqueness remains authoritative beyond the ten-minute queue window.
- [ ] **Step 5: Route generation, export, email, review notifications, analytics aggregation, and provider canaries through registered handlers** with one idempotent effect record per external side effect.
- [ ] **Step 6: Run worker concurrency/fault tests, policy matrix, typecheck, and commit** with `git commit -m "feat: make worker execution durable"`.

### Task 6.3: Persist composite readiness and provider canary evidence

**Files:**
- Create: `packages/monitoring/src/provider-smoke.ts`
- Create: `packages/monitoring/src/provider-smoke.test.ts`
- Modify: `packages/monitoring/src/index.ts`
- Modify: `packages/config/src/readiness.ts`
- Modify: `packages/config/src/readiness.test.ts`
- Modify: `packages/config/src/health.ts`
- Modify: `packages/config/src/health.test.ts`
- Create: `apps/web/app/api/health/route.ts`
- Create: `apps/web/app/api/health/route.test.ts`
- Create: `apps/workers/src/provider-canary.ts`
- Create: `apps/workers/src/provider-canary.test.ts`
- Create via CLI: `supabase/migrations/*_create_provider_canary_evidence.sql`
- Create: `docs/ops/provider-activation.md`
- Modify: `.env.example`

**Interfaces:**

```ts
export type ProviderSmokeContract = {
  environment: "staging" | "production";
  provider: string;
  credentialSource: string;
  operation: string;
  timeoutMs: number;
  retryCount: number;
  evidenceSink: string;
  monitoringOwner: string;
  rollbackFlag: string;
  rollbackTrigger: string;
};
```

- [ ] **Step 1: Write failing tests** for flag-off, missing credentials, schema/RLS mismatch, stale canary, failed canary, absent capability, five consecutive staging successes, one production canary, and rollback invalidating ready state.
- [ ] **Step 2: Generate provider evidence schema** storing provider/environment/operation, started/completed time, success/error code, latency, schema version, correlation ID, and redacted evidence checksum—never request/response payload.
- [ ] **Step 3: Implement canaries** for OpenAI structured parse/generation, Stripe session/webhook test contract, transactional email, Map tiles/style, QStash publish/verify, Sentry capture, Supabase read/write/RLS, and analytics adapter. Each uses minimal synthetic non-PII data.
- [ ] **Step 4: Make `/api/health` return coarse public liveness only;** authenticated operations health may show component status labels but never credentials, project IDs, URLs, schema details, or provider payloads.
- [ ] **Step 5: Run tests and a staging canary sequence; record evidence and commit** with `git commit -m "feat: require provider readiness evidence"`.

### Task 6.4: Complete privacy-safe analytics contracts and call sites

**Files:**
- Modify: `packages/analytics/src/index.ts`
- Modify: `packages/analytics/src/index.test.ts`
- Create: `packages/analytics/src/funnel.ts`
- Create: `packages/analytics/src/funnel.test.ts`
- Modify: `packages/analytics/README.md`
- Modify: `apps/web/app/_components/behavior-persistence.tsx`
- Modify: `apps/web/app/web-vitals-reporter.tsx`
- Modify: planner, trip, checkout, export, review, and specialist command call sites declared in Phases 2–5
- Create: `docs/ops/analytics-event-contract.md`

**Exact events:** `brief_started`, `phrase_accepted`, `brief_completed`, `route_preview_generated`, `route_conflict_seen`, `route_refined`, `checkout_started`, `payment_confirmed`, `export_ready`, `review_requested`, `specialist_change_proposed`, `specialist_change_accepted`, `review_completed`.

- [ ] **Step 1: Write failing schema/redaction tests** for each event’s required/allowed keys, enum values, correlation, deduplication, consent, no free text, no precise location, no email/user identifier, and no provider payload.
- [ ] **Step 2: Implement a typed `trackProductEvent()` union** and no-op/captured/live adapters. Live activation requires consent, flag, credentials, current event schema, and provider canary; production cannot select captured/test adapter.
- [ ] **Step 3: Instrument only authoritative business points:** confirmed database transitions for payment/export/review events, accepted reducer changes for phrases, and published route versions for refinement. UI clicks do not impersonate completed business events.
- [ ] **Step 4: Add funnel definitions** with explicit denominators, time windows, currency rules, late-event handling, and quality guardrails; document the 15% T1→T2 target as a target, not fabricated observed performance.
- [ ] **Step 5: Run analytics tests, source scan for raw prose, typechecks, and commit** with `git commit -m "feat: complete privacy-safe product analytics"`.

### Task 6.5: Activate Sentry with correlation and PII scrubbing

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/workers/package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/web/lib/monitoring/sentry-provider.ts`
- Create: `apps/web/lib/monitoring/sentry-provider.test.ts`
- Create: `apps/web/lib/monitoring/correlation.ts`
- Create: `apps/web/lib/monitoring/correlation.test.ts`
- Modify: `packages/monitoring/src/index.ts`
- Modify: `packages/monitoring/src/index.test.ts`
- Modify: `apps/workers/src/sentry.ts`
- Remove: `apps/web/sentry.client.config.ts`
- Create: `apps/web/instrumentation-client.ts`
- Create: `apps/web/instrumentation.ts`
- Modify: `apps/web/sentry.server.config.ts`
- Modify: `apps/web/sentry.edge.config.ts`
- Modify: `apps/web/app/error.tsx`
- Modify: `docs/error-monitoring.md`
- Modify: `docs/ops/incidents.md`

- [ ] **Step 1: Write failing tests** for correlation propagation, route/role/capability tags, error-code grouping, user pseudonymization, breadcrumb redaction, request body/header/query scrubbing, message/trip prose removal, signed URL/token removal, sampling, and no-op prohibition when enabled.
- [ ] **Step 2: Pin `@sentry/nextjs` and `@sentry/node` together at `10.65.0` and implement the provider** behind `@repo/monitoring`, sharing one redaction function across browser/server/edge/worker. Set `sendDefaultPii: false`, Replay sampling to `0`, and scrub cookies, headers, queries, bodies, local variables, AI input/output, app state, and dynamic IDs; never attach email or raw user ID.
- [ ] **Step 3: Propagate `x-correlation-id`** from incoming request or generated UUID through API errors, database events, jobs, provider calls, and Sentry; do not expose internal stack or identifiers to the browser.
- [ ] **Step 4: Capture synthetic server/client/edge/worker canaries** and prove route/role context plus PII absence in staging evidence before readiness passes.
- [ ] **Step 5: Run monitoring tests/typechecks/canaries and commit** with `git commit -m "feat: activate privacy-safe error monitoring"`.

### Task 6.6: Enforce performance and motion budgets in production builds

**Files:**
- Modify: `scripts/perf-budget.mjs`
- Create: `scripts/perf-budget.test.mjs`
- Modify: `apps/web/scripts/check-motion-imports.mjs`
- Create: `apps/web/scripts/check-mapbox-budget.mjs`
- Modify: `apps/web/playwright/tests/perf.spec.ts`
- Modify: `apps/web/playwright/tests/web-vitals.spec.ts`
- Modify: `apps/web/next.config.ts`
- Create: `docs/ops/performance-budget.md`

- [ ] **Step 1: Write failing budget-parser/tests** for route family JS limits, first-viewport image bytes, lazy map chunk exclusion, LCP/INP/CLS, map readiness, long tasks, font preload, layout shift, and an intentionally over-budget fixture.
- [ ] **Step 2: Measure from `pnpm build && pnpm --dir apps/web start`** with cold/warm mobile and desktop profiles; dev-server timings are never release evidence.
- [ ] **Step 3: Enforce exact budgets** from the approved spec and fail missing measurements. Ensure maps/globes, analytics, Sentry extras, console charts, and drag/drop load only on routes that need them.
- [ ] **Step 4: Optimize measured failures** through owned responsive images, fixed dimensions, route-level dynamic imports, server components, font subsets, reduced hydration, event-driven camera updates, and `prefers-reduced-motion` behavior—never by weakening thresholds.
- [ ] **Step 5: Run production perf/motion/map gates three times, record median/p75 evidence, and commit** with `git commit -m "perf: enforce Rumia release budgets"`.

### Task 6.7: Complete the route × persona × state evidence matrix

**Files:**
- Modify: `docs/audit/route-matrix.md`
- Modify: `apps/web/playwright/global-setup.ts`
- Create: `apps/web/playwright/tests/route-matrix.spec.ts`
- Modify: `apps/web/playwright/tests/authorization-matrix.spec.ts`
- Create: `apps/web/playwright/tests/provider-readiness.spec.ts`
- Modify: `apps/web/playwright/tests/protected-routes.spec.ts`
- Modify: `apps/web/playwright/tests/prototype-redirect.spec.ts`
- Modify: `apps/web/playwright/tests/visual.spec.ts`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`

- [ ] **Step 1: Generate failing parameterized cases** from the Phase 0 route catalogue for anonymous, traveler owner, second traveler, candidate, reviewer, second reviewer, suspended reviewer, admin capability variants, organization A/B member, and non-member.
- [ ] **Step 2: Cover applicable ready/loading/empty/error/unauthorized/disabled/unavailable/demo states** at 1440×900 and 390×844. Before any authenticated capture, assert a scoped identity/read marker unique to that persona.
- [ ] **Step 3: Add invariant assertions** for exact redirect status/location, one `main`, one visible `h1`, working skip target, no stale nav/fixture/role leak, no document overflow, map list alternative, keyboard flow, reduced motion, and zero serious/critical axe violations.
- [ ] **Step 4: Delete obsolete snapshots only after source behavior and the new capture pass are verified;** regenerate all shared-shell descendants in the same commit.
- [ ] **Step 5: Run matrix/visual/a11y/overflow suites from a production build and commit** with `git commit -m "test: complete route persona state evidence"`.

### Task 6.8: Split CI into explicit non-skippable quality gates

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `apps/web/package.json`
- Modify: `scripts/run-policy-tests.mjs`
- Modify: `scripts/run-policy-tests.test.mjs`
- Modify: `scripts/check-production-fixtures.mjs`
- Modify: `scripts/check-production-fixtures.test.mjs`
- Modify: `scripts/README.md`

- [ ] **Step 1: Write failing script tests** for SQL discovery/order/`ON_ERROR_STOP`, zero policy files, fixture import/copy, tracked auth/runtime files, stale snapshots, missing route evidence, and unsupported package-manager version.
- [ ] **Step 2: Split commands into** `test:unit`, `test:rls`, `test:e2e`, `test:visual`, `test:a11y`, `test:perf`, `test:fixtures`, and `test:route-matrix`; remove recursive browser-suite execution from package `test` scripts.
- [ ] **Step 3: Build CI jobs** for safety/install, lint/typecheck/unit, clean Supabase reset/migration lint/every policy SQL, production build/route smoke, persona E2E, visual/a11y/overflow, performance budgets, and production fixture scan. Upload reports/screenshots without auth state, env files, database dumps, PII, or any `supabase/.temp` path.
- [ ] **Step 4: Make every gate required and non-skippable.** A missing credential may skip a live provider canary only on pull requests; it must fail staging/production activation workflows.
- [ ] **Step 5: Run all local commands, validate workflow syntax, and commit** with `git commit -m "ci: enforce complete Rumia release gates"`.

### Task 6.9: Prove staging RLS, ownership, assignment, and tenant isolation

**Files:**
- Modify: `scripts/seed-local-personas.mjs`
- Create: `scripts/seed-staging-personas.mjs`
- Create: `scripts/seed-staging-personas.test.mjs`
- Create: `scripts/verify-staging-isolation.mjs`
- Create: `scripts/verify-staging-isolation.test.mjs`
- Modify: `apps/web/playwright/global-setup.ts`
- Create: `docs/ops/staging-personas.md`
- Modify: `docs/ops/launch.md`

- [ ] **Step 1: Write failing seed/isolation tests** for deterministic non-production identities, idempotent seed, explicit environment refusal in production, two travelers/trips, two reviewers/assignments, candidate, suspended reviewer, capability-separated admins, two organizations/members/assets, and cleanup ownership.
- [ ] **Step 2: Implement a staging-only seed contract** using synthetic values and service credentials from environment without printing them. The script exits before mutation unless environment identity is exactly staging and a confirmation token matches the documented run.
- [ ] **Step 3: Execute direct client/API/Storage denial matrices** for trip ownership, route projection, order/payment, export, review assignment, messages/attachments, specialist evidence, capabilities, operations cases, configuration, organization rows/assets, and share hashes.
- [ ] **Step 4: Compare hosted migrations/advisors and route behavior to local evidence;** any manual hosted grant, policy, function, or bucket difference blocks activation until represented by a forward migration.
- [ ] **Step 5: Store only pass/fail counts, schema versions, timestamps, and correlation IDs in evidence; commit** with `git commit -m "test: prove staging isolation boundaries"`.

### Task 6.10: Execute per-feature canary, rollout, and rollback gates

**Files:**
- Modify: `docs/ops/launch.md`
- Modify: `docs/ops/deploy-rollback.md`
- Modify: `docs/ops/incidents.md`
- Create: `docs/ops/release-evidence-template.md`
- Create: `docs/ops/feature-activation-order.md`
- Create: `scripts/verify-release-evidence.mjs`
- Create: `scripts/verify-release-evidence.test.mjs`

**Activation order:** public shell/content → planner deterministic choices → live phrase parser → live route generation → Full Stripe checkout → transactional email → exports → Local Polish requests → reviewer operations → trip messaging → admin capabilities → operations console → B2B beta → analytics provider → configuration deploy.

- [ ] **Step 1: Write failing evidence-validator tests** for missing commit/build/schema/RLS/route/visual/a11y/perf/provider/owner/rollback fields, stale timestamps, wrong environment, failed canary, fewer than five staging successes, and absent 30-minute observation.
- [ ] **Step 2: Implement the release evidence manifest** with immutable commit SHA, image/build ID, migration range/checksums, policy result, route-matrix artifact, provider canary IDs, dashboards/alert owners, enabled flag, production smoke result, start/end observation, rollback command/flag, and approver.
- [ ] **Step 3: Rehearse rollback in staging for every feature:** flag off, queued-job stop/drain, provider disable, schema forward mitigation, cache purge where required, entitlement preservation, and traveler-safe unavailable UI.
- [ ] **Step 4: Activate one production flag, run its synthetic smoke and owner journey, observe alerts/errors/latency/business transition for 30 minutes, then either record pass or execute the rehearsed rollback.** Never batch unrelated provider activations.
- [ ] **Step 5: Run the final complete gate:**

```bash
pnpm repo:safety
pnpm test:fixtures
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm check:migrations
pnpm exec supabase db reset
pnpm test:rls
pnpm test:e2e
pnpm test:visual
pnpm test:a11y
pnpm test:perf
pnpm test:route-matrix
node scripts/verify-release-evidence.mjs
git diff --check
```

- [ ] **Step 6: Commit final runbooks/evidence validator** with `git commit -m "docs: finalize controlled Rumia rollout"`.

## Phase 6 release condition

Rumia is production-ready only when the hosted schema matches the reviewed forward migration history, every policy matrix passes against staging, all routes/states/personas have current production-build evidence, provider canaries and Sentry prove privacy-safe operation, worker recovery/idempotency passes fault tests, performance budgets pass, and each enabled capability has a successful production canary plus a rehearsed flag-off rollback. Any failed or stale evidence returns that capability to disabled or unavailable.
