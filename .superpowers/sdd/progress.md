# Rumia frontend polish execution ledger

Completed baseline plan: `docs/superpowers/plans/2026-07-15-rumia-frontend-finish.md`

Active follow-up plan: `docs/superpowers/plans/2026-07-18-rumia-visual-hardening-release-readiness.md`

Audit: `docs/reviews/2026-07-14-rumia-frontend-visual-audit.md`

Status: July 15 finish plan complete and pushed at `dfbc31c`; bounded July 18
visual-hardening pass is paused at explicit owner approval on
`codex/rumia-visual-hardening`

## Current checkpoint

- The July 15 corrective plan is complete. Its 2026-07-17 exact artifact and
  102-row desktop/mobile family passed the final gate and received explicit
  owner approval; the earlier authenticated RLS blocker is closed.
- A post-acceptance visual review found three bounded defects: Planner field/ink
  contrast, Home mobile stacked-scene/card geometry, and Console Workspace's
  nested mobile blank tail. The July 18 hardening plan owns only those defects,
  their regression assertions, a six-row snapshot delta, and release readiness.
- The latest pushed source is `main @ dfbc31c`. It is not the private VPS
  release recorded in the July 13 cutover evidence, and no deployment or public
  ingress change is authorized by the follow-up plan.
- The follow-up is isolated in `/Users/cheng/rota/.worktrees/rumia-visual-hardening`.
  Its focused pre-change baseline is green (37/37 unit assertions and web
  Playwright typecheck); the existing jsdom media-play notices remain baseline
  noise and are not introduced by this pass.

### Completed July 15 execution chronology

The entries below retain the dated route-by-route implementation and gate
history. Where an earlier entry says a gate was open or blocked, the final July
17 closeout later in this section supersedes it.

- The current exact standalone artifact was rebuilt from this worktree and
  exercised at `http://127.0.0.1:3105/` with process-only local build values.
- A fresh 13-route desktop/mobile audit reopened aesthetic acceptance while
  retaining the previous functional and technical evidence.
- The finished 2026-07-12 redesign and 2026-07-14 convergence plans are
  archived; they are evidence, not active task queues.
- The worktree is intentionally dirty and must not be reset or broadly cleaned.
- Map Phase 2/3, public ingress, and backend/ops changes remain outside this
  frontend polish execution.
- Shared shell, public journey, planner, quiet-page, and sign-in polish are
  implemented in the current worktree. Planner duplicate summaries were
  removed while retaining accessible edit actions.
- Legal/promise routes now use a shared document frame; the empty Saved Vault
  has a composed state and direct "Shape a day" action. Console and secondary
  route sweeps are green at desktop and mobile; the two console-message 401s
  are expected auth-gated API responses in an unauthenticated review.
- The final 36-route desktop/mobile capture matrix reports HTTP 200, no browser
  errors, and no horizontal overflow. Axe ran across 72 route/viewport pairs
  with zero serious/critical violations and zero overflow. Performance checks
  kept non-map JavaScript below 330 KB and the heaviest Portugal media route
  below the 2.5 MB total budget.
- Production build, web typecheck, UI suite (213 tests), focused web tests, and
  the final 36-route matrix are green. The owner aesthetic gate remains open.
- A follow-up home capture fixed the last visible first-paint gap in the bento:
  regional media now has local poster/background fallback and distinct Lisbon,
  Douro, and Azores imagery (`followup-home-1440-v2.png`).
- Reviewer/admin loading boundaries now retain the operator shell and are
  covered by `operator-loading.test.tsx`; settled protected-page proof still
  requires a real local session.
- After restarting the production build, fresh `/nonexistent` and `/offline`
  captures confirmed the authored 404 and offline recovery surfaces are
  styled; the earlier raw-HTML captures were stale-server evidence.
- Workspace lint, asset provenance checks, and the motion import gate are also
  green (`481` files scanned for motion violations in the latest rerun).
