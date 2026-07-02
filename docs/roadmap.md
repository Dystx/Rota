# Rumia — Roadmap

> **Two roadmaps, two axes.** This file bridges them.
>
> - **Product roadmap** → [`docs/spec.md`](./spec.md) (v2.0 Tiered Service Model). Drives *what* we build.
> - **Operational roadmap** → §3 below. Drives *how* we ship — the launch-readiness phases that unblock production deployment.
>
> Section 2 maps current state to spec phases.

---

## 1. What Rumia Is

Three-tier travel concierge platform for Portugal-first, AI-powered itinerary planning:

- **Level 1 (Core)**: structured brief → RAG-generated day-by-day itinerary with maps, routing, opening-hour validation.
- **Level 2 (Hybrid)**: human specialist review + asynchronous chat lifeline for on-trip adjustments.
- **Level 3 (Presencial)**: vetted marketplace of licensed local guides (RNAAT-compliant for Portugal).

See [`docs/spec.md`](./spec.md) for the full v2.0 spec — executive summary, tier architecture, tech stack, AI pipeline, database schema, and 8-phase product roadmap.

---

## 2. Current State vs Spec Phases (last verified 2026-07-02)

### Spec Phase 1 — Foundation (Infrastructure, Auth, Core Schemas, Monorepo Setup)

| Spec requirement | Status |
|---|---|
| Monorepo (`pnpm` + `turbo`) with apps + packages layout | ✅ **Done** — 12 packages + 2 runnable apps |
| Core Schemas: `trip_briefs`, `trips` | ✅ **Done** — migration `202604291900` |
| Knowledge graph seed: `places` | ✅ **Done** — migration `202604292240` (no PostGIS/pgvector yet) |
| Identity: `user_profiles` + `reviewer_auth_links` | ✅ **Done** — migration `202605011600` |
| RLS policies on public tables | 🟡 **Local-only** — migration `202605011700` written; **NOT confirmed applied to hosted** |
| Audit trail: `admin_audit_trail` | ✅ **Done** — migration `20260504010324` (local only) |
| CI workflow | ✅ **Done** — `.github/workflows/ci.yml` |
| Quality baseline | ✅ **Done** — `pnpm typecheck` 13/13, unit tests 228/228 |

### Spec Phase 2 — Portugal MVP (Knowledge Graph, PostGIS/Vector, Basic AI Itineraries)

| Spec requirement | Status |
|---|---|
| `countries` / `cities` geographic entities | ❌ **Not started** (current code uses `country_slug` text + `regions` table as a stand-in) |
| `restaurants` separate from `places` | ❌ **Not started** |
| PostGIS extension + spatial columns | ❌ **Not started** |
| pgvector extension + embedding columns | ❌ **Not started** |
| Knowledge graph seed (Portugal-first place list with embeddings) | 🟡 **Partial** — `places` table seeded; no embeddings yet |
| Basic AI itineraries (packages/ai deterministic pipeline) | ✅ **Done** — 5-step pipeline wired in `packages/ai/src/index.ts` (normalize → retrieve → spatial → validate → render) |

### Spec Phase 3 — AI Planning Engine

| Spec requirement | Status |
|---|---|
| Trip Brief Normalization Engine (Step 1) | ✅ **Done** — `packages/ai/src/prompt-normalization.test.ts` |
| Invisible AI UI controls (Make it more relaxed / Replace this stop) | 🟡 **Partial** — UI primitives exist; semantic re-search after stop replacement not yet wired |
| Custom layout engine | ✅ **Done** — `packages/ui` cinematic primitives (ChapterHeading, RevealSection, ChapterNav) |

### Spec Phase 4 — Premium Monetization

| Spec requirement | Status |
|---|---|
| Stripe infrastructure | ❌ **Not started** — `@repo/payments` exists with deterministic checkout-plan contracts; live Stripe deferred |
| PDF Export Engine | 🟡 **Partial** — `/trip/[tripId]/export` page exists; needs final Stripe-gated unlock flow |
| Calendar Export Engine | 🟡 **Partial** — same; surface exists, unlock logic pending |
| Affiliate booking (booking_clicks table + Stripe-led attribution) | 🟡 **Partial** — `booking_clicks` table exists; affiliate attribution pending |

### Spec Phase 5 — Level 2 Hybrid System

| Spec requirement | Status |
|---|---|
| Reviewer roster + assignments | ✅ **Done** — `reviewers`, `reviewer_assignments` tables; `/reviewer/*` routes |
| Asynchronous Triage Chat System | ❌ **Not started** — `chat_threads` / `chat_messages` tables don't exist yet |
| Specialist dashboard with calculated route timelines | 🟡 **Partial** — `/reviewer/trips/[tripId]` route map exists; needs explicit route timeline display per verification §7 SLA |

