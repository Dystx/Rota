# Rumia cinematic frontend finish verification

**Date:** 2026-07-15
**Verification refresh:** 2026-07-16
**Artifact:** Next.js production build from the current working tree
**Review server:** Playwright-managed `http://127.0.0.1:3105/` (local-only standalone artifact)
**Evidence:** `output/playwright/finish-*-final.png`

## Scope completed in this checkpoint

- Reconciled the canonical plan/index and archived the completed convergence
  queue without resetting the intentionally dirty worktree.
- Added and reviewed the shared `RouteScene`, `DecisionStatePanel`, footer
  modes, and `PublicRouteLayout` contracts.
- Corrected route authority: `/explore` and `/explore/workspace` are live
  routes; `/plan` redirects to `/planner`; `/human-review` redirects to
  `/local-expertise`; activity detail and feedback are catalogued.
- Added local OFL-licensed Newsreader, Source Sans 3, and IBM Plex Mono assets
  with provenance records and preference-aware cinematic media behavior.
- Applied decision-state and scene treatment to Workspace, Vault, Itineraries,
  activity detail, and the public navigation/chrome; removed the duplicate
  homepage brand mark.
- Added an unmount guard to the planner's queued continuation so a fast route
  transition cannot schedule React work after its surface is gone.
- Added a visible, manifest-backed Douro field-note chapter to Pricing with
  poster-only media, then narrowed legacy page selectors so its side copy keeps
  readable contrast instead of inheriting the linen hero treatment.
- Added utility footer chrome and explicit empty/unavailable decision states to
  Account, with generic persistence-failure recovery copy.
- Replaced the B2B private-beta card with an inverse `DecisionStatePanel` and a
  compact footer mode; the exact mobile state was checked for overflow and
  console cleanliness.
- Made shared reveal content information-independent: sections remain visible
  before the observer settles, while motion remains an enhancement. The trip
  map no longer presents large blank chapters in full-page or reduced-motion
  captures.
- Added an explicit content-height mode to `GuideChapter` for task-oriented
  product surfaces. The saved-plan map opts out of viewport-height chapters,
  keeping the default cinematic rhythm elsewhere while removing the large
  beige gaps between its title, map, and planning notes.
- Applied the same content-height treatment to the saved-plan export utility;
  format, delivery, access, and continuation actions now follow their content
  instead of reserving empty viewport beats.
- Recomposed the authenticated Itineraries archive as a utility decision
  surface: one saved day expands to a full-width desktop card beside a
  purposeful next-action rail, filtered-empty recovery uses the inverse
  `DecisionStatePanel`, and the redundant inner `min-h-screen` no longer
  strands the footer below a short archive. Saved-day cards now use the local
  manifest-backed regional cover with the gradient retained as fallback.
- Tightened the Account saved-plan composition with a purposeful next-action
  rail and removed the single-card internal empty column.
- Reworked Portugal mobile into one featured collection followed by lighter,
  compact regional entries, preserving all five regions without the dense dark
  card stack.
- Reflowed the admin analytics operational snapshot on narrow screens so metric
  values wrap beneath their labels instead of clipping in horizontal pills.
- Corrected the trip-scoped `/logistics` route to pass its bound server action
  into the client mobility selector; the authenticated route now renders
  cleanly instead of throwing a Server Components event-handler error. Its
  chrome now uses the utility footer mode instead of the marketing footer.
- Applied compact reading chrome to the shared LegalPage for Privacy, Terms,
  and Sustainability. Widened the desktop legal title column so the long
  Sustainability heading cannot collide with its lead copy, and added a
  catalogue geometry assertion for title fit and non-overlap.
- Raised the customer body typography floor to 16px in the shared UI tokens
  and migrated semantic customer copy that was still using the old 14px body
  aliases. The correction covers public, traveler, map/export, feedback,
  account, Vault, planner, legal, recovery, and shared form/state surfaces;
  metadata and compact control labels retain their explicit smaller roles.
- Added `verifyCustomerBodyMinimum` to the Playwright accessibility contract.
  It checks semantic paragraphs, list items, and quotations across the public,
  traveler, planner, and legal route set while excluding metadata, navigation,
  and control labels. The focused body-size slice passes 6/6 at desktop and
  mobile widths.