- Final anonymous-browser review found and fixed a sign-in trust defect:
  Better Auth/database and legacy query errors are now normalized to a generic
  accessible message with no provider, database, or `NEXT_REDIRECT` leakage.
  The rebuilt artifact was checked with wrong credentials and a legacy error
  query at both mobile and desktop widths.
- The auth package test script now uses the root Vitest configuration, so the
  full monorepo unit suite is green instead of failing on a package-local
  `server-only` alias mismatch.
- Final bounded visual pass tightened Explore's empty mobile tail without
  reducing saved-tray clearance, and added a reviewed alternative chapter to
  activity detail. Fresh 390px/1440px captures and Axe checks pass for both
  changed routes.
- Pricing now has a visible, manifest-backed Douro field-note chapter with
  poster-only media, readable side copy, and focused route evidence. A narrow
  legacy CSS selector fix keeps the field-note text from inheriting the linen
  hero treatment; the rebuilt 1440px and 390px captures were inspected.
- Account now uses utility chrome with explicit empty and unavailable decision
  states. Persistence failures expose a generic recovery message and a single
  support action rather than implementation details.
- Beta-unavailable surfaces now use an inverse decision panel with compact
  footer chrome and one return action. The exact 390px B2B capture has no
  overflow or console errors.
- The prior closeout rerun is retained as evidence: 34 public-route
  desktop/mobile checks, 180 unit files / 904 tests, web typecheck, lint,
  production build, diff check, asset provenance, and motion gate. The sign-in
  page contract test now mocks the server-only action so visual/page tests do
  not require a production database environment.
- The latest full rerun is green: 191 unit files / 957 tests, workspace and web
  typechecks, lint, production build, diff check, asset provenance, and motion
  gate (482 files scanned). The planner continuation now cancels its queued
  React handoff on unmount, closing the intermittent jsdom teardown race found
  during the gate.
- The exact current artifact now passes the final full non-visual Playwright
  matrix: 428 scheduled checks, 421 passed, and 7 intentional skips across
  desktop and mobile. This includes accessibility, protected-route,
  traveler/reviewer/admin flows, map fallback, export, checkout, Web Vitals,
  performance budgets, and 1024/768 viewport contracts. The separate
  performance suite is 14/14 green.
- The latest visual review removed three concrete acceptance defects: shared
  reveal sections no longer hide information before IntersectionObserver settles;
  Account now has a useful next-action rail without a single-card empty column;
  and Portugal mobile now uses a featured collection plus readable regional
  entries. Admin analytics operational metrics also reflow beneath their labels
  on narrow screens.
- The final admin analytics reflow passed its focused browser slice at 12/12,
  covering accessibility, performance, authorization, failure recovery, and
  viewport repetitions.
- The expanded catalogue visual contract now passes 48/48 checks (24 route/state
  cases at desktop and mobile), including local expertise, feedback, compact
  legal pages, authenticated logistics and expert chat, reviewer
  operations/profile/trip, every remaining admin/console page, and API docs.
  Together with the existing 36-route visual matrix, all 53 HTTP catalogue
  entries are now browser-captured. The capture freezes entrance motion so
  evidence shows the resting composition rather than a race with an operator
  animation.
- Catalogue captures now force the plan's exact review sizes: desktop 1440×1000
  and mobile 390×844. The corrected tablet contract separately passes 120/120
  at 1024×768 and 768×1024 across public, traveler, and reviewer routes.
- After the final process-only production rebuild, the exact standalone server
  was recaptured and the catalogue remained green at 48/48 in 58 seconds.
- That catalogue pass exposed and closed a real `/logistics` Server Components
  error: the page now passes a bound `persistLogisticsTransport` server action
  instead of an inline event handler into the client mobility selector.
- The same route review removed an internal PR code and raw trip UUID from
  operator-facing headings; the focused reviewer-trip/specialist captures are
  green at 4/4 desktop/mobile checks.
- The reviewer-trip unavailable state now exposes a visible `Back to review
  queue` recovery action; the focused desktop/mobile catalogue check is green
  at 2/2 after the change.
