# Rumia — Roadmap

> **Two specs, two axes.** This file bridges them.
>
> - **Long-term product vision** → [`docs/spec.md`](./spec.md) (v2.0 Tiered Service Model — 3 tiers, 8 phases).
> - **Refined 2026 immediate focus** → [`docs/spec-refined-2026.md`](./spec-refined-2026.md) (Tier 1 + Tier 2 only; Tier 3 + Mobile deferred; Awwwards-grade design).
> - **Operational launch-readiness** → §3 below. Drives *how* we ship.
>
> Section 2 maps current state to the refined 5-phase engineering plan.

---

## 1. What Rumia Is

Three-tier travel concierge platform for Portugal-first, AI-powered itinerary planning:

- **Tier 1 (Core)**: structured brief → RAG-generated day-by-day itinerary with maps, routing, opening-hour validation. Free; monetized via exports + affiliate bookings.
- **Tier 2 (Hybrid Specialist)**: human reviewer + asynchronous chat lifeline for on-trip adjustments. Premium upsell.
- **Tier 3 (Presencial Guide)**: licensed local guide marketplace. **Deferred** per refined scope.

The immediate focus is Tier 1 + Tier 2 only. See [`docs/spec-refined-2026.md`](./spec-refined-2026.md) for the scope decision rationale and reactivation triggers.

---

## 2. Current State vs Refined 2026 Phases (last verified 2026-07-02)

### Phase 1 — Foundations & Architecture Setup

| Requirement | Status |
|---|---|
| Monorepo (`pnpm` + `turbo`) with apps + packages layout | ✅ **Done** — 12 packages + 2 runnable apps |
| PostgreSQL + PostGIS + pgvector extensions | ❌ **Not started** |
| Tailwind v4 design tokens (matches `packages/ui/src/styles.css`) | ✅ **Done** — token system in `packages/ui` |
| Cinematic Concierge aesthetic via design tokens | ✅ **Done** — paper/cream/ink/atlantic/aqua tokens; reduced-motion media query |

### Phase 2 — Knowledge Graph Seeding (Portugal Module)

| Requirement | Status |
|---|---|
| `places` table seeded for Lisbon, Sintra, Porto, Algarve | 🟡 **Partial** — `places` table exists; coverage unverified |
| Text descriptions → pgvector embeddings | ❌ **Not started** — no embeddings yet |
| Mapbox custom minimalist skin | ✅ **Done** — `packages/maps` cinematic-map controller with reduced-motion |
| Spatial columns (PostGIS geometry) | ❌ **Not started** |

### Phase 3 — Invisible AI Engine (Tier 1 Activation)

| Requirement | Status |
|---|---|
| Trip Brief parser (Vercel AI SDK) | 🟡 **Partial** — `packages/ai/src/prompt-normalization.test.ts` exists; needs SDK wiring |
| Smart Question Cards pipeline | 🟡 **Partial** — `packages/ui/src/components/prompt-composer.tsx` exists |
| Geometric optimization (travel-time + opening-hour validation) | ✅ **Done** — `packages/routing` + `packages/ai` step 4 |
| Invisible UI controls (`Reduce driving`, `Make it more relaxed`) | 🟡 **Partial** — primitives exist; semantic re-search on stop replacement not yet wired |

### Phase 4 — Workspace & Checkout Infrastructure

| Requirement | Status |
|---|---|
| Asymmetric timeline canvas + inline controls | ✅ **Done** — `apps/web/app/(app)/trip/[tripId]/page.tsx` + cinematic-hero + chapter-nav |
| Stripe payment flows | ❌ **Not started** — `@repo/payments` has deterministic contracts; live Stripe deferred |
| PDF + Calendar Export Engines | 🟡 **Partial** — `/trip/[tripId]/export` page exists; unlock gating pending |
| Premium exports + affiliate bookings | 🟡 **Partial** — `booking_clicks` table exists; attribution flow pending |

### Phase 5 — Specialist Collaboration Hub (Tier 2 Activation)

| Requirement | Status |
|---|---|
| Reviewer roster + assignments | ✅ **Done** — `reviewers`, `reviewer_assignments` tables; `/reviewer/*` routes |
| Reviewer dashboard with error-checking alert panel | 🟡 **Partial** — `/reviewer/trips/[tripId]` exists; needs explicit route-timeline display per spec §7 SLA |
| Asynchronous chat infrastructure | ❌ **Not started** — `chat_threads`/`chat_messages` tables don't exist |
| AI triage pre-routing | ❌ **Not started** |

