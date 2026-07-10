# Plan Audit — Rumia activity-curation reconciliation

**Date:** 2026-07-10 · **Verdict:** NOT READY

## Inputs audited

- `docs/superpowers/plans/2026-07-10-rumia-full-rework-master.md`
- `docs/superpowers/plans/2026-07-10-rumia-phase-1-public-discovery.md`
- `docs/superpowers/plans/2026-07-10-rumia-phase-2-living-brief.md`
- `docs/superpowers/plans/2026-07-10-rumia-phase-3-traveler-commerce.md`
- `docs/superpowers/specs/2026-07-10-rumia-full-product-rework-design.md`
- `docs/superpowers/specs/2026-07-10-rumia-activity-curation-design.md`

## Principles alignment

| Check | Status | Note |
| --- | --- | --- |
| Vertical slices | ⚠️ | The master has good phase slices, but Phase 1/2 acquisition work describes a different product from the activity-curation design. |
| Scope bounded | ⚠️ | The activity design bounds the public pivot, but it needs an explicit supersession map for old public-route work. |
| Success criteria | ✅ | Both plans contain testable route, accessibility, truthfulness, and security checks. |
| Hard gates | ✅ | Content review status, no-mock policy, RLS, visual/a11y, payment, and provider gates are explicit. |
| Domain language | ⚠️ | Old plans use `destination`, `route`, `trip brief`, and `itinerary` as acquisition language; new design requires `activity`, `verdict`, `collection`, `day tray`, and `chosen day`. |

## Required reconciliation

| Concern | Old plan | Approved current design | Canonical decision |
| --- | --- | --- | --- |
| Product promise | “Turn intent into a realistic Portugal route.” | “What is worth doing with the time I have?” | Lead with judged activities; a route is a downstream, optional day-shaping tool. |
| Homepage primary CTA | `/planner` / “Plan Portugal” | `/explore` / activity situation | Replace primary CTA with phrase-led activity discovery. Keep planner available after selection. |
| `/explore` | Permanent redirect to `/portugal` | Activity explorer | Replace redirect with a canonical activity-results route. |
| `/explore/workspace` | Permanent redirect to `/planner` | Saved shortlist/day tray | Replace redirect with a selected-activity workspace. |
| `/portugal` | Eight-region route atlas | Activity collections plus regional judgement | Retain regional content/map context, change CTA and cards from routes to activities/collections. |
| `/planner` | Acquisition composer for an itinerary | Secondary chosen-day composer | Accept selected activity IDs, retain direct entry as a secondary tool, and remove itinerary-first public claims. |
| Hero phrases | destination, duration, pace | time, region, mood/group/constraint | Use inline activity sentence tokens; no form, select, or chatbot. |
| Public data | region facts and route archetypes | reviewed editorial activity adapter | Introduce a reviewed activity projection before any schema rewrite. |
| Trust | local specialist validates a trip | explicit editorial verdict; specialist review remains optional trip upgrade | Never imply every card has a named review or that a specialist personally checked it. |
| Route acceptance | New traveler produces itinerary first | New traveler gets judged activities, saves a transparent day, then optionally shapes it | Update public acceptance tests, screenshots, and analytics funnel. |

## Preserved work

- Portugal-first, English-only, no-chat, no-dropdown, choice-led interaction constraints remain binding.
- Existing `AppLayout`, public/traveler and operator shell separation, role/RLS rules, provider flags, payment integrity, export, review, and beta gates remain valid.
- The three-tier commercial catalog stays a secondary trip/upgrade concern; discovery must not lead with checkout.
- Map/list accessibility, owned-asset rules, performance budgets, one-main/one-h1, mobile overflow, and route-matrix verification remain binding.

## Superseded plan portions

Do not execute these old instructions without rewriting them into the activity model:

1. Master route-normalization rows that redirect `/explore` or `/explore/workspace`.
2. Phase 1.2 homepage requirement that sends the primary action to planner with destination/duration/pace.
3. Phase 1.3 atlas links labelled “Plan a <region> route”.
4. Phase 2 assumption that the first public intent must be a whole-trip itinerary brief.
5. Master completion wording that treats a full itinerary as the mandatory first consumer outcome.

## Reconciled release order

1. **Release 1A — Activity foundation:** activity vocabulary, reviewed editorial projection, phrase-led intent composer, route catalogue, and tests.
2. **Release 1B — Public activity entry:** homepage, Portugal collections, `/explore`, and `/explore/workspace`; primary public CTA enters activity discovery.
3. **Release 2 — Chosen-day composition:** planner consumes activity IDs and makes route/logistics consequences visible only after selection.
4. **Release 3 — Persisted activity day:** save selected activities and editorial review status, then connect day plans to existing trip/preview lifecycle work.
5. **Release 4+ — Existing traveler commerce, specialist operations, admin, and hardening plans:** retain their order, but replace itinerary-first acquisition copy and metrics with the activity funnel.

## Required shared contracts

```ts
export type ActivityIntent = {
  region: "porto" | "lisbon" | "douro" | "algarve" | "azores";
  timeWindow: string;
  moods: readonly string[];
  group: string;
  constraints: readonly string[];
};

export type EditorialActivity = {
  id: string;
  verdict: string;
  editorialStatus: "reviewed" | "draft";
  durationMinutes: number;
  bestTime: string;
  avoidWhen: string | null;
  alternativeId: string | null;
};
```

Only `editorialStatus: "reviewed"` records may enter a public result. Query
state uses repeated `activity` keys for selected IDs. The planner accepts these
IDs as optional context and must keep current behavior unchanged when none are
present.

## Pre-flight answers

| Question | Value |
| --- | --- |
| Test | `pnpm test:unit` (focused: `pnpm exec vitest run <path>`) |
| Build | `pnpm build` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| CI | GitHub Actions: `.github/workflows/ci.yml` |
| Git workflow | isolated feature worktree, conventional commits |
| Primary stack | TypeScript, Next.js App Router, React, Tailwind, Vitest, Playwright, Supabase |
| Repository | existing monorepo |

## Open gates

- [ ] Replace the master plan's route table and Phase 1/2 interface ledger with the reconciled activity contracts before build execution.
- [ ] Define a reviewed Portugal activity seed inventory and editorial owner; static seed records cannot be invented as production truth.
- [ ] Create a single implementation plan for Releases 1A–1B with exact tests, file boundaries, route migration, analytics, and visual assertions.
- [ ] Update the master acceptance criteria and funnel event names from `planner started`/`trip generated` to include `activity intent started`, `activity shortlist saved`, and `chosen day opened`.
- [ ] Resolve the managed PostGIS and leaked-password security advisor gates before enabling live public data features.

## Verdict

**NOT READY.** The current design is clear, but the old master and Phase 1/2 plans are authoritative in conflicting ways. Replace their public acquisition and route-normalization sections with a single activity-curation implementation plan, then run a new audit. Do not execute the old public-plan tasks as written.