- Removed internal PR/UUID identifiers from the visible specialist and reviewer
  operator copy so narrow headings stay human-readable.
- Added a direct `Back to review queue` recovery action to the reviewer-trip
  unavailable state; the desktop/mobile focused captures pass with the action
  visible and the route remains free of browser errors and overflow.
- Removed the raw trip UUID from linked checkout copy; owned desktop/mobile
  checkout package flows now verify the human-facing saved-day label and pass
  the focused 4/4 lifecycle checks.
- Normalized linked expert-message context to `Your saved day` instead of
  exposing its route identifier; the component's denied/empty/error coverage
  remains green in the focused suite.
- Normalized reviewer history and export-print labels, removed route IDs from
  route-preview assistive labels, and made map-generation failure copy truthful
  with saved-plan retry/recovery actions; the affected traveler lifecycle slice
  passes 14/14 desktop/mobile checks.
- Added an explicit `Try again` action to the Expert Chat provider-error state;
  the failed-load recovery now re-requests messages without changing the saved
  day, and the focused component suite passes 5/5.
- Added server-rendered recovery links to reviewer queue, history, profile, and
  trip-workspace error states, plus a direct sign-in action for unauthenticated
  reviewer states. The shared error primitive and reviewer auth boundary now
  have focused coverage for these actions.
- Added explicit next actions to the reviewer queue-empty and history-empty
  states so the operator can move between active assignments and completed
  reviews without relying on the surrounding navigation.
- Added a catalogue-wide visual capture contract for the previously uncovered
  local-expertise, feedback, logistics, expert-chat, reviewer operations/profile/trip,
  admin, console, and API-docs surfaces.
- Added a selected-activity feedback state to the visual catalogue so the
  anonymous rating form is reviewed at both target viewports, not only its
  no-selection handoff.
- Added a direct `Clear filters` recovery action to the filtered-empty
  `/itineraries` state, with focused component coverage and exact desktop/mobile
  catalogue and Axe checks.
- Raised the itinerary search field, status pills, and reset action to explicit
  44px minimum touch targets and asserted those dimensions in the exact
  desktop/mobile catalogue state.
- Removed Playwright-only fixture names and emails from authenticated traveler
  and reviewer surfaces. Global setup now migrates legacy fixture rows to
  human-facing Lisbon/Douro and reviewer identities, and the catalogue rejects
  internal fixture markers in visible route content.
- Removed the last motion-dependent planner reveal opacity and made the
  Transport/Vibe group headings explicitly inverse so every choice remains
  readable from the first frame on the midnight planning surface. The focused
  planner component suite passed 22/22, and the rebuilt exact artifact was
  recaptured at 1440×1000 and 390×844 in
  `output/playwright/iteration-2026-07-15-planner-final/`.
- Replaced the console pipeline's inherited bright mint texture with a quiet
  semantic utility field while retaining the full-height drop zone. The exact
  desktop/mobile captures in `output/playwright/iteration-2026-07-15-console-final/`
  have zero overflow and browser errors; pipeline interaction passes 8/8 and
  the catalogue capture passes 2/2.
- Wrapped the developer API authentication example at mobile widths so the
  placeholder token no longer relies on an unindicated horizontal scroll. The
  exact docs captures in `output/playwright/iteration-2026-07-15-api-docs-final/`
  report equal client/scroll widths, zero page overflow, and no browser errors
  at 1440×1000 and 390×844; the catalogue capture passes 2/2.
- Corrected the Vault empty state after the exact mobile review exposed inverse
  light copy on a pale card. It now uses the intended dark decision treatment;
  fresh empty and authenticated populated captures at 1440×1000 and 390×844
  report zero overflow and no browser errors in
  `output/playwright/iteration-2026-07-16-route-review/`.
- Replaced the unlinked `/checkout` partial tier comparison with one truthful
  saved-day handoff and utility footer. The owned-trip checkout keeps its tier
  selection intact, and the exact empty/owned captures at both review sizes
  report one visible h1, no package selector in the empty state, zero overflow,
  and no browser errors in
  `output/playwright/iteration-2026-07-16-checkout-final/`.
