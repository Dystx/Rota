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
| Visual snapshots | PASS | 70/70 passed after route-by-route review; intentional redesign baselines accepted in `5b652a4` |

The 56 mismatches from the pre-review run were intentional editorial redesign
changes (including the activity-first homepage, chosen-day workspace, and
operator surfaces). The approved actuals are now the committed desktop/mobile
baselines; a no-update rerun is green.

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

## Required follow-up

1. Keep the dedicated map test in the public discovery suite and run it with
   both desktop and 390x844 projects when the optional flag is enabled.
2. Before production enablement, complete the owner-approved basemap/route
   provider and licence record in `docs/ops/map-provider-licensing.md`. Until
   then, keep `ENABLE_ACTIVITY_MAP=false` in hosted environments and retain
   the semantic list/fallback path.

## Status

**PASS for the frontend implementation and release evidence.** All static,
functional, accessibility, performance, motion, overflow, viewport, visual,
and optional Phase 1 map-flow gates are green. Production map enablement is a
separate external provider/licensing approval gate and remains intentionally
closed.