### Spec Phase 6 — Level 3 Marketplace

| Spec requirement | Status |
|---|---|
| `guide_profiles` + `guide_bookings` tables | ❌ **Not started** |
| Guide onboarding + verification | ❌ **Not started** |
| Dynamic dispatch | ❌ **Not started** |
| RNAAT regulatory auditing | ❌ **Not started** (blocker per spec §7) |

### Spec Phase 7 — Mobile Experience

| Spec requirement | Status |
|---|---|
| React Native companion app | ❌ **Not started** — `apps/mobile/` directory exists but no `package.json` |
| Offline synchronizer | ❌ **Not started** |

### Spec Phase 8 — International Expansion

| Spec requirement | Status |
|---|---|
| Modular porting to Spain, Italy, France, Greece, Japan | ❌ **Not started** |

### Pre-existing tech debt

- `packages/db/src/index.ts` had `isPersistenceConfigError` shadow re-export (canonical in `clients.ts:54`); **removed** (commit `7a4f555`).
- 11 placeholder copy items in admin/reviewer `EmptyState` titles + `"Active MVP"` status label; **replaced** (commit `7a4f555`).
- 6 admin pages had `error.message` fall-through in catch blocks; **replaced** with generic fallbacks (commit `3cb58a1`).
- Vitest include pattern excluded `*.test.tsx`; **fixed** (commit `253da10`). 22 React component test files now runnable.
- `.sisyphus/`, `.omk/`, `.kimi/`, `.playwright-mcp/` untracked tool state; **removed from repo** (commits `bc1aa48`, `339ffb9`).
- 9 scratch debug scripts (`apps/web/check-*.cjs`) + `apps/web/playwright-report/`; **deleted** (commit `253da10`).

---

## 3. Operational Roadmap — Launch-Readiness Phases

These are the phases that unblock production deployment. They run alongside the spec phases above; many spec phases have local-only implementations and need the operational work below to ship.

### Phase 0 — Audit + Housekeeping ✅ Complete (2026-07-02)

Repo cleanup, copy fixes, db shadow removal, vitest `*.test.tsx` discovery, project-content tracking. See git log commits `e49a624` … `e7e7f23`.

### Phase 1 — Pre-existing Tech Debt ✅ Complete (2026-07-02)

All 4 sub-items done. Audit evidence at `docs/audit/phase-0-cinematic-redesign.md`.

### Phase 2 — Production Supabase Reconciliation *(BLOCKER for launch)*

Goal: bring hosted Supabase to parity with local; eliminates the spec's Phase 1 RLS drift blocker.

| # | Task | Source |
|---|---|---|
| 2.1 | Apply `202605011600_create_user_roles_and_ownership.sql` (adds `owner_user_id`) | local migration |
| 2.2 | Apply `202605011700_create_rls_policies_and_grants.sql` | local migration |
| 2.3 | Apply `202605011800_add_indexes_constraints_trip_transaction.sql` | local migration |
| 2.4 | Apply `202605020230_create_payment_webhook_events.sql` | local migration |
| 2.5 | Apply `20260504010324_admin_audit_trail.sql` | local migration |
| 2.6 | Verify `public.reviewer_auth_links` and `public.user_profiles` exist | hosted |
| 2.7 | Enable **Leaked Password Protection** in Supabase Auth dashboard | hosted |
| 2.8 | Rotate `SUPABASE_SERVICE_ROLE_KEY` and update prod secrets | hosted + Vercel |
| 2.9 | Verify RLS actively constrains user-facing reads (per `docs/ops/launch.md` §3 smoke test) | hosted |

**Exit criteria**: every line in `docs/ops/launch.md` §1 checked; outsider test user cannot read another user's trip.

> **Decision needed before Phase 2 starts**: refresh `docs/adr/001-auth-rls-strategy.md` against current hosting provider behaviour.

### Phase 3 — Hosted Worker Runner

Goal: move `apps/workers` from bounded local to a hosted cron/queue runner (Inngest vs. Upstash QStash — decision needed).

### Phase 4 — Live Provider Integrations

Replace deterministic stubs with live providers at the package boundary:
- `@repo/payments` → live Stripe + webhooks
- `@repo/emails` → live Resend
- `@repo/ai` → live OpenAI/Claude (replace deterministic fallback)
- `@repo/maps` → live Mapbox GL (replace stub)

### Phase 5 — Spec-Phase 2 Gaps (Portugal MVP Backfill)

Until Phase 2 (operational) lands on hosted, we can't fully ship spec Phase 2. Backfill items:

