# Rota (Rumia.pt) Roadmap

> Portugal-first travel planning platform. Cinematic Concierge aesthetic.
> Built on Next.js 16 (App Router) + Supabase + pnpm/Turborepo monorepo.

---

## 1. What Rota Is

Rota is a guided-trip platform focused on Portugal (rumia.pt). It turns a natural-language or structured travel brief into a curated itinerary with a cinematic, chapter-driven UI: a traveler describes what they want, the deterministic AI engine produces a draft, an optional human reviewer audits and refines it, and the final plan can be exported as PDF/Markdown/Calendar.

**Three user surfaces:**
- **Traveler** (`/`, `/trip/new`, `/trip/[tripId]`, `/trip/[tripId]/map`, `/trip/[tripId]/export`, `/account`, `/portugal`, `/how-it-works`, `/pricing`, `/human-review`) — prompt-first generation, itinerary preview, map audit, delivery, saved archive.
- **Reviewer** (`/reviewer/queue`, `/reviewer/trips/[tripId]`, `/reviewer/history`, `/reviewer/profile`, `/reviewer/operations`) — human-in-the-loop itinerary audit workspace.
- **Admin** (`/admin/places`, `/admin/countries`, `/admin/regions`, `/admin/partners`, `/admin/reviewers`, `/admin/quality`, `/admin/analytics`) — CMS for places, regions, partners, reviewer ops.

**Architecture pattern — "Deterministic Contracts":** external providers (OpenAI, Stripe, Resend, Mapbox) are stubbed behind Zod-validated interfaces in `@repo/*` packages. This lets the entire UI/UX layer ship and be tested without live provider keys. Wiring to live providers is deferred to Phase 4.

---

## 2. Current State (snapshot — last verified 2026-07-02)

### What's done

- **12 packages built**: `@repo/ai`, `@repo/analytics`, `@repo/config`, `@repo/db`, `@repo/emails`, `@repo/maps`, `@repo/monitoring`, `@repo/payments`, `@repo/routing`, `@repo/types`, `@repo/ui`, `@repo/typescript-config`.
- **2 runnable apps**: `apps/web` (Next.js 16 App Router, 3 surfaces), `apps/workers` (bounded local job runner).
- **1 mobile scaffold**: `apps/mobile/` exists but no `package.json` — not buildable yet.
- **10 Supabase migrations committed** (Apr 29 – May 4, 2026) covering briefs, trips, places, regions, partners, booking clicks, user roles, RLS policies, payment webhooks, admin audit trail.
- **UI rollout complete (local)**: 24-task `rota-stitch-and-roadmap-completion` plan shipped slices 3–7 with F1–F4 verdicts `APPROVE` (2026-05-01).
- **Cinematic redesign in flight**: `full-app-framer-redesign` plan — T1–T33 tasks implemented across motion foundation, design tokens, surface redesigns, runtime fixes. **F1–F4 final verification wave still unchecked.**
- **Housekeeping**: `chore(repo): cleanup untracked runtime artifacts, dedupe evidence, tighten gitignore` (commit `e49a624`) on 2026-07-02.

### What's in flight

- **109 working-tree modifications** (consumer + admin + marketing surfaces). Uncommitted; need review and committing before any further code work.
- **422 untracked files** (mostly `.sisyphus/` runtime artifacts pre-`.gitignore` extension; ~11 evidence PNGs now tracked after cleanup commit).
- **Active plan `full-app-framer-redesign`**: paused after T1–T33 implementation; F1–F4 unchecked.

### What's blocking production

> **Production launch is BLOCKED** until the items in §4 Phase 2 are resolved.

