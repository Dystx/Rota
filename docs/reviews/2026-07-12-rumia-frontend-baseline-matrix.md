# Rumia frontend baseline matrix

Updated: 2026-07-13 (post editorial proof-rail, pricing, saved-plan editor, saved-traveler surface, and utility recovery slices; full local rerun and private VPS refresh remain separately identified)

This matrix records release evidence for the approved editorial rework. A
visual mismatch is a review item, not permission to refresh a baseline.

| Route group | Desktop | Mobile | Functional/a11y evidence | Visual decision |
| --- | --- | --- | --- | --- |
| Public marketing and activity discovery | covered | covered | public contracts, viewport, a11y, visual, and full smoke checks pass; fresh standalone home smoke capture has no console errors and no map runtime request | current baselines pass; homepage rechecked after static-home correction |
| Chosen-day workspace, planner, and saved-plan editor | covered | covered | traveler lifecycle, viewport and a11y checks pass; current-source `/trip/new` manual axe/overflow/console checks pass | accepted intentional activity-first workspace/planner composition; `/trip/new` is now a secondary saved-plan editor |
| Utility/support/offline/pricing | covered | covered | focused utility tests and a11y checks pass; current-source `/offline`, `/feedback`, `/sign-in`, and `/support` run is 8/8 HTTP-success with one H1/main, zero overflow, zero console errors, and zero serious/critical axe findings | accepted after offline recovery, feedback control polish, and sign-in trust-rail polish |
| Traveler account/trips | covered | covered | protected-route and viewport checks pass; current-source account/trip/map/export run is 8/8 HTTP-success with one H1, zero overflow, zero console errors, and zero serious/critical axe findings | accepted after auth state was stable; saved-plan language, responsive schematic map fallback, and map/export affordances now match the activity-first contract |
| Reviewer/operator surfaces | covered | covered | a11y and viewport checks pass where configured | accepted dense shell treatment |
| Admin/console surfaces | covered | covered | viewport contract, authenticated smoke, a11y, and visual checks pass | accepted dense linen/no-texture operator treatment with mobile console navigation |
| Optional activity map | explicit desktop + 390x844 proof | flag-enabled | 20/20 focused activity/map tests, 6/6 spatial tests, 2/2 browser map-flow tests, typechecks pass | no map snapshots; provider licence remains a production gate |

## Evidence commands

- `pnpm typecheck` — PASS, 15/15 packages
- `pnpm lint:eslint` — PASS
- `pnpm build` — PASS, 2/2 targets
- `pnpm qa:motion-gate` — PASS, 445 files
- Smoke E2E — PASS, 6/6
- Accessibility — PASS, 61 + 1 expected skip
- Performance/Web Vitals — PASS, 14/14
- Mobile overflow — PASS, 32 mobile / 32 desktop skips
- Viewport contract — PASS, 120/120
- Activity map browser flow — PASS, 2/2 desktop + mobile with `ENABLE_ACTIVITY_MAP=true` after final map-surface fixes
- Visual — PASS, 104 passed and 32 expected skips across desktop/mobile; planner, console, and activity-detail captures refreshed
- Full smoke E2E — PASS, 303 passed and 33 expected skips
- Fresh route review capture — PASS for 78/78 HTTP-success routes at 1440×900 and 393×852; protected console API 401s are expected in the unauthenticated script and are covered by authenticated smoke/visual runs
- Homepage bundle probe — PASS; no MapLibre renderer chunk requested before map intent
- Tablet viewport contract — PASS, 120/120 at 1024×768 and 768×768; hero editorial figure is lazy-loaded to avoid cross-route preload warnings
- Private VPS refresh — PASS; release `20260713T0128Z-provider-gate` is active on
  loopback `127.0.0.1:3002`, and the `127.0.0.1:3302` SSH tunnel returned 200,
  one visible H1, no horizontal overflow, and no console errors for the
  representative public, planner, and activity-detail routes at 1440px and
  393px. Lumes remains unchanged on port 3001.
- Editorial proof-rail slice — PASS; `/how-it-works` and `/local-expertise`
  render the labelled definition-list rail at 1440px and 393px with zero
  serious/critical axe findings, no rail overflow, and no browser console
  errors on the local current-source artifact.
- Pricing hierarchy slice — PASS; `/pricing` renders the free-first proof rail
  and four labelled tier states at 1440px and 393px with zero serious/critical
  axe findings, no overflow, and truthful Future access copy for concierge.
- Saved-plan editor slice — PASS on the local current-source artifact;
  `/trip/new` uses activity-first copy, an explicit Explore hand-off, practical
  edit rows, and a truthful no-booking boundary at 1440px and 393px with one
  H1, zero horizontal overflow, zero serious/critical axe findings, and zero
  browser console errors. It is not yet present in VPS release
  `20260713T0128Z-provider-gate`.
- Saved-traveler surface slice — PASS on the local current-source artifact;
  `/account`, `/trip/[tripId]`, `/trip/[tripId]/map`, and
  `/trip/[tripId]/export` were checked at 1440×900 and 393×852 with one H1,
  zero horizontal overflow, zero serious/critical axe findings, and zero
  browser console errors. The map details panel is keyboard discoverable and
  export status chips have explicit locked/unlocked contrast. The slice is not
  yet present in VPS release `20260713T0128Z-provider-gate`.
- Utility recovery slice — PASS on the local current-source artifact;
  `/offline`, `/feedback`, `/sign-in`, and `/support` were checked at
  1440×900 and 393×852 with one H1/main, zero horizontal overflow, zero
  serious/critical axe findings, and zero browser console errors. Offline now
  exposes recovery context and feedback controls have explicit selected and
  disabled states. The slice is not yet present in VPS release
  `20260713T0128Z-provider-gate`.