| # | Task | Spec Phase |
|---|---|---|
| 5.1 | Add `countries` + `cities` tables (replace text `country_slug` + `regions` shape) | Spec 2 |
| 5.2 | Add `restaurants` table (separate from `places`) | Spec 2 |
| 5.3 | Enable PostGIS extension + add spatial columns | Spec 2 |
| 5.4 | Enable pgvector extension + add embedding columns | Spec 2 |
| 5.5 | Seed Portugal place list with embeddings | Spec 2 |

### Phase 6 — Spec-Phase 5 Gaps (Level 2 Hybrid System)

| # | Task | Spec Phase |
|---|---|---|
| 6.1 | Add `chat_threads` + `chat_messages` tables | Spec 5 |
| 6.2 | Asynchronous triage chat system (4-hour SLA, AI pre-triage) | Spec 5 |
| 6.3 | Specialist dashboard route timeline display (per spec §7 SLA) | Spec 5 |

### Phase 7 — Spec-Phase 6 Gaps (Level 3 Marketplace)

| # | Task | Spec Phase |
|---|---|---|
| 7.1 | **RNAAT regulatory audit** (Portugal-specific; spec §7 blocker) | Spec 6 |
| 7.2 | Add `guide_profiles` + `guide_bookings` tables | Spec 6 |
| 7.3 | Guide onboarding + verification flow | Spec 6 |
| 7.4 | Dynamic dispatch | Spec 6 |

### Phase 8 — Spec-Phase 4 Backfill + Post-Launch

| # | Task | Spec Phase |
|---|---|---|
| 8.1 | Live Stripe checkout + webhook → `payment_webhook_events` ledger | Spec 4 |
| 8.2 | PDF / Calendar Export Engines gated by Stripe | Spec 4 |
| 8.3 | Affiliate booking attribution | Spec 4 |
| 8.4 | Spec Phase 7 (Mobile): React Native companion + offline sync | Spec 7 |
| 8.5 | Spec Phase 8 (International): modular porting to Spain, Italy, France, Greece, Japan | Spec 8 |

---

## 4. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Phase 2 schema application breaks hosted data | High | PITR backup before each migration (per `docs/ops/backup-restore.md`); apply oldest → newest; verify `get_advisors(security)` after each |
| Phase 2.8 service-role key rotation invalidates in-flight requests | High | Coordinate with Vercel deployment window |
| Phase 3 worker runner choice locks into a vendor | Medium | Prefer Inngest's local-emulator story; document in `docs/adr/002-worker-runner.md` |
| Phase 4 provider integrations introduce latency | Medium | Provider calls wrapped in `@repo/*`; UI shows deterministic-fallback during long polls |
| Phase 7.1 RNAAT compliance status unknown | High | Block Level 3 launch until audit complete |
| Phase 7 mobile companion requires iOS/Android app store deployment | High | Apple/Google review processes block rapid iteration |
| E2E blocked by missing Supabase env in this workspace | Low | `npx supabase start` resolves |

---

## 5. References

- **`docs/spec.md`** — Rumia v2.0 Master Product Specification & Architecture Blueprint (canonical product reference).
- **`docs/architecture.md`** — current architecture overview.
- **`docs/adr/001-auth-rls-strategy.md`** — RLS strategy, may need refresh after Phase 2.
- **`docs/adr/002-deterministic-contracts.md`** — provider-stubbing pattern rationale.
- **`docs/ops/launch.md`** — pre-launch gate (Phase 2), launch sequence (Phase 3 deployment), smoke test, rollback plan.
- **`docs/ops/backup-restore.md`** — PITR / disaster recovery referenced by Phase 2 risk register.
- **`docs/ops/incidents.md`** — incident response runbook.
- **`docs/ops/deploy-rollback.md`** — deployment + rollback procedure.
- **`docs/error-monitoring.md`** — error monitoring approach.
- **`README.md`** — quick start, architecture map, env setup.
- **`docs/audit/phase-0-cinematic-redesign.md`** — Phase 0 audit evidence.

---

## 6. Open Questions (need user call)

1. **Worker runner choice** (Phase 3): Inngest vs. Upstash QStash.
2. **RNAAT regulatory status** (Phase 7.1): has Portugal legal review been commissioned for Level 3 marketplace?
3. **`apps/mobile/` scope**: in scope, or scaffold-abandoned?
4. **ADR refresh before Phase 2**: refresh `docs/adr/001-auth-rls-strategy.md`?
5. **ADR for spec gap backfill** (Phase 5–7): should each spec-vs-current gap item get its own ADR, or one umbrella "spec-to-implementation reconciliation" ADR?