- Linked checkout no longer renders a raw trip UUID in the visible tier header;
  the focused package-choice lifecycle slice passes 4/4 desktop/mobile checks,
  including the owned-trip assertion.
- Linked expert messaging now labels context as `Your saved day` rather than
  showing the route identifier; its denied/empty/error baseline remains covered
  by the focused component suite.
- Expert messaging provider failures now expose a visible `Try again` action
  that reloads the conversation without changing the saved day; the focused
  component suite passes 5/5 and the exact desktop/mobile route capture passes
  2/2.
- Feedback provider failures now use an alert live region while retaining the
  selected rating and retryable form; the focused component suite passes 2/2.
  The selected-activity feedback state is now captured at desktop/mobile (2/2)
  and audited for accessibility (4/4).
- Filtered itinerary searches now expose a direct `Clear filters` recovery
  action rather than leaving the traveler with instructional copy only. The
  component test passes, the exact desktop/mobile catalogue state passes 4/4,
  and the full accessibility suite passes 75/76 with the new base and filtered
  states included. The suite also covers reduced data and a 200%-zoom-equivalent
  640px CSS viewport across core public routes. Search, status, and reset
  controls are asserted at the 44px minimum target size on both review viewports.
- Authenticated fixture data no longer leaks `Playwright-owned`, `e2e-fixture`,
  or `E2E` identity markers into traveler/reviewer surfaces. Legacy local rows
  are migrated by Playwright setup, and the expanded catalogue includes the
  reviewer profile with a visible-marker rejection assertion.
- Planner reveal content now stays opaque from its first frame, and the
  Transport/Vibe group headings use an explicit inverse utility so the choice
  controls remain readable despite the app/shared Tailwind cascade. The exact
  rebuilt planner candidate was inspected at 1440×1000 and 390×844 with no
  horizontal overflow; focused planner tests passed 22/22 and the complete
  post-fix Playwright matrix remained 421/428 with 7 intentional skips.
- Console pipeline now uses a neutral semantic utility field instead of the
  inherited bright mint texture. The full-height drop zone remains deliberate
  for drag-and-drop work, while the exact desktop/mobile captures report zero
  overflow and browser errors. Pipeline interaction passes 8/8 and the
  catalogue capture passes 2/2 after the refinement.
- Developer API docs now wrap the mobile authentication example at a readable
  word boundary instead of clipping a horizontal code line. Exact docs captures
  report equal client/scroll widths, no page overflow, and no browser errors at
  both review sizes; the API-doc catalogue capture passes 2/2.
- Vault's empty state now keeps its inverse decision copy on a dark authored
  surface instead of the pale populated-card treatment. The focused
  `vault-gallery` test remains 1/1, and fresh empty plus authenticated populated
  captures at 1440×1000 and 390×844 report zero overflow and no browser errors.
- Unlinked `/checkout` now stops at one saved-day handoff instead of exposing
  unusable package cards; owned-trip checkout retains its tier selection. The
  focused checkout test passes 1/1, and exact empty/owned desktop/mobile
  captures report one h1, zero overflow, and no browser errors.
- The checkout lifecycle E2E contract now covers the unlinked handoff and keeps
  package-selection assertions on the owned-trip URL; the focused desktop/mobile
  slice passes 6/6.
- Fixed the Lisbon trip-cover SVG's unescaped ampersand, which produced a
  broken image despite a 200 response. Owned checkout now reports a decoded
  cover at both review sizes, and `qa:assets` validates XML entity escaping for
  all trip-cover SVGs.
- A rebuilt-artifact broken-media sweep across public discovery and the
  authenticated traveler trip/map/export/checkout/Vault/Itineraries routes at
  390px found no further broken images, overflow, or browser errors.
- A fresh complete non-visual Playwright rerun after the checkout contract
  update passed 421/428 scheduled checks with 7 intentional skips across
  desktop and mobile; no behavioral, accessibility, performance, protected-route,
  or viewport failures remain in that matrix.
