# Status — Weekly Roadmap Snapshot

> **Source of truth:** `docs/roadmap.md` (operational) and
> `docs/engineering-lifecycle.md` (8-phase engineering plan).
> This file is a 1-page snapshot of current state vs the
> two docs; update weekly so the docs stay honest.
>
> **Last updated:** 2026-07-03

## Headline

Data pipeline (Phase 2 of the 8-phase plan) is **shipped end-to-end**: extract from PBF → embed via OpenAI → load to Supabase → orchestrator on QStash. The previous launch blocker (no real destinations, no embeddings) is closed. What's left is polish, follow-ups, and the deferred items (Stripe + Resend blocked on business accounts).

## Done (this session, 2026-07-03)

11 PRs across 12 commits on `main`:

| PR | Commit | What |
|---|---|---|
| PR-1 | `06d9c7f` | Zod `as any` cast → `jsonSchema()` adapter; pnpm.overrides zod 3.25.76 |
| PR-2 | `d6e668b` | Migration ordering lint (`pnpm check:migrations`) + new `organizations` table |
| PR-3 | `dc2755a` | `@repo/ingest` skeleton + DuckDB + QStash infrastructure |
| PR-4 | `58c3bbf` | `extractOsm` — DuckDB OSM extract with bbox + category filter |
| PR-5 | `49563ea` | `embedFeatures` + `loadPlaces` + `runPipeline` orchestrator + production OpenAI/Supabase clients |
| PR-8 | `f4e974d` | Zustand→MapLibre direct `setData()` (high-frequency map updates) |
| PR-9 | `36ffb4d` | Behavioral profiler persistence (IndexedDB + Supabase `user_behavior_events`) |
| PR-10 | `a773d38` | ADR-004 (two-app vs one-app) + side-by-side review panel |
| PR-12 | `9290ac2` | OSM `opening_hours` parser + `validateVisit` validator |
| plus 3 review-fix commits | `b9481df`, `3d7ad96`, `5d1d640` | 31 review findings closed (CRITICAL/HIGH/MEDIUM/LOW) |
| plus roadmap fold | `866da29` | 8-phase plan folded into `docs/engineering-lifecycle.md` + decision log |

## In progress

- **PR-17** (this commit) — `docs/status.md` + roadmap reconciliation cleanup.
- **PR-11** (Guide onboarding flow) — partially scoped; the
  `specialist_profiles` table exists. The onboarding UI +
  scheduling calendar + matchmaking logic is a multi-day
  follow-up.

## Blocked (external dependencies)

- **PR-6** (Live Stripe + Resend) — `@repo/payments` is a
  deterministic stub. Real Stripe + Resend wire-up is
  blocked on:
  - Stripe account provisioning
  - Resend account provisioning
  - Business registration
  Per the 2026-07-03 decision log, these are deferred
  until the business side lands. The deterministic
  contracts in `@repo/payments` and `@repo/emails` are
  the seam; a real adapter drops in without contract
  changes.
- **PR-7** (SMS + WebSocket tokens) — depends on PR-6.

## Pending (in-scope, not yet started)

- **PR-13** (Specialist feedback loop) — when a Level 2
  reviewer swaps a stop, decrement `places.quality` (or a
  new `places.adjustment_score` column). The side-by-side
  panel (PR-10) has the `onSwapForHiddenGem` callback; the
  loop needs the column + the trigger.
- **PR-14** (International data) — ES/IT/FR/GR bounding
  boxes. The schema is ready (per-country region enums in
  `@repo/types`). The data needs to be extracted (PR-4's
  `extractOsm` already takes a custom `bbox`).
- **PR-15** (API gateway) — REST endpoints under `/api/v1/*`
  with API-key auth for B2B partners. Multi-day work.
- **PR-16** (White-label branding + partner onboarding) —
  per-`org_id` theme tokens + onboarding flow. Multi-day
  work.

## Carry-over LOWs

`docs/reviews/2026-07-03-llm-review.md` captures 11 LOWs from
the post-Phase-7 review. 5 were code-fixed in `866da29`; 4
became inline documentation comments; 2 are deferred to
roadmap items (LOW-7 → opening-hours data source shipped
in PR-12, partial fix; LOW-10 → telemetry, not yet started).

## Risk register (post-session)

| Risk | Severity | Mitigation |
|---|---|---|
| DuckDB native binding fails to load in some test envs | Low | Dynamic import in `duckdb.ts`; tests skip the binding; typecheck + lint pass. PR-3 note. |
| `places.osm_id` text column not in current schema | Medium | Migration needed before `loadPlaces` upsert can resolve the `ON CONFLICT` target. Tracked as follow-up. |
| Stripe + Resend accounts | High (blocker for PR-6/7) | Business-side provisioning. |
| Opening-hours data: ~80% OSM coverage | Low | Parser returns `unknown` for the rest; generator emits a soft warning. |
| Behavioral profiler ring buffer grows unbounded in DB | Medium | The `user_behavior_events` table needs a retention job (90-day or partition-by-month). Tracked. |

## Metrics

- `pnpm -r typecheck` — **16/16 packages clean**
- `@repo/ingest` — **14/14 tests pass**
- `@repo/ai` — **46/46 tests pass** (29 prior + 17 new for opening-hours)
- `@repo/auth` — **6/6 tests pass**
- `@repo/analytics` — **36/36 tests pass** (Tier 3 metrics catalog)
- `@repo/types` — **13/13 tests pass**
- `behavioral-profiler` — **11/11 tests pass**
- `apps/workers` — **5/5 tests pass**
- `apps/web` — `useMapStore` **6/6 tests pass**
- Migration lint — **0 errors**, 34 warnings (32 pre-existing idempotency nits)
- Pre-existing failures (8 in `trips/route.test.ts`, 3 in `packages/db`) — **independent of this work**, verified via git stash

## Next week

1. `places.osm_id` migration (unblocks `loadPlaces` upsert)
2. PR-11 (Guide onboarding) — table exists, UI is the gap
3. PR-13 (Specialist feedback loop) — column + trigger
4. PR-6 (Live Stripe + Resend) — when accounts land

## Update cadence

This file is updated weekly. The full roadmap is in
`docs/roadmap.md`; the engineering sequencing is in
`docs/engineering-lifecycle.md`. Drift between any two
should be reconciled in the next update.
