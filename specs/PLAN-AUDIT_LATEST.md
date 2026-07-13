# Plan Audit — Rumia activity-first roadmap and optional activity map

**Date:** 2026-07-12 · **Verdict:** READY FOR PRIVATE RELEASE; NOT READY FOR MAP/PUBLIC PRODUCTION

This audit supersedes the 2026-07-10 activity-curation audit. The canonical
roadmap is now the activity-first master plan, with the optional map capability
kept in a separate specification so visual enhancement cannot displace the
core generated-plan journey.

## Inputs audited

- `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`
- `docs/superpowers/plans/2026-07-12-rumia-frontend-deep-redesign.md`
- `docs/superpowers/specs/2026-07-10-rumia-activity-curation-design.md`
- `docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md`
- `docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md`
- `docs/reviews/2026-07-11-rumia-browser-ui-review.md`
- `docs/ops/rumia-content-approval.md`
- `docs/ops/map-provider-licensing.md`
- `docs/ops/geographic-route-contract.md`
- `CONVENTIONS.md`
- Existing `@repo/spatial-engine` README and MapLibre adapter contract

## Principles alignment

| Check | Status | Note |
| --- | --- | --- |
| Vertical slices | ✅ | Release 1A/1B activity discovery, Release 2 chosen-day composition, and the map phases each have user-visible boundaries and gates. |
| Scope bounded | ✅ | Portugal-wide reviewed activity coverage is explicit; map Phase 1 is limited to one-to-five selected activities and excludes 3D, booking, navigation, and chatbot work. |
| Success criteria | ✅ | Core route, truthfulness, accessibility, performance, browser, and Phase 1 map acceptance criteria are stated. |
| Hard gates | ✅ | Reviewed-content gate, browser P0/P1 gate, owner/auth gate, provider/licence gate, and reduced-motion/fallback gate are identifiable. |
| Domain language | ✅ | `activity`, `verdict`, `day tray`, `chosen day`, `route segment`, and `map fallback` are used consistently; map camera state is explicitly non-authoritative. |

## Reconciled decisions

| Concern | Current decision |
| --- | --- |
| Product promise | Rumia helps a traveller decide what is worth doing with limited time; mapping explains consequences after selection. |
| Geographic scope | Portugal-wide launch coverage remains the default. Porto/Northern Portugal is a depth slice, not a hard map restriction. |
| First map surface | `/explore/workspace`, list-first, after one or more selected reviewed activities. The homepage and initial `/explore` load do not depend on MapLibre. |
| Phase 1 renderer | Existing `@repo/spatial-engine` MapLibre adapter, Mercator projection, lazy client boundary, marker/list synchronization, and semantic fallback. |
| Phase 2/3 | Camera storytelling and richer 3D are separately gated capabilities after saved-day/route evidence and provider/licence/performance review. |
| Inspiration code | The referenced `london-3d` directory is inspiration only; no source, asset, copy, data, or distinctive visual/camera sequence is reused without an explicit licence or permission. |
| Route truth | Only validated, licensed route geometry is drawn. Missing geometry produces a list/proximity explanation, never a fabricated connector. |
| Backend | VPS-native Better Auth + private PostgreSQL/PostGIS + Drizzle remains the production direction; the map browser never connects directly to the database. |

## Conventions completeness

| Check | Status | Note |
| --- | --- | --- |
| Project rules | ✅ | `CONVENTIONS.md` records the activity-first, VPS-native, map/licence, UI, and verification boundaries. No `AGENTS.md` or `CLAUDE.md` was found, so package-specific rules still take precedence if added later. |
| Specs layout | ✅ | `docs/superpowers/specs/` and `specs/` are present; the map capability has a dedicated spec and the master plan links to it. |
| Commit convention | ⚠️ | Conventional-commit language appears in existing workflow guidance, but this review does not create or stage a commit. |
| Git workflow | ✅ | Existing work is in the isolated `rumia-phase0` worktree; unrelated dirty changes must remain untouched. |

## Pre-flight answers

| Question | Value |
| --- | --- |
| Test | `pnpm test:unit`; focused tests with `pnpm exec vitest run <path>`; browser tests through the existing `apps/web` Playwright scripts. |
| Build | `pnpm build` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| CI | GitHub Actions: `.github/workflows/ci.yml` |
| Primary stack | TypeScript, Next.js App Router, React, Tailwind, Vitest, Playwright, `@repo/spatial-engine`/MapLibre; production persistence is VPS-native Better Auth, PostgreSQL/PostGIS, and Drizzle. |
| Repository | Existing monorepo; this pass includes the isolated UI implementation and its verification evidence. |

## Remaining gates before map/production enablement

- [x] Execute UI-0/UI-1 from the full redesign plan: close the existing browser
  P0/P1 findings and rerun desktop/mobile, keyboard, announcement, reduced-
  motion, and browser-warning evidence. The full smoke, visual, accessibility,
  and performance matrices are green in the current artifact at the configured
  Desktop Chrome and 390×844 mobile viewports; manual 1440×900 evidence is also
  recorded.
- [x] Capture the remaining 1024px and 768px UI-5 route rows. The explicit
  `@viewport-qa` Playwright contract passed **70/70** against a fresh
  production artifact and wrote 70 first-viewport captures under
  `.sisyphus/evidence/future-roadmap/viewport-contract/`.
