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

The route-level release checks are recorded by these Playwright artifacts:

| Journey / surface | Test artifact | State coverage |
| --- | --- | --- |
| Choice-led traveler (`/` → `/planner` → `/trip/new` → `/trip/3` → map → checkout return → export) | `playwright/tests/choice-led-traveler.spec.ts` | signed-in traveler, keyboard-only choices, reduced motion |
| Public and traveler visual routes | `playwright/tests/visual.spec.ts-snapshots/{desktop-chrome,mobile-chromium}-*.png` | 1440px desktop and 390px mobile; one main/visible h1; no placeholder imagery |
| Route accessibility | `playwright/tests/accessibility.spec.ts` and `.sisyphus/evidence/future-roadmap/task-37-axe-violations.json` | public/traveler/reviewer/admin, serious/critical axe gate, skip link, planner choice-only controls |
| Mobile overflow | `playwright/tests/mobile-overflow.spec.ts` and `.sisyphus/evidence/future-roadmap/task-36-mobile-overflow.json` | 390px document width across public, traveler, reviewer, and admin routes |