- `GuideChapter` now supports content-height product chapters while preserving
  viewport-height cinematic chapters by default. The saved-plan map opts into
  content height, and its focused spatial-engine slice passes 4/6 with 2
  intentional feature-gate skips across desktop/mobile. Fresh exact captures
  report no overflow or browser errors after the density change.
- The saved-plan export utility now opts into content-height chapters as well;
  fresh desktop/mobile captures remove the large empty bands before formats,
  delivery, and access. The formal export lifecycle slice passes 6/6.
- The authenticated Itineraries archive now uses an authored utility decision
  composition: one saved day receives a full-width desktop card beside a
  next-action rail, filtered-empty recovery uses the inverse
  `DecisionStatePanel`, and the redundant inner minimum height no longer
  creates a short-page footer gap. The rebuilt exact catalogue slice passes
  4/4 across desktop/mobile, with 44px controls, equal client/scroll widths,
  and no browser errors; the export-drawer smoke slice passes 10/10 and the
  focused filtered-state accessibility slice passes 2/2. Fresh captures and
  metrics are in `output/playwright/iteration-2026-07-19-itineraries-density/`.
- Vault now has manifest-backed regional covers, functional grid/list controls,
  a purposeful single-card desktop split with a next-action rail, and explicit
  export affordances. The focused component contract passes 2/2. The rebuilt
  exact artifact was inspected at 1440×1000 and 390×844: grid/list states and
  the export drawer have equal client/scroll widths, 44px view controls, and
  zero browser errors. Captures and metrics are in
  `output/playwright/iteration-2026-07-16-vault-next-action/`.
- Account saved-plan cards now render their local manifest-backed regional cover
  above the deterministic gradient fallback. The focused card contract passes
  1/1, the Account accessibility slice passes 2/2, and fresh 1440×1000 / 390×844
  captures report decoded 267×150 Lisbon artwork, equal client/scroll widths,
  zero browser errors, and no visible raw account UUID in
  `output/playwright/iteration-2026-07-16-account-cover/`.
- Itineraries saved-day cards now render the same local manifest-backed regional
  cover contract as Account and Vault, with a deterministic gradient fallback;
  the focused component contract remains green at 2/2 and the refreshed
  desktop/mobile catalogue captures show the Lisbon artwork.
- Logistics now uses utility footer chrome for its traveler task surface. The
  focused Itineraries/Logistics catalogue slice passes 6/6 with no browser
  errors or overflow.
- Legal and promise pages now use compact reading chrome. The desktop
  Sustainability heading and lead copy are contained in separate columns, and
  the post-fix legal catalogue assertions pass 6/6 across desktop/mobile.
- Customer body typography now has a shared 16px floor: `body`,
  `--text-body-sm`, and `--text-body-md` resolve to 16px while lead sizes remain
  larger and metadata/control labels keep their explicit compact roles. Semantic
  public, traveler, legal, recovery, map/export, and shared-form copy was
  migrated off the old 14px body aliases.
- `verifyCustomerBodyMinimum` now checks semantic body copy across the public,
  traveler, planner, and legal route set. The focused body slice passes 6/6 at
  desktop/mobile, and the full Axe suite passes 79/80 with one intentional
  mobile h1-sweep skip.
- The latest body-token verification refresh passes the production build with
  process-only env values, 15/15 typecheck tasks, ESLint, 192 unit files / 959
  tests, motion (483 files), assets, migrations, repo safety, performance
  16/16, catalogue 48/48, viewport 120/120, and mobile overflow 32/32. The
  visual-only run reports 32 matches, 32 intentional desktop skips, and 72
  stale pre-redesign snapshot differences; no snapshots were refreshed.
- The latest planner, trip/new, trip/map, trip/export, privacy, and admin
  analytics captures were inspected at 1440x1000 / 390x844 with no new layout,
  browser-console, or horizontal-overflow defects. Port 3105 was free after
  the browser runs.