- [ ] Approve the reviewed Portugal activity corpus and its editorial freshness
  policy. The activity composer → judged results → save/remove/reorder →
  workspace/list journey is stable, and the automated corpus contract now
  verifies the current five-region seed. Editorial coverage/freshness approval
  is still a product owner gate before enabling the optional map feature flag.
- [ ] Approve a basemap/style provider, tile/glyph/sprite terms, OpenStreetMap
  attribution, and route-provider licence/quota before any route geometry or
  3D source is used. A VPS-native Protomaps PMTiles + Valhalla path is now the
  recommended candidate; owner/legal acceptance and operational budget remain
  open. The alternatives and CARTO commercial-license blocker are recorded in
  `docs/ops/map-provider-licensing.md`.
- [x] Add the geographic route contract separately from the schematic `x`/`y`
  route points; `packages/types/src/geographic-route.ts` is strict and tested,
  and the boundary is documented in `docs/ops/geographic-route-contract.md`.
- [x] Reconcile the remaining Supabase-oriented CI/operations checks with the
  approved VPS-native architecture. Active CI/runtime checks now enforce the
  VPS-native Better Auth + PostgreSQL contract; historical Supabase material is
  explicitly retired/archive-only. Private VPS cutover and backup/restore
  evidence are recorded in `docs/ops/cutover-evidence.md`; public ingress is
  intentionally deferred by the owner's existing `no rumia.pt for now`
  decision and is not a blocker for the private release.
- [x] Seed project-level convention rules in `CONVENTIONS.md`. A future
  package-specific `AGENTS.md` or `CLAUDE.md` may add stricter rules.

## Implementation reconciliation (11 July 2026)

The UI-0/UI-1 implementation is complete after this audit: shared icon output is now SVG
and self-contained, core activity save/remove states are announced and
reversible, planner dark-surface labels are context-aware, `/support` uses the
public shell, mobile navigation restores focus, the console pipeline wraps on
small screens, and the hero map defaults to a quiet Portugal Mercator context.
The second pass also removed remaining public and operator literal icon output,
reduced the ambient mobile map layer, and rebuilt the production artifact. A
fresh browser pass now covers `/explore`, the chosen-day workspace, console
pipeline, and utility routes with current artifact evidence; the activity
save/remove/undo announcements are verified. The optional activity-map Phase 1
now exists as a separate lazy, list-equivalent MapLibre surface with a
list-safe fallback. The current trip `/map` route remains a separate live
MapLibre surface; the new activity-map route does not change trip-map
ownership or introduce route geometry.

The typed `ENABLE_ACTIVITY_MAP` flag now controls the implemented Phase 1
activity-map surface and defaults off. The workspace route reads the flag and
the component itself is opt-in by default, so the activity list remains the
safe hosted default.

The 12 July local review follow-up also fixed two current-surface defects:
metadata now reflects activity curation without duplicated template suffixes,
and the root MapLibre error suppressor is lazy so the production homepage emits
no MapLibre chunk. The standalone review server is stable on local port 3002;
the development compiler is not used as the review runtime.

The 12 July frontend review is now consolidated in the single deep-redesign
plan rather than split across overlapping UI documents. It covers the full
component inventory, tokens, backgrounds, asset direction, motion,
public/traveler/operator surfaces, and the optional map/3D boundary. It keeps
the homepage map-free on initial load and defers 3D until chosen-day evidence
and licensing/performance gates are proven.

The current browser tunnel on 3302 still shows an older globe-first homepage
and legacy planner chapter. That is recorded as a source/artifact parity gate,
not accepted as the current visual baseline. The active source has the
activity-first copy and the deep redesign plan now requires a fresh build,
served-commit proof, route-by-route captures, and an explicit background/surface
review before visual acceptance.

The current release evidence clears the route-wide visual, accessibility,
reduced-motion, performance, and build gates: visual snapshots are 70/70,
accessibility is 61 passed with one expected skip, performance/Web Vitals is
14/14, root typecheck is 15/15 packages, the production build is 2/2 targets,
the motion gate scans 434 files, mobile overflow is 32/32, and the viewport
contract is 120/120. The focused activity-map suite is 20/20, spatial tests
are 6/6, and the explicit map browser flow is 2/2 at desktop and 390x844.
Globe terrain remains opt-in and disabled by default, so an unapproved DEM
provider cannot be fetched by the homepage context layer. Application
assertions remain strict; visual actuals were reviewed before the accepted
baseline commit.

## Verdict

**CORE FUNCTIONAL UI + ACTIVITY-MAP PHASE 1: READY FOR PRIVATE REVIEW.
PRIVATE VPS RELEASE: VERIFIED. DEEP VISUAL REDESIGN ACCEPTANCE: OPEN. FULL
MAP/PUBLIC PRODUCTION: NOT READY.** Automated gates and the Phase 1 map
implementation are evidenced, but the current 3302 visual target is stale and
the new deep-redesign background/surface pass has not yet been accepted against
a fresh served artifact. The remaining owner decisions for map/public
production are explicit reviewed-content approval and provider/licensing
approval. Public ingress is intentionally deferred by the existing owner
decision. Keep Phase 2 camera storytelling and Phase 3 3D deferred until those
gates and additional usage evidence clear; do not start them from the
inspiration example alone.