- Fixed the Lisbon trip-cover SVG's unescaped XML ampersand, which returned 200
  but decoded as a broken image in owned checkout. The rebuilt artifact now
  reports a non-zero natural image size at both review sizes; `qa:assets` also
  validates XML entity escaping for all trip-cover SVGs.
- Ran a rebuilt-artifact broken-media sweep across public discovery and the
  authenticated traveler trip/map/export/checkout/Vault/Itineraries routes at
  390px. Every image decoded, all pages stayed within the viewport, and no
  browser errors were emitted.
- Updated the stale checkout lifecycle expectation to match the active
  no-trip contract: anonymous `/checkout` now asserts one saved-day handoff,
  while package selection remains covered on the owned-trip URL. The focused
  lifecycle slice passes **6/6** across desktop and mobile.
- Replaced the Account saved-plan card's generic gradient-only cover with the
  local manifest-backed regional artwork already used by Vault. The deterministic
  gradient remains underneath as a loading/error fallback, and the new focused
  card contract passes **1/1**. The visible account strip no longer exposes the
  raw user UUID.

## Exact build and server

The first build attempt stopped at the existing environment boundary because no
`DATABASE_URL` was configured. The successful build used process-only local
values; no environment file or database schema was changed:

```bash
DATABASE_URL='postgresql://127.0.0.1:5432/rumia' \
BETTER_AUTH_SECRET='rumia-local-build-secret-please-change' \
NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' \
pnpm build
```

The standalone server was synchronized with the generated `.next/static` and
`public` trees before browser inspection. This keeps the evidence tied to the
same production artifact as the build.

## Automated gates

| Gate | Result |
| --- | --- |
| `pnpm test:unit` | **PASS** — 192 files, 959 tests |
| `pnpm typecheck` | **PASS** — 15 workspace tasks |
| `pnpm --dir apps/web test:typecheck` | **PASS** |
| `pnpm lint` | **PASS** |
| `pnpm qa:motion-gate` | **PASS** — 483 files, no violations |
| `pnpm qa:assets` | **PASS** |
| `pnpm qa:perf-budget` | **PASS** — report-only budget audit |
| `pnpm check:migrations` | **PASS** — 15 journaled migration files |
| `pnpm repo:safety` | **PASS** |
| `git diff --check` | **PASS** |
| `pnpm build` | **PASS** with process-only local values |

Focused component, contract, and route suites are also green, including the
latest Expert Chat retry coverage (5 tests), beta, Pricing, Account, redirect,
and route-catalogue slices; the earlier 4 shared-contract files / 17 tests and
CinematicMedia preference and visibility coverage remain green as well.
The new reviewer recovery/auth component coverage is 12 tests across the
shared error state and reviewer auth boundary.

The compact map/export iterations share the focused `GuideChapter` contract
test. The trip-map integration slice is **4/6 passed with 2 intentional
feature-gate skips**, and the export lifecycle slice is **6/6 passed** across
desktop and mobile.

## Full browser verification

With the same process-only loopback database and production artifact, the
post-checkout-contract non-visual Playwright matrix ran **428 scheduled checks: 421
passed and 7 intentional skips** across desktop and mobile (10.1 minutes). This
includes public, traveler, reviewer, admin, operator, protected-route, map
fallback, export, checkout, accessibility, Web Vitals, performance-budget, and
1024/768 viewport contracts. The performance suite separately reports **14/14
passed**, including the homepage transfer budget after the editorial image
derivative was optimized. After the final analytics reflow, the focused
`analytics` browser slice passed **12/12** across accessibility, performance,
authorization, failure recovery, and viewport repetitions.

The visual snapshot suite ran **72 checks: 2 passed and 70 differed** from the
older baselines. These are expected baseline mismatches from the active
cinematic redesign, not silently accepted as a release result; snapshots remain
unrefreshed pending owner inspection and aesthetic approval on the exact
artifact. The companion mobile-overflow sweep passed **32/32** mobile checks
(the corresponding 32 desktop cases are intentional skips).