- **Hosted Supabase schema drift.** Five migrations from `supabase/migrations/` (May 1–4) exist locally but are not confirmed applied on hosted: `202605011600_create_user_roles_and_ownership.sql` (adds `owner_user_id`), `202605011700_create_rls_policies_and_grants.sql`, `202605011800_add_indexes_constraints_trip_transaction.sql`, `202605020230_create_payment_webhook_events.sql`, `20260504010324_admin_audit_trail.sql`.
- **Supabase Auth leaked-password protection disabled** in hosted Auth dashboard.
- **Service-role key rotation pending** since T1 of the production roadmap.
- **Background workers run locally only** — no hosted runner (Inngest / Upstash QStash) wired.
- **No live provider integrations**: Stripe, Resend, OpenAI, Mapbox are all stubbed at the package boundary.

### Pre-existing tech debt (carried, not yet fixed)

- `@repo/monitoring` has typecheck errors (acknowledged in `docs/architecture.md`).
- `@repo/db` has assertion failures (acknowledged in `docs/architecture.md`).
- `packages/db/src/index.ts` re-exports `./clients` (line ~6) **and** defines a local `isPersistenceConfigError` shadow (~line 115). Functionally fine (local wins) but is duplicate logic.
- `apps/web/app/(reviewer)/reviewer/history/page.tsx` and `profile/page.tsx` fall through to `error.message` on unknown errors — would leak schema-cache strings if drift hits those pages.
- Vitest include pattern excludes `*.test.tsx` under `apps/web/app/`, so React server-component page tests aren't discoverable.

---

## 3. Phased Plan

Phases are ordered by dependency. **Phase 0–1 are immediate.** **Phase 2 unblocks production.** Phase 3–4 are post-blocker. Phase 5 is post-launch.

### Phase 0 — Audit + Housekeeping *(immediate)*

Goal: clean working tree, baseline verified, final verification wave of active plan completed.