### Future Backlog — DEFERRED (per refined scope)

| Phase | Description | Reactivation trigger |
|---|---|---|
| Phase 6 — Mobile | Expo + React Native companion; offline geolocation sync | Tier 1+2 retention shows repeat-trip behavior |
| Phase 7 — Tier 3 Marketplace | Physical guide matching; RNAAT compliance; dispatch | Tier 1+2 monetization > break-even + RNAAT review + ops partner |

### Tech stack alignment

| Stack item | Spec | Current |
|---|---|---|
| Next.js 16 + RSC | required | ✅ in use (Next 16.2.4 per dev.log) |
| Vercel AI SDK | required | ❌ not wired — `packages/ai` uses direct OpenAI integration |
| Zustand | required | ❌ not in use — no transient state store |
| Tailwind v4 | required | 🟡 unspecified version; existing CSS-token system in place |
| Bun | optional runtime | ❌ not in use — pnpm/Node |
| Upstash QStash + Redis | queue/cache | ❌ not in use — `apps/workers` is bounded-local |
| PostGIS | required | ❌ not enabled |
| pgvector | required | ❌ not enabled |

### Pre-existing tech debt (carried, recently fixed)

- `packages/db/src/index.ts` had `isPersistenceConfigError` shadow re-export; **removed** (`7a4f555`).
- 11 placeholder copy items in admin/reviewer `EmptyState` + `"Active MVP"` status label; **replaced** (`7a4f555`).
- 6 admin pages had `error.message` fall-through in catch blocks; **replaced** with generic fallbacks (`3cb58a1`).
- Vitest include pattern excluded `*.test.tsx`; **fixed** (`253da10`).
- `.sisyphus/`, `.omk/`, `.kimi/`, `.playwright-mcp/` untracked tool state; **removed** (`bc1aa48`, `339ffb9`).
- 9 scratch debug scripts + `apps/web/playwright-report/`; **deleted** (`253da10`).

---

## 3. Operational Roadmap — Launch-Readiness Phases

These phases unblock production deployment. They run alongside the refined 5-phase engineering plan; many refined-phase items have local-only implementations that need operational work below to ship.

### Phase 0 — Audit + Housekeeping ✅ Complete (2026-07-02)

Repo cleanup, copy fixes, db shadow removal, vitest `*.test.tsx` discovery, project-content tracking. See commits `e49a624` … `e7e7f23`.

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

### Phase 3 — Hosted Worker Runner (decision made: Upstash QStash)

Goal: move `apps/workers` from bounded local to Upstash QStash (decision documented in `docs/spec-refined-2026.md` §6).

| # | Task |
|---|---|
| 3.1 | Add Upstash QStash SDK to `apps/workers` |
| 3.2 | Replace bounded-local entrypoint with QStash handler |
| 3.3 | Wire PDF/Calendar export jobs to QStash |
| 3.4 | Add Upstash Redis caching for place lookups |

### Phase 4 — Live Provider Integrations

Replace deterministic stubs with live providers at the package boundary:
- `@repo/payments` → live Stripe + webhooks
- `@repo/emails` → live Resend
- `@repo/ai` → live **Vercel AI SDK** (replace direct OpenAI integration per refined spec §3)
- `@repo/maps` → live Mapbox GL (replace stub)

### Phase 5 — Spec-Phase 1 Backfill (Foundations)

| # | Task | Spec Phase |
|---|---|---|
| 5.1 | Enable PostGIS extension on hosted | Refined 1 |
| 5.2 | Enable pgvector extension on hosted | Refined 1 |
| 5.3 | Add `embedding` column to `places` + add spatial column | Refined 2 |
| 5.4 | Confirm Tailwind v4 dependency (currently unspecified) | Refined 1 |

### Phase 6 — Spec-Phase 2 Backfill (Knowledge Graph — Portugal Module)

| # | Task | Spec Phase |
|---|---|---|
| 6.1 | Seed Lisbon, Sintra, Porto, Algarve place lists | Refined 2 |
| 6.2 | Generate text descriptions → pgvector embeddings | Refined 2 |
| 6.3 | Apply Mapbox minimalist skin geometries (audit existing `packages/maps`) | Refined 2 |

### Phase 7 — Spec-Phase 3 Backfill (Invisible AI Engine — Tier 1)

