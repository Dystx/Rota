# Rumia frontend baseline matrix

Updated: 2026-07-12

This matrix records release evidence for the approved editorial rework. A
visual mismatch is a review item, not permission to refresh a baseline.

| Route group | Desktop | Mobile | Functional/a11y evidence | Visual decision |
| --- | --- | --- | --- | --- |
| Public marketing and activity discovery | covered | covered | public contracts and viewport checks pass | review current 56 mismatches before refresh |
| Chosen-day workspace and planner | covered | covered | traveler lifecycle, viewport and a11y checks pass | review intentional new workspace composition |
| Utility/support/offline/pricing | covered | covered | focused utility tests and a11y checks pass | review changed copy/shell surfaces |
| Traveler account/trips | covered | covered | protected-route and viewport checks pass | review only after auth state is stable |
| Reviewer/operator surfaces | covered | covered | a11y and viewport checks pass where configured | review dense shell separately |
| Admin/console surfaces | covered | covered | viewport contract covers operator routes | do not refresh without route-owner review |
| Optional activity map | explicit desktop proof | manual mobile follow-up | 10 facade + 6 spatial tests, 1/1 browser map-flow test, typechecks pass | no snapshot yet; keep mobile/provider-error proof open |

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
- Activity map browser flow — PASS, 1/1 desktop Chrome
- Visual — 14/70 pass, 56 review mismatches; snapshots unchanged