| # | Task | Done | Evidence |
|---|---|---|---|
| 0.1 | Repo cleanup (untracked runtime artifacts, dedupe evidence, tighten `.gitignore`) | ✅ 2026-07-02 | commit `e49a624` |
| 0.2 | Resolve 109 working-tree modifications (commit, revert, or stage into the active plan's wave) | ⏳ | — |
| 0.3 | Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm --filter web build` to baseline current state | ⏳ | — |
| 0.4 | Execute F1–F4 final wave of `full-app-framer-redesign` plan (Plan Compliance, Code Quality, Manual QA, Scope Fidelity) | ⏳ | `.sisyphus/evidence/full-app-framer-redesign/F1-F4` |
| 0.5 | Update `.sisyphus/boulder.json` and notepads to reflect Phase 0 outcome | ⏳ | — |

**Exit criteria**: working tree has zero uncommitted edits; `pnpm typecheck` is clean (modulo documented pre-existing errors); F1–F4 produce APPROVE verdicts; boulder points to the next live plan.

---

### Phase 1 — Pre-existing Tech Debt *(parallel to Phase 2)*

Goal: clean the slate so Phase 2 isn't fighting untracked breakage.

| # | Task | Owner scope | Success |
|---|---|---|---|
| 1.1 | Fix `@repo/monitoring` typecheck errors | `@repo/monitoring` | `pnpm --filter @repo/monitoring typecheck` clean |
| 1.2 | Fix `@repo/db` assertion failures in `clients.test.ts`, `index.test.ts` | `@repo/db` | `pnpm --filter @repo/db test` clean |
| 1.3 | Remove `isPersistenceConfigError` shadow in `packages/db/src/index.ts`; keep the canonical re-export | `packages/db` | Single definition; tests still pass |
| 1.4 | Replace `error.message` fall-through in `/reviewer/history` and `/reviewer/profile` with a generic user-safe fallback | `apps/web/app/(reviewer)` | Error boundary returns tokenized message; no schema-cache leakage |
| 1.5 | Fix Vitest include pattern to discover `*.test.tsx` under `apps/web/app/` | `vitest.config.ts` | New page-level tests run in CI |
| 1.6 | Audit & document residual pre-existing concerns in `.sisyphus/notepads/visual-engineering/issues.md` | session | Documented |

**Exit criteria**: `pnpm typecheck` and `pnpm test` clean across the workspace; no `error.message` fall-through to user UI; new page tests runnable.

---

### Phase 2 — Production Supabase Reconciliation *(BLOCKER for launch)*

Goal: bring hosted Supabase to parity with local; eliminate the `T40` blocker named in `docs/ops/launch.md`.

| # | Task | Source | Success |
|---|---|---|---|
| 2.1 | Apply `202605011600_create_user_roles_and_ownership.sql` to hosted (adds `owner_user_id` to `trips`, `trip_briefs`) | local migration | `owner_user_id` columns exist on hosted |
| 2.2 | Apply `202605011700_create_rls_policies_and_grants.sql` | local migration | RLS enabled on all public tables |
| 2.3 | Apply `202605011800_add_indexes_constraints_trip_transaction.sql` | local migration | `get_advisors(security)` clean for missing-index findings |
| 2.4 | Apply `202605020230_create_payment_webhook_events.sql` | local migration | `payment_webhook_events` table exists |
| 2.5 | Apply `20260504010324_admin_audit_trail.sql` | local migration | `admin_audit_trail` table exists |
| 2.6 | Verify `public.reviewer_auth_links` and `public.user_profiles` exist | hosted | Both tables queryable |
| 2.7 | Enable **Leaked Password Protection** in Supabase Auth dashboard | hosted | `get_advisors(auth)` clean for password findings |
| 2.8 | Rotate `SUPABASE_SERVICE_ROLE_KEY` (T1) and update prod secrets | hosted + Vercel | Old key revoked; new key in production env |
| 2.9 | Verify RLS actively constrains user-facing reads (per `docs/ops/launch.md` §3 smoke test) | hosted | Outsider test user cannot read another user's trip |

**Exit criteria**: every line in `docs/ops/launch.md` §1 (Pre-Launch Gate) is checked; smoke test in §3.1 passes (outsider user cannot see another user's trip).

> **Decision needed before Phase 2 starts:** do we want `docs/adr/001-auth-rls-strategy.md` reviewed and updated? It was last touched alongside the original migration work; the data-isolation guarantee has not been re-validated against current hosting provider behaviour.

---

### Phase 3 — Hosted Worker Runner

Goal: move `apps/workers` from bounded local to a hosted cron/queue runner.

| # | Task | Owner | Success |
|---|---|---|---|
| 3.1 | Pick hosted runner: Inngest (best DX for step-functions + retries) **vs.** Upstash QStash (lightweight HTTP cron) | decision | Documented in `docs/adr/002-worker-runner.md` |
| 3.2 | Add runner SDK to `apps/workers`; replace bounded-local entrypoint with hosted handler | `apps/workers` | Export job enqueues and runs end-to-end in hosted env |
| 3.3 | Wire email and export jobs to runner | `apps/workers`, `@repo/emails` | Email rendered & delivered; export PDF stored |
| 3.4 | Switch `monitoring` provider from `NoopMonitoringProvider` to real provider (Sentry or equivalent) | `@repo/monitoring` | Errors captured in hosted env |

**Exit criteria**: a trip created in production triggers an export job that runs and completes on the hosted runner; monitoring captures a real error from a known failure path.

---

### Phase 4 — Live Provider Integrations

Goal: replace deterministic stubs with live providers at the package boundary.

| # | Task | Package | Success |
|---|---|---|---|
| 4.1 | Stripe live mode + webhook → `payment_webhook_events` ledger | `@repo/payments` | Test checkout creates row in `payment_webhook_events` |
| 4.2 | Resend transactional email | `@repo/emails` | Welcome + export-ready emails arrive in inbox |
| 4.3 | OpenAI / Claude itinerary generation (replacing deterministic fallback) | `@repo/ai` | `/trip/new` prompt → live model → structured brief |
| 4.4 | Mapbox GL live maps (replacing stubs) | `@repo/maps` | `/trip/[tripId]/map` renders real tiles; static fallback removed |

**Exit criteria**: every `@repo/*` package that previously had a deterministic fallback now has live integration; the package's tests pass against a live-mode sandbox; fallback path is still reachable if env vars are missing (dev-friendly).

> **Parallelism note**: 4.1–4.4 are independent. They can run in parallel against separate feature branches after Phase 2 is closed.

---

### Phase 5 — Post-Launch

Goal: features that don't gate the launch but matter for retention / analytics.

| # | Task | Source |
|---|---|---|
| 5.1 | Real-time reviewer chat (websocket or polling) | deferred in `docs/roadmap.md` |
| 5.2 | Analytics dashboard with Recharts | deferred in `docs/roadmap.md` |
| 5.3 | Automated PDF storage and long-term export history | deferred in `docs/roadmap.md` |
| 5.4 | Partner booking click tracking and attribution logic | deferred in `docs/roadmap.md` |
| 5.5 | Mobile app: give `apps/mobile/` a real `package.json` (currently empty) | new scope |
| 5.6 | Cleanup of completed/historical `.sisyphus/plans/*` to an `archive/` subdir | housekeeping |

---

## 4. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Phase 0.4 (F1–F4) reveals Must-NOT-Have violations in active plan | High | Re-open `full-app-framer-redesign` plan, scope new remediation tasks, do not mark complete |
| Phase 1 work touches shared types and ripples to apps | Medium | Land in dedicated branches, run full workspace `pnpm typecheck` after each merge |
| Phase 2 schema application breaks hosted data | High | Take a PITR backup before each migration (see `docs/ops/backup-restore.md`); apply in order from oldest to newest; verify `get_advisors(security)` after each |
| Phase 2.8 service-role key rotation invalidates in-flight requests | High | Coordinate with Vercel deployment window; do not rotate during peak |
| Phase 3 worker runner choice locks us into a vendor | Medium | Prefer Inngest's local-emulator story; document the decision in `docs/adr/002-worker-runner.md` |
| Phase 4 provider integrations introduce latency | Medium | Provider calls wrapped in `@repo/*` packages; UI shows deterministic-fallback states during long polls |
| Working-tree mods (109 files) hide a regression Phase 1 will need to debug | Medium | Land mods first (Phase 0.2) before any other code work |

---

## 5. Active Plans & References

- **`.sisyphus/plans/full-app-framer-redesign.md`** — current active plan. T1–T33 implemented; F1–F4 pending. Pick up at Phase 0.4.
- **`.sisyphus/plans/rota-stitch-and-roadmap-completion.md`** — completed 2026-05-01 with all F1–F4 APPROVE. Retained as historical record.
- **`.sisyphus/plans/future-production-roadmap.md`** — predecessor to this roadmap. Has its own FINAL_SUMMARY (113 evidence files). Useful as historical context for the Phase 2 launch checklist.
- **`.sisyphus/plans/cinematic-redesign-{a,b}.md`** — superseded iterations; retained as historical record.
- **`docs/ops/launch.md`** — pre-launch gate (Phase 2), launch sequence (Phase 3 deployment), smoke test (Phase 2 verification), rollback plan.
- **`docs/ops/backup-restore.md`** — PITR / disaster recovery procedures referenced by Phase 2 risk register.
- **`docs/adr/001-auth-rls-strategy.md`** — RLS strategy, may need refresh after Phase 2.
- **`docs/architecture.md`** — current architecture overview.
- **`DESIGN.md`** — Cinematic Concierge aesthetic spec; referenced by every UI task.

---

## 6. Open Questions (need user call)

1. **Worker runner choice** (Phase 3.1): Inngest vs. Upstash QStash — pick before Phase 3 starts.
2. **`apps/mobile/` scope** (Phase 5.5): is the mobile app in scope, or was the scaffold accidental? No `package.json` suggests it was abandoned.
3. **ADR refresh** (Phase 2 prerequisite): should `docs/adr/001-auth-rls-strategy.md` be updated before Phase 2 migrations apply, or is "good enough" the right answer?
4. **Boulder plan continuation** (Phase 0.5): after Phase 0 completes, what's the next live plan? Resume `full-app-framer-redesign`, or pivot to a new "production-launch" plan derived from this roadmap?