- The traveler body-size continuation now includes authenticated Logistics and
  trip-scoped Expert Chat; the focused desktop/mobile rerun passes 2/2.
- The latest visual audit tightened sign-in mobile punctuation flow and shortened
  the Itineraries search placeholder for 390px readability. Focused sign-in and
  Itineraries tests pass 7/7; the traveler-scoped Playwright rerun reports 119
  non-visual passes, 3 intentional skips, and only 18 stale traveler snapshots.
- The pre-Vault complete smoke rerun with visual snapshots excluded scheduled
  214 non-visual checks: 213 passed and one intentional mobile h1-sweep skip.
-  The earlier full 350-check smoke command had 247 behavioral passes, 33
  intentional skips, and 70 known pre-redesign screenshot mismatches;
  baselines remain intentionally unreconciled.
- A post-Vault rerun of the same non-visual command again scheduled 214 checks:
  213 passed and one intentional mobile h1-sweep skip.
- The full unit suite is green at 192 files / 959 tests after the Account cover
  change;
  workspace typecheck (15/15), ESLint, motion-gate, asset-gate, and
  `git diff --check` also pass. The focused Vault visual baseline check reports
  two expected stale snapshot diffs (desktop and mobile) without behavioral
  failures; exact candidate captures remain in
  `output/playwright/iteration-2026-07-16-vault-next-action/`.
- The current-state 350-check smoke run passed 247 behavioral/accessibility/
  protection/lifecycle checks, intentionally skipped 33, and reported only the
  70 known pre-redesign visual snapshot mismatches. Catalogue route coverage
  passed 48/48; the 1024×768 and 768×1024 viewport contract passed 120/120;
  performance passed 16/16; migration, repo-safety, and report-only perf-budget
  gates also pass. This verification refresh was run against the current
  2026-07-16 production artifact.
- After the final Sustainability CSS correction, the exact non-visual smoke
  subset reran 214 checks: 213 passed and one intentional mobile h1-sweep skip.
- The dedicated current-state Axe/accessibility run passed 75/76 with one
  intentional mobile h1-sweep skip.
- The latest dedicated Axe/accessibility rerun passed 79/80 with one
  intentional mobile h1-sweep skip, and the latest dedicated performance
  rerun passed 16/16 across desktop/mobile. Port 3105 was free after both
  browser runs.
- Reviewer queue, history, profile, and trip-workspace persistence errors now
  expose server-rendered recovery links, while unauthenticated reviewer states
  provide a direct sign-in action. Shared error/reviewer-auth coverage passes
  12/12; the reviewer catalogue slice remains 4/4 and the protected-route
  matrix is green at 88/88.
- Reviewer queue/history empty states now include explicit next actions between
  active assignments and completed reviews, keeping operator dead ends
  recoverable without relying on shell navigation.
- Reviewer history/export labels and route-preview assistive copy no longer
  expose raw IDs; map-generation failures now say the spatial view is
  unavailable and offer saved-plan recovery. The affected `@task11` lifecycle
  slice passes 14/14 desktop/mobile checks.
- The visual snapshot gate was run without updating baselines: 72 checks yielded
  2 matches and 70 expected differences from the older pre-redesign snapshots.
  The companion mobile-overflow sweep passed 32/32 mobile checks (with 32
  intentional desktop skips). Representative current captures, plus the full
  48-case expanded catalogue and 53-entry HTTP review are coherent after the
  latest visual review, but owner aesthetic approval and explicit baseline
  reconciliation remain open.
- The 70 current visual failure artifacts were inspected route-by-route at the
  exact desktop/mobile captures. No additional overlap, hidden media,
  accidental empty first viewport, unreadable state, or mobile overflow defect
  remained after the Itineraries cover, Logistics utility chrome, and
  Sustainability title-containment fixes. The remaining differences are the
  expected geometry/composition changes versus older baselines.