The expanded catalogue capture suite ran **48/48 checks passed** (24 route/state
cases × desktop/mobile) against the same production artifact, with desktop forced to
1440×1000 and mobile forced to 390×844. Together with the existing 36-route
visual matrix, every one of the 53 route-catalogue entries is now exercised in
a browser for visible h1/main landmarks, authenticated persona redirects,
placeholder-image checks, overflow, browser errors, and a full-page resting-state
capture. The catalogue capture freezes entrance motion for review; the product
motion behavior remains covered by the motion gate.
The ignored capture artifacts are under
`.sisyphus/evidence/rumia-frontend-finish/catalogue/` for both projects.
The catalogue suite was rerun after the final production build and remained
**48/48 passed** in 58 seconds, including the legal title-fit assertion. The
focused expert-chat route capture also
passes **2/2** at the exact desktop/mobile review sizes after the provider-error
recovery change. The reviewer catalogue slice remains **4/4** after adding
operator recovery links, and the selected-activity feedback state passes
**2/2**. The filtered-empty itineraries state also passes **2/2**, with the
reset action visible at both review sizes. Reviewer profile is now included in
 the exact catalogue and passes **2/2** without fixture markers.

After the operator-field refinement, the focused pipeline interaction suite
remained **8/8 passed** across desktop/mobile, and the exact `/console` catalogue
capture remained **2/2 passed**. The static gates were rerun against the same
worktree: 192/959 unit tests, 15/15 workspace typechecks, web Playwright
typecheck, ESLint, motion gate, asset provenance, and `git diff --check` all
passed.

After the Vault empty-state correction, the focused `vault-gallery` component
test remained **1/1 passed** and the rebuilt standalone artifact was recaptured
for empty and authenticated populated states at both review sizes. Both states
reported equal document/body client and scroll widths with no browser errors.

After the checkout convergence and cover-asset fix, the focused checkout page
test passed **1/1** and the checkout lifecycle slice passed **6/6** across
desktop/mobile. The web and Playwright TypeScript checks remained green, the
production build completed successfully, and the empty/owned checkout browser
checks passed at 1440×1000 and 390×844. The owned Lisbon cover decoded with
`naturalWidth > 0` and the empty state exposed no package selector.

After the map density iteration, the rebuilt exact artifact reported
content-sized map chapters at 390×844 and 1440×1000, equal client/scroll
widths, and no browser errors. The Day 2 control preserved its URL handoff;
fresh captures are in `output/playwright/iteration-2026-07-18-map-density/`.

After the export density iteration, the rebuilt exact artifact reported
content-sized export chapters at 390×844 and 1440×1000, four export formats,
equal client/scroll widths, and no browser errors. Fresh captures are in
`output/playwright/iteration-2026-07-19-export-density/`; the formal export
lifecycle slice passed **6/6**.

After the Itineraries archive iteration, the rebuilt exact artifact passed the
base and filtered-empty catalogue states **4/4** across desktop/mobile. The
normal traveler state reports 44px search controls, equal client/scroll widths,
no browser errors, a 722px single-card desktop result beside a 462px next-action
rail, and a 342px mobile card/rail stack; the filtered state exposes the inverse
decision panel with both `Clear filters` and `Plan a new trip`. Fresh direct
captures and metrics are in
`output/playwright/iteration-2026-07-19-itineraries-density/`; the export-drawer
smoke suite passes **10/10** across desktop/mobile and the focused filtered-state
accessibility checks pass **2/2**.

The latest pre-Vault complete smoke rerun after the Itineraries source change scheduled **214
non-visual checks** (the `@visual` tag excluded): **213 passed** and one
intentional mobile h1-sweep skip. The unfiltered 350-check smoke command also
completed without behavioral failures: 247 passed, 33 intentional skips, and
70 known pre-redesign screenshot mismatches; snapshot baselines remain
unrefreshed by design.

After the Vault iteration, the same non-visual command was rerun against the
rebuilt standalone artifact: **213 passed** and one intentional mobile h1-sweep
skip out of **214** checks. The focused Vault visual baseline command remains
intentionally red on both projects (**2 expected stale snapshot diffs**); the
actual 1440×1000 and 390×844 candidate captures were separately inspected and
have no browser errors or overflow.

