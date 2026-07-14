# Plan Audit — Rumia activity-first roadmap and optional activity map

**Date:** 2026-07-14 · **Verdict:** TECHNICAL FRONTEND BASELINE VERIFIED; VISUAL ACCEPTANCE REOPENED; MAP/PUBLIC ENABLEMENT GATED

> **2026-07-14 reconciliation:** the technical evidence in this audit remains
> useful, but it no longer closes frontend convergence. The current baseline
> and route ownership are recorded in
> `docs/reviews/2026-07-14-rumia-frontend-convergence-baseline.md`; the active
> implementation queue is
> `docs/superpowers/plans/2026-07-14-rumia-frontend-convergence-implementation.md`.

## Working-tree checkpoint

The last privately released artifact remains `20260713T042000Z-main-2a8c394`.
The current checkout is `main @ 4b394905` with an intentional, uncommitted
plan/evidence reconciliation and a local-only frontend closeout tranche:
activity-detail save, chosen-day actions, activity-first cards/planner copy,
editorial console vocabulary, quiet-route proof rails, responsive banner
wrapping, and shared contour/page-entry styling. Existing unrelated dirty
files and scratch captures remain untouched; no destructive cleanup or broad
staging was performed.

The current tree was built successfully with explicit local PostgreSQL/Better
Auth environment values and served at `http://127.0.0.1:3304/` for exact-artifact
review. The full unit suite is **173 files / 890 tests**, the changed-slice
suite is **13/13**, root build/typecheck, ESLint, PostgreSQL policy,
motion/assets/migration/safety gates, and `git diff --check` pass, and the
production build emits **64 routes**. Browser gates are green at **303/336
smoke (33 expected skips), 61/62 accessibility (1 expected skip), 104/136
visual (32 expected skips), 14/14 performance, and 120/120 viewport checks**.
A 26-pair desktop/mobile route sweep found only successful 200 responses with
one H1, one main, no horizontal overflow, and no browser console/page errors.
The final local pass also fixes feedback’s nested-main landmark, the clipped
result-card save label, and the phrase composer’s stray terminal punctuation;
home/explore baselines were regenerated. The stale `33302` tunnel is excluded
from this evidence. No VPS release was created from the local tranche.

This audit supersedes the 2026-07-10 activity-curation audit. The canonical
roadmap is now the activity-first master plan, with the optional map capability
kept in a separate specification so visual enhancement cannot displace the
core generated-plan journey.

## Inputs audited

- `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`
- `docs/superpowers/plans/2026-07-14-rumia-frontend-polish.md`
- `docs/superpowers/specs/2026-07-10-rumia-activity-curation-design.md`
- `docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md`
- `docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md`
- `docs/reviews/2026-07-11-rumia-browser-ui-review.md`
- `docs/superpowers/PLAN-INDEX.md`
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
| Git workflow | ✅ | Current work is on `main`; unrelated dirty changes, captures, and scratch files remain untouched. |

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

- [x] Execute the current-tree exact-artifact UI-0/UI-1 pass: detail save,
  workspace shape/start, activity-first cards/planner language, console
  editorial vocabulary, quiet-route actions, and shared contour/page-entry
  styling were reviewed at desktop and mobile on `127.0.0.1:3304` with no
  overflow or browser console errors. The automated route/viewport contract is
  green; any remaining manual route sign-off is a release-boundary check.
- [x] Capture the 1024px and 768px UI-5 route rows. The explicit `@viewport-qa`
  Playwright contract passed **120/120** against a fresh production artifact;
  the current responsive contract is green for the public, traveler, reviewer,
  and operator route set.
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
no MapLibre chunk. The current dirty exact-artifact review server is stable on
local port `3304`; the stale `3002`/`33302` tunnel is not the review runtime.

The 12 July frontend review is now consolidated in the single deep-redesign
plan rather than split across overlapping UI documents. It covers the full
component inventory, tokens, backgrounds, asset direction, motion,
public/traveler/operator surfaces, and the optional map/3D boundary. It keeps
the homepage map-free on initial load and defers 3D until chosen-day evidence
and licensing/performance gates are proven.

The browser tunnel on 3302/33302 may show an older release and is not accepted
as the current visual baseline. The active source now includes the
activity-detail save action, activity-first bento/planner language, chosen-day
shape actions, editorial console vocabulary, quiet-route proof rails,
responsive console-banner wrapping, and stronger contour/page-entry surface
treatment. The current-tree artifact at `127.0.0.1:3304` has been rebuilt and
reviewed at desktop/mobile representative routes; the automated route/viewport
matrix is green, and the remaining work is release-boundary sign-off and owner
decisions, not another redesign plan.

The current release evidence clears the automated visual, accessibility,
reduced-motion, performance, build, and responsive gates: visual snapshots are
104 passed with 32 expected skips, accessibility is 61 passed with one expected
skip, performance is 14/14, the production build emits 64 routes, the motion
gate scans 448 files, and the viewport contract is 120/120. The full smoke suite
is 303 passed with 33 expected skips; unit tests are 173 files / 890 tests.
The focused activity-map suite and spatial tests remain green, while Phase 2/3
map enablement stays gated.
Globe terrain remains opt-in and disabled by default, so an unapproved DEM
provider cannot be fetched by the homepage context layer. Application
assertions remain strict; visual actuals were reviewed before the accepted
baseline commit.

## Verdict

**CORE FUNCTIONAL UI + ACTIVITY-MAP PHASE 1: READY FOR PRIVATE REVIEW.
PRIVATE VPS RELEASE: VERIFIED FOR THE LAST MERGED RELEASE. CURRENT LOCAL
FRONTEND CLOSEOUT: IMPLEMENTED, EXACT-ARTIFACT REVIEWED, AND AUTOMATED GATES
GREEN; NOT RELEASED. FULL MAP/PUBLIC PRODUCTION: NOT READY.** Automated gates,
the Phase 1 map implementation, and the current local activity-first visual
tranche are evidenced. The remaining release gate is artifact provenance and
any final owner-required manual route sign-off; the local implementation has
addressed the detail save action, primary-action hierarchy, direct planner
language, operator vocabulary, responsive banner clipping, and closed-drawer
overflow.
The remaining owner decisions for map/public production are explicit
reviewed-content approval and provider/licensing approval. Public ingress is
intentionally deferred by the existing owner decision. Keep Phase 2 camera
storytelling and Phase 3 3D deferred until those gates and additional usage
evidence clear; do not start them from the inspiration example alone.