- The shared scene/state/footer contracts have passed follow-up review. The
  focused contract suite is green at 4 files / 17 tests, and the media/font,
  navigation, route-authority, workspace, activity-detail, and Vault checks
  are green in the same dirty-worktree scope.
- Self-hosted Newsreader, Source Sans 3, and IBM Plex Mono assets have local
  OFL licence records and pass the asset provenance gate. Cinematic media now
  has poster-first fallbacks, optional responsive/WebM sources, near-viewport
  loading, hidden-tab pausing, and reduced-preference coverage.
- Fresh exact-artifact checks cover the public navigation, homepage, Portugal,
  Explore, activity detail, Workspace, Pricing, Privacy, and Sign-in at
  1440px and 390px. The checked routes have no horizontal overflow or browser
  console errors; redirects, footer modes, self-hosted fonts, and measured
  route budgets were also verified. Captures are in `output/playwright/`.
- The authenticated Playwright global setup passed with a real local PostgreSQL
  session supplied through process-only values; no environment file or schema
  changed. At that earlier checkpoint visual approval was still open; the final
  refresh below records the subsequent inspected baseline reconciliation.
- Final 2026-07-16 release-gate refresh: production build, 192 unit files / 959
  tests, 15/15 workspace typechecks, ESLint, motion, asset, migration,
  repository-safety, and diff checks all pass. The non-visual smoke matrix
  passed 217/218 checks with one intentional mobile h1-sweep skip. The
  combined route catalogue/tablet/overflow browser contract passed 200/232
  checks with 32 intentional desktop overflow skips (48/48 catalogue,
  120/120 tablet, 32/32 mobile overflow). Performance remains 16/16 and
  accessibility 79/80 with the same intentional skip. The 136-case visual
  suite now passes 104/104 with 32 intentional desktop overflow skips after
  regenerating the 72 inspected pre-redesign baselines. No deployment or schema
  change was made.
- Final 2026-07-17 Task 17 closeout: the exact artifact receipt is build
  `F5CzHygTrY-JgoMIi9Sxt` with digest
  `e839dcd3790d560ffbd2fb8c694d1c02277c5353a628440b9e70358aed6277e0`.
  The final standalone gate passed 1,640 non-visual tests with 2,424
  intentional skips and 102/102 visual rows with 306 intentional skips;
  port 3105 closed cleanly. The focused accessibility rerun passed 157 rows
  with 3 intentional skips, and the approved snapshot update passed 102 visual
  rows plus 32/32 mobile overflow checks. The owner approved the exact served
  desktop/mobile family on 2026-07-17. No deployment, schema, or environment
  file change was made.

## Active phases

- [x] Phase 1 — authority, archive, and dirty-boundary baseline
- [x] Phase 2 — shared scene, state, footer, font, and media contracts
- [x] Phase 3 — primary public journey convergence
- [x] Phase 4 — trust, acquisition, and utility route convergence
- [x] Phase 5 — traveler product and saved-work states
- [x] Phase 6 — beta, organization, developer, and operator surfaces
- [x] Phase 7 — exact-artifact visual and release acceptance (Task 17 exact gate, approved visual family, and release checks complete)
- [ ] Phase 8 — bounded visual hardening and release readiness (Planner, Home, Console, six-row delta, exact final gate)

Task checkpoint: route authority contracts are red-green verified. `/explore`
and `/explore/workspace` are live catalogue entries, `/human-review` now
redirects to `/local-expertise`, and activity-detail/feedback routes are in the
catalogue. Shared-contract review is approved; media/font verification,
pricing/account/beta focused slices, and the Task 17 exact-artifact harness are
green. The final exact artifact was served from the recorded standalone build;
the authenticated route/state matrix completed, the approved 102-row visual
family was materialized, and the final non-visual and visual suites passed.
Remaining skips are intentional contract exclusions documented by the runner,
not unresolved acceptance failures.

## Completion rule