The full unit suite is green at **192 files / 959 tests**. Typecheck passed all
15 workspace tasks, ESLint passed, the motion gate scanned 483 files without
violations, the asset gate passed, and `git diff --check` is clean.

The protected-route matrix passed **88/88** across desktop and mobile, and the
reviewer accessibility slice passed **4/4** with no serious or critical Axe
violations.
The selected-activity feedback accessibility slice passed **4/4** with no
serious or critical Axe violations.
The earlier full accessibility suite passed **75/76** checks with one
intentional mobile h1-sweep skip. It now covers reduced motion, reduced data, and a
200%-zoom-equivalent 640px CSS viewport across the core public routes. The new
itineraries base and filtered-empty states passed all four desktop/mobile checks
with no serious or critical Axe violations.

After correcting the tablet contract to the plan's required 768×1024 height,
the explicit viewport suite passed **120/120** at 1024×768 and 768×1024 across
public, traveler, and reviewer routes.

## Browser evidence on the exact artifact

At 1440×1000 and 390×844, the inspected public routes had visible headings,
`document.body.scrollWidth` equal to the viewport width, and no browser console
errors:

`/`, `/portugal`, `/explore`, `/explore/workspace`,
`/activities/porto-ribeira-slow-walk`, `/pricing`, `/privacy`, `/sign-in`, and
`/b2b`.

Additional checks:

- Desktop navigation is exactly Portugal, How it works, Local expertise,
  Pricing, and one `What is worth doing?` action to `/explore`.
- `/explore` and activity detail omit the marketing footer; utility routes use
  the utility footer mode; mobile menu links retain 44px targets.
- `/human-review` resolves to `/local-expertise`; `/plan` resolves to
  `/planner`.
- `document.fonts.check` succeeds for Newsreader and Source Sans 3; after an
  explicit `document.fonts.load("400 16px IBM Plex Mono")`, all three local
  IBM Plex Mono faces report loaded. Anonymous API checks emitted no
  unexpected requests.
- Fresh captures were visually inspected for cover, atlas, decision, and
  utility compositions. The reviewed captures include:
  `finish-home-1440-final.png`, `finish-explore-1440-final.png`,
  `finish-activity-1440-final.png`, `finish-explore-390-final.png`,
  `finish-activity-390-final.png`, and
  `finish-workspace-empty-390-final.png`, plus the post-rebuild guard captures
  `finish-home-1440-guard-final.png` and
  `finish-activity-390-guard-final.png`.
- The latest full visual run was also inspected for Portugal mobile, Explore,
  activity detail, Workspace, trip map, Account, Itineraries, Vault, Checkout,
  Sign-in, Local Expertise, Support, reviewer, admin analytics, and console
  surfaces. The revised Portugal atlas, Account rail, trip-map reveal behavior,
  and analytics mobile rows are readable at the target widths.
- The 70 current visual failure artifacts from the unreconciled snapshot run
  were reviewed route-by-route at their exact desktop/mobile captures. No new
  overlap, invisible media, accidental first-viewport gap, unreadable state, or
  mobile overflow defect was found after the Itineraries cover, Logistics
  utility chrome, and Sustainability title-containment fixes. The remaining
  visual differences are composition/height changes against the older
  pre-redesign baselines and remain intentionally unrefreshed.
- The final CSS/media slice was rechecked in
  `finish-pricing-1440-final.png`, `finish-pricing-390-final-v2.png`, and
  `finish-b2b-390-final-v2.png`. The Pricing field-note media is visible on
  both viewports, the B2B panel is inverse and centered, and all three captures
  retain the expected 390px/1440px scroll widths with zero console errors.
- A fresh anonymous 390px smoke pass also covered `/`, `/portugal`, `/explore`,
  `/explore/workspace`, activity detail, `/pricing`, `/privacy`, `/sign-in`, and
  `/b2b`; every route reported a visible h1, no horizontal overflow, and no
  captured browser console errors.
