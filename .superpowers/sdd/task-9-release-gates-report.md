# Rumia frontend release-gate evidence

Date: 2026-07-12
Branch: `codex/rumia-phase0`
Scope: frontend aesthetic rework Tasks 1–9, including the optional Phase 1
activity map.

## Static gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Root typecheck | PASS | 15/15 packages passed |
| ESLint | PASS | `pnpm lint:eslint` |
| Production build | PASS | 2/2 build targets passed with local PostgreSQL/Better Auth test env |
| Diff check | PASS | `git diff --check` |
| Motion gate | PASS | 434 files checked |

## Browser gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Smoke E2E | PASS | 6/6 |
| Accessibility | PASS | 61 passed, 1 expected skip (62 total) |
| Performance + Web Vitals | PASS | 14/14 |
| Mobile overflow | PASS | 32 mobile checks passed; 32 desktop cases intentionally skipped |
| Viewport contract | PASS | 120/120 `@viewport-qa` checks |
| Visual snapshots | HISTORICAL PASS | 70/70 passed after route-by-route review; intentional redesign baselines accepted in `5b652a4` before the later static-home/map-guard corrections |

The 56 mismatches from the pre-review run were intentional editorial redesign
changes (including the activity-first homepage, chosen-day workspace, and
operator surfaces). The accepted baselines remain historical evidence for the
unchanged surfaces. After the later homepage corrections, a fresh standalone
desktop/mobile smoke capture was manually reviewed: the static Portugal
fallback rendered, no GlobeWorkspace mounted, no browser console errors were
observed, and the 390px document width matched the viewport. The full visual
suite was not rerun because its global E2E setup requires an owner database
credential that is not available in this checkout.

## Activity-map evidence

- Pure model, fallback, layer, and facade tests: 10/10 passed in the map
  implementation gate; the final focused activity/map suite is 20/20.
- Spatial-engine package tests: 6/6 passed.
- Web and spatial typechecks passed.
- Dedicated browser proof: `public-discovery.spec.ts` activity-map test passed
  2/2 on desktop Chrome and 390x844 mobile (explicit open, map-or-fallback
  surface, complete list, and close/list recovery) with
  `ENABLE_ACTIVITY_MAP=true`.
- The workspace route now reads the typed `activityMap` feature flag; the
  default `.env.example` value remains `false`, so the map is opt-in and
  removable without changing the activity-list journey.
- No map snapshots were added or refreshed.
- Homepage bundle probe after the static-home/map-guard corrections: 15 chunks
  loaded; no `maplibre-gl`, `MapLibreSpatialEngine`, or `mountMapLibreInstance`
  runtime chunk was requested before map intent. The small deferred error-guard
  module remains in the app shell and does not import the renderer until a
  `[data-map-capable]` surface appears.

## Required follow-up

1. Keep the dedicated map test in the public discovery suite and run it with
   both desktop and 390x844 projects when the optional flag is enabled.
2. Before production enablement, complete the owner-approved basemap/route
   provider and licence record in `docs/ops/map-provider-licensing.md`. Until
   then, keep `ENABLE_ACTIVITY_MAP=false` in hosted environments and retain
   the semantic list/fallback path.

## Status

**PASS for the frontend implementation and recorded release evidence.** Static,
functional, accessibility, performance, motion, overflow, viewport, and the
optional Phase 1 map-flow evidence are green as recorded above. The visual
snapshot suite is historical after the final homepage corrections; the fresh
homepage smoke capture is green, while a full rerun remains pending the owner
database E2E credential. Production map enablement is a separate external
provider/licensing approval gate and remains intentionally closed.