Tests and visual snapshots are necessary but do not close the plan. This rule
is satisfied: the final desktop/mobile candidate received explicit owner
aesthetic approval on the exact served artifact on 2026-07-17.

## Corrective-plan SDD ledger

- Task 1: complete (commits 5ea2775..f1dc287, review approved with RLS baseline concern; minor scope/report notes recorded)
- Task 2: complete (commits f1dc287..55b2ace, review approved; inherited package-local next/link tsc caveat recorded)
- Task 3: complete (commits 55b2ace..93df4f1, release review approved; 80 focused tests, workspace/web/Playwright typechecks, and sanitized-error checks passed)
- Task 4: complete (commits 93df4f1..367ec65, release review approved; fixture rerun contamination fixed, 7 route-matrix tests and typechecks passed; DB-backed setup deferred without test env)
- Task 5: complete (commits 367ec65..4abd9c, release review approved; Home cover overlay and Portugal mobile contrast/media fixes verified; browser runtime deferred by missing DB env and sandbox bind restriction)
- Task 6: complete (commits 4abd9c..f59ac1b, release review approved; Explore save/rail/tray contract, 44px targets, and focus clearance verified; browser runtime deferred by missing DB env)
- Task 7: complete (commits 2b50337..a27c4de, activity judgement cover, compact chosen-day states, safe save bar, and map/list caveat parity; focused tests and typecheck pass; browser gate deferred to exact-artifact verification)
- Task 8: complete (commit 63cbc32, distinct How It Works, Local Expertise, Pricing, Support, and Feedback compositions; focused tests, web typecheck, ESLint, and diff check pass; exact-artifact browser review remains for Task 17)
- Task 9: complete (commit e1fc8d5, legal contents navigation, static sustainability/sign-in media, sanitized 404 recovery, and existing offline utility contract; focused tests, web typecheck, ESLint, and diff check pass; browser gate deferred to Task 17)
- Task 10: complete (commit 56e289b, activity-first planner hierarchy, semantic selected-state/summary contract, choice-only trip refinement, and controlled option-sheet continuity; focused tests 31/31, web typecheck, ESLint, and diff check pass; browser gate deferred to Task 17)
- Task 11: complete (commit 61f350e, persisted-trip context/stop parity, explicit map fallback list, export state surface, and logistics consequences; focused tests 13/13, web typecheck, ESLint, and diff check pass; in-app browser verified planner desktop/mobile and sanitized auth redirect; authenticated map browser gate deferred to Task 17)
- Task 12: complete (commit 5318c3f, distinct archive/assets/settings route markers, traveler utility state contracts, and paid-checkout handoff without purchase controls; focused tests 22/22, web typecheck, ESLint, and diff check pass; in-app browser verified public Vault and no-trip Checkout; authenticated populated/paid traveler browser gate deferred to Task 17)
- Task 13: complete (commit 59b9429, chrome-agnostic gated panels, dedicated Guide/Expert Chat layouts, safe-area chat composer, and generic B2B authorization boundaries; focused tests 15/15, web typecheck, ESLint, and diff check pass; in-app browser verified public gated routes; protected-route browser gate deferred to Task 17)
- Task 14: complete with concerns (commit 6408798, catalogue-derived page access, capability-enforced API and server-action boundaries, one reviewer/admin/console/developer shell, sanitized console envelopes, and expanded protected-route scenarios; exact auth/shell 19/19, boundary 42/42, catalogue/shell 39/39, typechecks, ESLint, and diff check pass; anonymous in-app browser redirects verified; authenticated Playwright setup remains blocked by missing DATABASE_URL and local user_profiles RLS)
- Task 15: complete with concerns (commit 9cb75c3, reviewer/admin density and truthful triage surfaces, mobile action/card contracts, and unassigned-trip safety are implemented; focused tests 53/53, web/UI typechecks, ESLint, production build, and diff checks pass; anonymous in-app browser protected-route redirects verified; authenticated Playwright remains blocked by local user_profiles RLS in global setup)
- Task 16: complete with concerns (commit d228fca, console truth states, persisted pipeline data, explicit mobile workspace/lane switching, safe non-drag moves, truthful metrics/config boundaries, and capability/flag-gated API docs; console/API focused tests 22/22, typechecks, ESLint, production build 64/64, and diff checks pass; authenticated Playwright remains blocked by local user_profiles RLS in global setup)
- Task 17: complete (exact standalone runner, external-server Playwright mode, manifest-driven route scenes, deterministic recovery/preferences checks, 102-row approval ledger, migrated visual assertions, contrast corrections, and prefetch/media performance corrections; final receipt `F5CzHygTrY-JgoMIi9Sxt` / `e839dcd3790d560ffbd2fb8c694d1c02277c5353a628440b9e70358aed6277e0`; exact gate 1,640 non-visual passed with 2,424 intentional skips and 102/102 visual passed with 306 intentional skips; owner approved the exact served family on 2026-07-17)