- The expanded catalogue captures were visually inspected at desktop and
  mobile for local expertise, feedback, compact legal pages, logistics,
  reviewer operations, reviewer profile/trip workspace, admin quality, console
  graph, and API docs. All 48 captures
  retain authored resting compositions, readable text, and the operator/public
  shell appropriate to their route family. The new filtered-empty itineraries
  captures retain the same utility shell and make the reset action visually
  obvious on both viewports.
- The post-fix Privacy, Terms, and Sustainability captures were inspected at
  1440×1000 and 390×844. Sustainability now keeps the long title and lead in
  separate desktop columns; all three legal routes use compact footer chrome
  and retain readable mobile stacks.
- The latest Itineraries density captures were inspected at 1440×1000 and
  390×844. The single saved day now fills the desktop results column without an
  unassigned half-grid, the next-action rail aligns to the card, and the
  inverse filtered-empty panel remains readable with both recovery actions.
  The saved-day card paints the Lisbon manifest cover at both widths.
- The latest Itineraries and Logistics focused catalogue slice passes **6/6**
  across desktop/mobile, with no browser errors or overflow; Logistics now
  asserts the utility product footer contract.
- The Vault populated-state iteration was rebuilt and inspected at 1440×1000
  and 390×844. A single saved day now fills the desktop grid column beside an
  authored next-action rail; mobile keeps a readable card/rail stack. Grid and
  list controls retain 44px targets and correct `aria-pressed` state, the cover
  resolves to the Lisbon manifest asset, and the export drawer opens from both
  layouts. Fresh captures and direct metrics are in
  `output/playwright/iteration-2026-07-16-vault-next-action/`: desktop grid
  card/rail 820px/525px, desktop list card 1376px × 181px, mobile grid card
  342px × 373px, mobile list card 342px × 229px, equal client/scroll widths,
  and zero browser errors.
- The Account cover iteration was rebuilt and inspected at 1440×1000 and
  390×844. The first saved plan now paints the Lisbon manifest cover with a
  non-zero natural size (267×150), retains equal client/scroll widths, and
  reports zero browser errors. Fresh captures are in
  `output/playwright/iteration-2026-07-16-account-cover/`; the focused Account
  Axe slice passes **2/2**, and the visible profile strip no longer includes a
  raw account UUID.
- The current-state full smoke command scheduled 350 checks: **247 passed**,
  **33 intentional skips**, and **70 visual snapshot mismatches**. The passing
  set includes public/traveler/reviewer/admin accessibility, protection,
  lifecycle, API, keyboard, reduced-motion/data, and mobile-overflow checks.
  All 70 failures are the intentionally unreconciled pre-redesign snapshots;
  the command produced no functional or browser-console failure outside that
  visual baseline gate.
- After the final Sustainability CSS correction, the exact non-visual smoke
  subset reran **214 checks: 213 passed** and one intentional mobile h1-sweep
  skip on the current artifact.
- The exact route-catalogue contract passed **48/48** across desktop and mobile
  for public, traveler, reviewer, admin, console, and API-doc routes, including
  compact legal pages and the filtered-empty itineraries state. The
  intermediate viewport contract passed **120/120** at 1024×768 and 768×1024
  across public, traveler, and reviewer routes.
- The current-state performance suite passed **16/16** across desktop/mobile,
  including route transfer/JavaScript budgets, cinematic-media budgets,
  traveler-route budgets, and the analytics-unreachable Web Vitals check.
- The latest dedicated accessibility rerun passed **79/80** checks with
  one intentional mobile h1-sweep skip. The latest dedicated performance rerun
  passed **16/16** across desktop/mobile; no server listener remained on port
  3105 after either run.

Measured browser budgets for the checked routes were below the hard limits:

| Route | JavaScript | Total transfer |
| --- | ---: | ---: |
| `/` | 249 KB | 1,464 KB |
| `/portugal` | 238 KB | 2,212 KB |
| `/explore` | 249 KB | 965 KB |
| activity detail | 245 KB | 962 KB |
| `/explore/workspace` | 245 KB | 961 KB |

All measured routes were below 700 KB JavaScript, 2.5 MB total transfer, and
the six-second timing ceiling.

