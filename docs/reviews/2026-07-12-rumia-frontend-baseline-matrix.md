# Rumia frontend baseline matrix

Updated: 2026-07-13 (private cinematic release verified; public ingress deferred)

This matrix records release evidence for the approved editorial rework. A
visual mismatch is a review item, not permission to refresh a baseline.

| Route group | Desktop | Mobile | Functional/a11y evidence | Visual decision |
| --- | --- | --- | --- | --- |
| Public marketing and activity discovery | covered | covered | public contracts, viewport, a11y, visual, and full smoke checks pass; private release route smoke has no console errors or map runtime request before intent | private cinematic release `20260713T204125Z-cinematic-fix` passes CTA hierarchy, detail save action, chapter surfaces, activity-led cards, and MP4 delivery |
| Chosen-day workspace, planner, and saved-plan editor | covered | covered | traveler lifecycle, viewport and a11y checks pass; private release activity-flow smoke reaches chosen day and feedback | private release passes empty workspace composition, direct-planner language, and saved-day continuity |
| Utility/support/offline/pricing | covered | covered | focused utility tests and a11y checks pass; private release routes return 200 with one H1/main, zero overflow, zero console errors, and reduced-motion-safe media | private release passes narrative and first-viewport hierarchy; public ingress remains deferred |
| Traveler account/trips | covered | covered | protected-route and viewport checks pass; current-source account/trip/map/export run is 8/8 HTTP-success with one H1, zero overflow, zero console errors, and zero serious/critical axe findings | accepted after auth state was stable; saved-plan language, responsive schematic map fallback, and map/export affordances now match the activity-first contract |
| Reviewer/operator surfaces | covered | covered | a11y and viewport checks pass where configured | accepted dense shell treatment on the current local artifact |
| Admin/console surfaces | covered | covered | viewport contract, authenticated smoke, a11y, and visual checks pass | current local artifact passes dense shell, console vocabulary, and editorial review hierarchy |
| Optional activity map | explicit desktop + 390x844 proof | flag-enabled | 20/20 focused activity/map tests, 6/6 spatial tests, 2/2 browser map-flow tests, typechecks pass | no map snapshots; provider licence remains a production gate |

## Evidence commands

- `pnpm typecheck` — PASS, 15/15 workspace packages; root static gates also pass
- `pnpm build` — PASS, 2/2 build targets and 64 Next routes
- `pnpm lint:eslint` — PASS
- `pnpm test:rls` — PASS, PostgreSQL policy contract
- `pnpm qa:motion-gate` — PASS, 448 files
- Changed-slice suite — PASS, 13/13
- Accessibility — PASS, 63 + 1 expected skip
- Performance/Web Vitals — PASS, 14/14
- Mobile overflow — PASS, 32 mobile / 32 desktop skips
- Viewport contract — PASS, 120/120
- Activity map browser flow — PASS, 2/2 desktop + mobile with `ENABLE_ACTIVITY_MAP=true` after final map-surface fixes
- Visual — PASS, 72 passed across the cinematic desktop/mobile run; the suite's intentional route skips remain documented
- Full smoke E2E — PASS, 303 passed and 33 expected skips after the mobile
  Explore save-label baseline was regenerated
- Fresh route review capture — PASS for the current representative desktop/mobile route sample at 1440×900 and 393×852; no horizontal overflow or browser console errors were observed on the local exact artifact
- Homepage bundle probe — PASS; no MapLibre renderer chunk requested before map intent
- Tablet viewport contract — PASS, 120/120 at 1024×768 and 768×768; hero editorial figure is lazy-loaded to avoid cross-route preload warnings
- Local exact-artifact review — PASS; the current dirty tree is served at
  `127.0.0.1:3304` and the representative public, planner, activity-detail,
  workspace, console, utility, and auth routes were checked at desktop/mobile
  sizes with one H1, one main, no horizontal overflow, and no browser console
  or page errors across 26 route/viewport pairs. The approved cinematic
  artifact is privately released as `20260713T204125Z-cinematic-fix` on
  `127.0.0.1:3002`; Lumes remains unchanged on port 3001.
- Private release smoke — PASS; through `127.0.0.1:33302`, desktop and mobile
  checks returned 200 for `/`, `/portugal`, `/explore`,
  `/explore/workspace`, `/planner`, `/support`, `/sign-in`, and the activity
  detail. Each route had one H1/main, no overflow, and no console/page errors.
  Both local MP4 derivatives returned `video/mp4` with exact manifest byte
  sizes; reduced-motion rendered poster-only. The activity situation → save →
  chosen day → feedback flow completed successfully.
- Editorial proof-rail slice — PASS; `/how-it-works` and `/local-expertise`
  render the labelled definition-list rail at 1440px and 393px with zero
  serious/critical axe findings, no rail overflow, and no browser console
  errors on the local current-source artifact.
- Pricing hierarchy slice — PASS; `/pricing` renders the free-first proof rail
  and four labelled tier states at 1440px and 393px with zero serious/critical
  axe findings, no overflow, and truthful Future access copy for concierge.
- Saved-plan editor slice — PASS on the deployed merged-main artifact;
  `/trip/new` uses activity-first copy, an explicit Explore hand-off, practical
  edit rows, and a truthful no-booking boundary at 1440px and 393px with one
  H1, zero horizontal overflow, zero serious/critical axe findings, and zero
  browser console errors. It is represented by VPS release
  `20260713T042000Z-main-2a8c394`.
- Saved-traveler surface slice — PASS on the deployed merged-main artifact;
  `/account`, `/trip/[tripId]`, `/trip/[tripId]/map`, and
  `/trip/[tripId]/export` were checked at 1440×900 and 393×852 with one H1,
  zero horizontal overflow, zero serious/critical axe findings, and zero
  browser console errors. The map details panel is keyboard discoverable and
  export status chips have explicit locked/unlocked contrast. The slice is
  represented by VPS release `20260713T042000Z-main-2a8c394`.
- Utility recovery slice — PASS on the deployed merged-main artifact;
  `/offline`, `/feedback`, `/sign-in`, and `/support` were checked at
  1440×900 and 393×852 with one H1/main, zero horizontal overflow, zero
  serious/critical axe findings, and zero browser console errors. Offline now
  exposes recovery context and feedback controls have explicit selected and
  disabled states. The slice is represented by VPS release
  `20260713T042000Z-main-2a8c394`.
