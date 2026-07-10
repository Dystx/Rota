# Route quality matrix

This matrix is the release gate for Rumia's route surfaces. Every route must
be assigned a product owner and be exercised in the states listed below before
the corresponding release is enabled.

| Surface | Routes | Required states |
| --- | --- | --- |
| Public discovery | `/`, `/portugal`, `/explore`, `/explore/workspace`, `/how-it-works`, `/pricing`, `/human-review` | desktop, mobile, loading, map fallback |
| Public utilities | `/support`, `/privacy`, `/terms`, `/sustainability`, `/offline`, `/sign-in` | desktop, mobile, keyboard, offline/return URL |
| Traveler | `/planner`, `/trip/new`, `/trip/[tripId]`, `/trip/[tripId]/map`, `/trip/[tripId]/export`, `/checkout`, `/itineraries`, `/vault`, `/account`, `/logistics` | anonymous, signed-in, empty, loading, denied, error |
| Reviewer | `/reviewer/queue`, `/reviewer/trips/[tripId]`, `/reviewer/history`, `/reviewer/operations`, `/reviewer/profile` | assigned reviewer, empty queue, forbidden, provider failure |
| Admin | `/admin/places`, `/admin/regions`, `/admin/countries`, `/admin/partners`, `/admin/reviewers`, `/admin/specialists`, `/admin/quality`, `/admin/analytics` | admin, forbidden, table empty/error, mobile cards |
| Console | `/console/pipeline`, `/console/workspace`, `/console/messages`, `/console/graph`, `/console/metrics`, `/console/config` | operator data, no data, demo mode, mobile lane navigation |
| Gated beta | `/b2b`, `/b2b/[orgSlug]`, `/guide`, `/guide/onboarding`, `/expert-chat` | disabled gate, approved user/org, unauthorized, unavailable provider |

## Required checks

- Desktop screenshots at 1440px and mobile screenshots at 390px.
- One visible `h1`, one `main`, a working skip link, and no serious or
  critical axe violations.
- No horizontal document overflow on mobile; map and board scrolling is
  constrained to an explicitly labelled region.
- Auth fixtures must assert their expected authenticated marker before visual
  capture; a redirect or sign-in screen is never an accepted happy-path image.
- Every data-backed route has a loading, empty, denied, and recoverable-error
  state.

## Task 13 evidence

The entries below are the executable/listed Playwright sources. Listing a test
or a snapshot directory is not a browser-pass claim: a pass is only recorded
after the test runs against the fresh server configured in
`apps/web/playwright.config.ts`. No browser-pass artifact is asserted here.

| Journey / surface | Executable source (listed) | Browser status | State coverage |
| --- | --- | --- | --- |
| Choice-led traveler (`/` → `/planner` → `/trip/new` → `/trip/3` → map → checkout return → export) | `apps/web/playwright/tests/choice-led-traveler.spec.ts` | Failed fresh-server run: `/trip/3` redirected to `/itineraries?notice=unavailable` (seeded Supabase trip unavailable) | signed-in traveler, keyboard-only choices, reduced motion |
| Public and traveler visual routes | `apps/web/playwright/tests/visual.spec.ts` and `visual.spec.ts-snapshots/` | Pending fresh-server run | 1440px desktop and 390px mobile; one main/visible h1; no placeholder imagery |
| Route accessibility | `apps/web/playwright/tests/accessibility.spec.ts` | Pending fresh-server run | public/traveler/reviewer/admin, serious/critical axe gate, skip link, planner choice-only controls |
| Mobile overflow | `apps/web/playwright/tests/mobile-overflow.spec.ts` | Pending fresh-server run | explicit 390px document width across public, traveler, reviewer, and admin routes |

## Task 14 release-gate evidence (2026-07-10)

Commands were run from the repository root. The Playwright command used the
fresh-server configuration in `apps/web/playwright.config.ts` with both
`desktop-chrome` and `mobile-chromium` projects:

| Command | Result | Classification / notes |
| --- | --- | --- |
| `pnpm lint` | PASS | Workspace TypeScript/eslint checks completed successfully. |
| `pnpm test` | FAIL | The web test reached its API unit tests, then its fresh-server setup failed with `Another next build process is already running` because this gate's standalone `pnpm --filter web build` was still active. This is a test-environment concurrency failure; no unit-test assertion failure was reported. |
| `pnpm --filter web build` | PASS | Next production build completed. Recorded warnings: workspace-root inference due to multiple lockfiles and deprecated `middleware` convention. |
| `pnpm --filter web exec playwright test playwright/tests/choice-led-traveler.spec.ts playwright/tests/visual.spec.ts playwright/tests/accessibility.spec.ts playwright/tests/mobile-overflow.spec.ts --project=desktop-chrome --project=mobile-chromium` | FAIL (interrupted after partial run) | Fresh server started. Choice-led traveler failed on both projects at `/trip/3` because the seeded Supabase trip was unavailable and redirected to `/itineraries?notice=unavailable` (missing auth/data fixture). Accessibility failures covered public/traveler/reviewer/admin routes and are code/route-structure or auth-state failures (one-main/one-h1/axe assertions), not ignored. Visual failures are stale/changed screenshot baselines. Mobile overflow failures included authenticated `/itineraries` and `/account` state; classify as route/auth fixture failures until reproduced with seeded data. The run was interrupted after the failure pattern was established; no pass claim is made. |
| Focused fresh public a11y (`/` and `/portugal`, desktop + mobile) | PASS after loading-shell/test fixes | Resolved route landmarks are now checked after the streamed page heading appears. Loading UIs use status containers rather than competing `<main>` landmarks. Full traveler/operator matrix remains pending on seeded auth/data fixtures. |
| Playwright global setup against current hosted Supabase | PASS | Setup now provisions/reuses a uniquely marked traveler-owned trip (trip id `9` in the current run), falls back to service-role inserts when the transaction RPC is absent, and never mutates foreign records. |

## Choice-only interaction evidence (2026-07-10)

- `/trip/new` always renders `TripBriefReview`; date, context, and refinement flows
  use preset chips and option sheets, with no rendered input/select/textarea controls.
- `/planner` destination changes use finite Portugal `ChoiceCard` options and
  travel windows use season chips; no editable text controls are rendered.
- Focused Vitest coverage: 270 web tests passed, including planner, trip review,
  access, commerce, export, messaging, and route API tests.
- Full workspace Vitest verification now passes: 94 files / 689 tests.
- Web production build completes successfully and includes all traveler,
  operator, beta-gated, export, and messaging routes.
- Operator console fixtures are explicitly labeled “Demo data”, use Portugal
  content, and no longer expose the prior Kyoto/Japan/search placeholders.
- Guide beta portraits now use an authenticated, user-prefixed private Storage
  bucket with MIME/signature/size validation and signed previews; legacy remote
  portrait URLs are cleared and rejected by the migration constraint.
| `git diff --check` | PASS | No whitespace errors. |
