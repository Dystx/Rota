# Rumia frontend baseline matrix

Updated: 2026-07-12 (post homepage/map-guard corrections)

This matrix records release evidence for the approved editorial rework. A
visual mismatch is a review item, not permission to refresh a baseline.

| Route group | Desktop | Mobile | Functional/a11y evidence | Visual decision |
| --- | --- | --- | --- | --- |
| Public marketing and activity discovery | covered | covered | public contracts and viewport checks pass; fresh standalone home smoke capture has no console errors and no map runtime request | prior baselines accepted; homepage manually rechecked after static-home correction |
| Chosen-day workspace and planner | covered | covered | traveler lifecycle, viewport and a11y checks pass | accepted intentional editorial workspace composition |
| Utility/support/offline/pricing | covered | covered | focused utility tests and a11y checks pass | accepted current copy/shell surfaces |
| Traveler account/trips | covered | covered | protected-route and viewport checks pass | accepted after auth state was stable |
| Reviewer/operator surfaces | covered | covered | a11y and viewport checks pass where configured | accepted dense shell treatment |
| Admin/console surfaces | covered | covered | viewport contract covers operator routes | accepted after route-owner review |
| Optional activity map | explicit desktop + 390x844 proof | flag-enabled | 20/20 focused activity/map tests, 6/6 spatial tests, 2/2 browser map-flow tests, typechecks pass | no map snapshots; provider licence remains a production gate |

## Evidence commands

- `pnpm typecheck` — PASS, 15/15 packages
- `pnpm lint:eslint` — PASS
- `pnpm build` — PASS, 2/2 targets
- `pnpm qa:motion-gate` — PASS, 434 files
- Smoke E2E — PASS, 6/6
- Accessibility — PASS, 61 + 1 expected skip
- Performance/Web Vitals — PASS, 14/14
- Mobile overflow — PASS, 32 mobile / 32 desktop skips
- Viewport contract — PASS, 120/120
- Activity map browser flow — PASS, 2/2 desktop + mobile with `ENABLE_ACTIVITY_MAP=true`
- Visual — historical PASS, 70/70 desktop/mobile; accepted baselines committed in `5b652a4`
- Fresh homepage smoke capture — PASS on 1440px and 390x844 after `410760d`/`5e25f5d`/`5147461`; full visual rerun remains pending owner E2E database credentials
- Homepage bundle probe — PASS; no MapLibre renderer chunk requested before map intent