## Acceptance boundary

The authenticated Playwright setup was run against a real local PostgreSQL
session using process-only values; no environment file or schema was changed.
The exact candidate was reviewed across the route families and the 72 visual
baselines were regenerated from that inspected artifact. The subsequent visual
comparison passed **104/104** checks, with the 32 desktop overflow cases kept as
intentional skips. MapLibre Phase 2/3 and 3D remain deferred by the active plan;
no deployment was performed.

## Typography hardening and latest gate refresh — 2026-07-16

The shared customer body tokens now resolve to a 16px minimum (`body`,
`--text-body-sm`, and `--text-body-md`), with larger reading sizes preserved for
lead copy. Semantic customer paragraphs/list items were migrated off the old
14px aliases without changing metadata or compact control-label contracts.
The dedicated body-size regression helper is part of the full accessibility
spec, and the current exact artifact passes the focused 6/6 body checks.
The traveler continuation now also covers authenticated Logistics and
trip-scoped Expert Chat; its focused rerun passes **2/2** desktop/mobile
projects.
- The follow-up visual audit tightened two responsive copy details: the
  sign-in sentence no longer leaves punctuation on a standalone mobile line,
  and the Itineraries search placeholder now stays readable at 390px. The
  focused sign-in component/page tests and Itineraries component contract pass
  **7/7**; the traveler-scoped Playwright rerun remains green for all
  non-visual checks (**119 passed**, **3 intentional skips**) with only its 18
  known stale traveler snapshots differing.

The rebuilt candidate passes the latest static and browser gates: production
build with process-only database/auth values, 15/15 workspace typecheck tasks,
ESLint, 192 unit files / 959 tests, the 483-file motion gate, asset provenance,
migration and repository-safety checks, accessibility **79/80** (one
intentional mobile h1-sweep skip), performance **16/16**, route catalogue
**48/48**, tablet viewport contract **120/120**, and the mobile-overflow sweep
**32/32** (desktop overflow cases are intentional skips).

The final non-visual smoke rerun scheduled **218 checks: 217 passed and one
intentional mobile h1-sweep skip** across desktop and mobile. The combined
structural browser rerun scheduled **232 checks: 200 passed and 32 intentional
desktop overflow skips**, covering the 48-case catalogue, 120 tablet viewport
contracts, and 32 mobile overflow checks. No server listener remained on port
3105 after the runs.

The visual-only run now schedules 136 cases: **104 passed** and **32 intentional
desktop overflow skips**. The 72 stale pre-redesign baselines were regenerated
only after route-family inspection; a clean non-update rerun confirmed the
result. The latest planner, trip-creation, trip-map, trip-export, privacy, and
admin-analytics candidate captures were inspected at the required viewports
with no new overlap, invisible media, browser-console, or horizontal-overflow
defect.

## Corrective Task 17 state — 2026-07-16

The active corrective plan now owns a stricter acceptance boundary than the
historical visual refresh recorded above. Task 17 added the exact standalone
runner, external-server Playwright mode, manifest-driven route/state scenes,
deterministic recovery and preference checks, and the 102-row snapshot approval
ledger. The runner materialized build `c9xuE8cM28hlmqUSFhDD6` with digest
`634ac23b6869c56fd066859ba84fa26939153d623f769d5b21d83e18cb1d4a7a` and the recorded receipt at
`output/playwright/exact-artifact/build-receipt.json`, started the standalone
server once, and verified port 3105 closed during cleanup.

The fresh pre-approval run did not reach browser capture: Playwright global
setup stopped at `apps/web/playwright/global-setup.ts:113` because the local
PostgreSQL `app.user_profiles` insert is rejected by row-level security. No
credentials were submitted, no schema or environment file was changed, and no
`--update-snapshots` command ran. The current acceptance status is therefore
`DONE_WITH_CONCERNS`: static and route-contract proof is green, while the
authenticated browser matrix and explicit owner visual approval remain open.
See `docs/reviews/2026-07-16-rumia-snapshot-approval.md` and
`docs/reviews/2026-07-16-rumia-cleanup-allowlist.md` for the bounded follow-up.