## 2026-07-18 visual-hardening ledger

- Hardening Task 1: complete — `a18433e` restores the Planner midnight field,
  adds the 390×844 computed-style contract and Planner Axe coverage, and
  registers the focused spec in the exact runner. TDD evidence recorded the
  expected transparent RED before production edits, then 1/1 Playwright,
  15/15 Planner unit tests, web Playwright typecheck, and diff check green.
  Independent task review found no Critical or Important issue; its only Minor
  note was to retain full `NO_COLOR`/`FORCE_COLOR` warning output in later gate
  evidence. Fixture setup used the documented process-only owner connection;
  production RLS roles and policies were unchanged.
- Hardening Task 2: complete — `13c354c` repairs Home's stacked chapter flow
  and one-up 390px activity cards; `4caddf2` records its durable evidence.
  Controller-observed TDD ordering showed only test files changed before the
  expected Decision-tone and missing-grid-marker RED results. GREEN evidence is
  15/15 focused unit assertions, web Playwright typecheck, 1/1 Home mobile
  geometry guard, and 1/1 unchanged activity-detail desktop baseline. The
  brief's stale `activities--activityId---ready` grep was resolved against the
  generated `activities-[activityId]--ready` scenario ID. Independent review
  found no Critical, Important, or Minor issue and confirmed the stacked-only
  selector cannot affect overlay scenes.
- Hardening Task 3: complete — `7c01a23` removes Console Workspace's nested
  viewport/background/padding ownership, keeps all three truthful panes, and
  registers the authenticated responsive contract. Controller-observed TDD
  ordering showed only the new spec before the expected missing-geometry RED.
  GREEN evidence is 1/1 mobile Playwright, 8/8 focused component assertions,
  web Playwright typecheck, runner syntax, and diff checks. Independent review
  approved the local `min-h-[24rem] lg:min-h-0` pane minimum as a contained
  implementation of the 78%-viewport contract, with no Critical or Important
  issue. Its Minor warning-noise note remains open for raw final-gate evidence.
- Hardening Task 4: awaiting owner approval — the single exact candidate is
  build `yOnVK7qbn55IFxrzqRCkV` with digest
  `001ad401de23721cde98ef35643bd9abc38c16f63fd8de34ad13c70a30248867`.
  Static gates passed; the clean same-build retry passed 1,643 non-visual checks
  with 2,433 intentional skips and 96 unchanged visual checks with 306 skips,
  leaving exactly the six planned Home/Planner/Console deltas and no seventh.
  In-app browser review covered Home and Planner at 390×844, 768×1024, and
  1440×1000; the authenticated Console actuals were inspected at desktop and
  mobile. Commit `c198895` records six `PENDING OWNER APPROVAL` ledger rows.
  Independent Task 4 review is approved with no remaining findings; snapshots
  remain unchanged and port 3105 is closed.
- Hardening Task 5: pending — update only the approved six PNGs and run the complete exact-artifact final gate.
- Hardening Task 6: pending — reconcile authority/evidence and record release-ready but not-deployed status.