| # | Task | Spec Phase |
|---|---|---|
| 7.1 | Wire Vercel AI SDK into `packages/ai` (replace direct OpenAI integration) | Refined 3 |
| 7.2 | Introduce Zustand store for transient map/UI state | Refined 3 |
| 7.3 | Wire `Replace this stop` to drop the node + re-run semantic search | Refined 3 |

### Phase 8 — Spec-Phase 4 Backfill (Workspace + Checkout)

| # | Task | Spec Phase |
|---|---|---|
| 8.1 | Asymmetric timeline canvas + inline controls (per Awwwards paradigm) | Refined 4 |
| 8.2 | Live Stripe checkout + webhook → `payment_webhook_events` ledger | Refined 4 |
| 8.3 | PDF + Calendar Export Engines gated by Stripe unlock | Refined 4 |
| 8.4 | Affiliate booking attribution flow | Refined 4 |

### Phase 9 — Spec-Phase 5 Backfill (Specialist Hub — Tier 2)

| # | Task | Spec Phase |
|---|---|---|
| 9.1 | Add `chat_threads` + `chat_messages` tables | Refined 5 |
| 9.2 | Asynchronous chat infrastructure (Supabase replication) | Refined 5 |
| 9.3 | Reviewer dashboard route-timeline display (per spec §7 SLA) | Refined 5 |
| 9.4 | AI triage pre-routing | Refined 5 |

---

## 4. Future Backlog (DEFERRED — not in active roadmap)

- **Mobile companion** (Phase 6 in refined spec) — Expo + React Native + offline geolocation sync.
- **Tier 3 in-person guide marketplace** (Phase 7 in refined spec) — RNAAT compliance + physical guide dispatch.
- **International expansion** (Phase 8 in v2.0 spec) — Spain, Italy, France, Greece, Japan.

Reactivation triggers documented in `docs/spec-refined-2026.md` §5.

---

## 5. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Phase 2 schema application breaks hosted data | High | PITR backup before each migration; oldest → newest; verify `get_advisors(security)` after each |
| Phase 2.8 service-role key rotation invalidates in-flight requests | High | Coordinate with Vercel deployment window |
| Phase 3 Upstash QStash lock-in | Low-Medium | QStash has portable HTTP-cron semantics; Upstash Redis cache is replaceable with Vercel KV |
| Phase 4 provider integrations introduce latency | Medium | Provider calls wrapped in `@repo/*`; UI shows deterministic-fallback during long polls |
| Phase 5–7 spec-backfill drift from refined scope | Medium | Per-phase ADRs gate scope expansions; quarterly review against `docs/spec-refined-2026.md` |
| Bun runtime compatibility gaps with pnpm/Turbo | Medium | Bun is optional runtime; Node path stays primary |
| E2E blocked by missing Supabase env | Low | `npx supabase start` resolves |

---

## 6. References

- **`docs/spec.md`** — v2.0 Master Product Specification & Architecture Blueprint (long-term vision, 3 tiers, 8 phases).
- **`docs/spec-refined-2026.md`** — refined immediate scope (Tier 1+2 only, Awwwards design, updated tech stack, 5 active phases + 2 deferred).
- **`docs/architecture.md`** — current architecture overview.
- **`docs/adr/001-auth-rls-strategy.md`** — RLS strategy.
- **`docs/adr/002-deterministic-contracts.md`** — provider-stubbing pattern.
- **`docs/ops/launch.md`** — pre-launch gate (Phase 2).
- **`docs/ops/backup-restore.md`** — PITR / disaster recovery.
- **`docs/ops/incidents.md`** — incident response runbook.
- **`docs/ops/deploy-rollback.md`** — deployment + rollback.
- **`docs/error-monitoring.md`** — error monitoring approach.
- **`docs/audit/phase-0-cinematic-redesign.md`** — Phase 0 audit evidence.
- **`README.md`** — quick start.

---

## 7. Open Questions (need user call)

1. **Phase 2 Supabase credentials** — confirm access pattern: local-only dry-run first, then staged apply, then hosted?
2. **`apps/mobile/` scope** — definitively deferred per refined spec, or scaffold-abandoned?
3. **Tier 3 reactivation metrics** — PM-owned; what's the break-even threshold for Tier 1+2?
4. **Tailwind version audit** — current package.json has no Tailwind pin; verify v3 vs v4 baseline.
5. **Vercel AI SDK migration timing** — wire in Phase 4 (live providers) or earlier in Phase 7 (Tier 1)?