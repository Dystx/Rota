# Rumia browser UI review — 11 July 2026

Status: **P0/P1 UI findings implemented and verified in the current artifact; remaining release gates are content, provider/licence, route-contract, and VPS-operations decisions.**

This review inspected the live private Rumia release through the Mac SSH
tunnel at `http://127.0.0.1:3302`. It used the in-app browser at `1440x900`
and `390x844`, with route navigation, screenshots, DOM snapshots, geometry and
computed-style checks, key interaction checks, and browser warning collection.
It did not modify application state beyond a disposable anonymous activity save
used to inspect the day tray.

## Routes reviewed

### Public and traveler-facing

`/`, `/explore`, `/explore?region=porto`, `/portugal`,
`/activities/porto-ribeira-slow-walk`, `/explore/workspace`, `/planner`,
`/trip/new`, `/how-it-works`, `/local-expertise`, `/pricing`, `/feedback`,
`/human-review`, `/support`, `/offline`, `/privacy`, `/terms`,
`/sustainability`, and `/sign-in`.

### Protected, private-beta, or operator surfaces

`/itineraries` and `/account` correctly redirect to sign-in; the reviewer queue
also redirects. `/guide`, `/guide/onboarding`, `/b2b`, and `/expert-chat` show
private-beta/placeholder states. `/admin` resolves to the branded not-found
surface. `/console` renders the operations pipeline and was checked at the
mobile breakpoint.

## What is already working

- The primary public journey is understandable: situation → judged result →
  activity detail → save → day tray.
- The serif/display and Inter/body pairing is visually coherent, and the
  Next-hosted font assets are present in the deployed release.
- Public routes keep one H1 and no document-level horizontal overflow at the
  tested breakpoints.
- Images expose alternative text; primary navigation has a skip link and
  visible focus styles.
- The mobile menu opens, exposes the same primary destinations, and closes.
- Filter phrase rails open with pressed/expanded state, and saving changes the
  button to a reversible remove action and creates a visible day tray.
- The activity cards communicate judgement, time, timing, pairing, and an
  alternative instead of behaving like a generic directory.

## Prioritized findings

### P0 — fix before the next public visual baseline

#### RUMIA-UI-001 — Back-to-top control renders literal icon text

**Routes:** every route after scrolling.

**Evidence:** the `button[aria-label="Back to top"]` is 44×44px, but its
`Material Symbols Outlined` child measured `x=-20.3px` and `width=116.6px`;
the mobile screenshot visibly shows `arrow_upward` spilling out of the
button. The deployed CSS has the class but no Material Symbols `@font-face`
asset; the app ships Inter/Playfair through `next/font`, not the Material icon
font.

**Impact:** a shared control is visibly broken on long pages and adds noise to
the footer/content boundary.

**Fix direction:** replace the text-ligature span with the existing SVG `Icon`
system (add an `arrow-up` path if needed), or ship and verify a local icon font.
Prefer the SVG path so the VPS release has no external font dependency.

**Acceptance:** at both review widths, the glyph remains inside the 44×44px
button, no literal icon name is rendered, the button remains keyboard/focus
reachable, and the reduced-motion path still jumps immediately.

### P1 — fix before enabling the next traveler-facing release

#### RUMIA-UI-002 — Planner detail labels lose contrast on the dark panel

**Route:** `/planner`.

**Evidence:** the main detail panel uses `bg-white/5` over the dark planner
surface, but the reusable `ChoiceChipGroup` label keeps the light-surface
foreground token (`rgb(22, 40, 31)`). At `1440x900`, the visible `Transport`
and `Vibe` labels are nearly black on the dark panel.

**Fix direction:** make `ChoiceChipGroup` context-aware or add a label-class
override so dark planner surfaces use the linen/light token. Keep the light
surface treatment for modal sheets and summary cards.

**Acceptance:** label and selected/unselected chip text meet at least 4.5:1
contrast in the dark panel, with visible focus and selected states at desktop
and mobile.

#### RUMIA-UI-003 — Mobile hero map competes with the activity decision

**Route:** `/` at `390x844`.

**Evidence:** the 3D world globe, route labels (Douro Valley, Azores, Algarve,
Lisbon & Surrounds), map projection controls, and map usage instructions share
the same visual layer as the headline, explanatory copy, phrase sentence, and
primary action. The map instruction still says “Use ⌘ + scroll” on a touch
viewport. The globe also exposes non-Portugal world labels behind the copy.

**Impact:** the activity-first proposition becomes visually secondary and the
hero feels busy exactly where the user must make the first decision.

**Fix direction:** treat the map as a progressive enhancement. On mobile,
default to a quiet Portugal-only/2D underlay or move it below the composer;
hide decorative region labels and desktop zoom instructions; keep an accessible
list/region control for the same information. On desktop, keep the map muted
and subordinate to the sentence and CTA.

**Acceptance:** no map label or control overlaps the H1, description, phrase
rail, or CTA at `390x844`; touch guidance is touch-specific; the first viewport
still communicates “what should I do?” without requiring map interaction.

#### RUMIA-UI-004 — Mobile day tray obscures the activity card

**Route:** `/explore` after saving an activity at `390x844`.

**Evidence:** the fixed `Your day` tray covers the card’s lower `Choose instead`
and `Avoid when` content. The save action works, but the user cannot read the
content underneath while the tray is present.

**Fix direction:** reserve bottom safe-area/padding equal to the tray’s measured
height, or make the tray a compact bar that expands on demand. Keep one clear
primary continuation action and do not cover editorial evidence.

**Acceptance:** all card text remains readable above the tray at 390px; the
tray works with keyboard focus and device safe areas; no fixed element obscures
the focused target.

#### RUMIA-UI-005 — Support route drops the shared public shell

**Route:** `/support`.

**Evidence:** the page starts directly with the Support heading and has no
`Primary` navigation or `SiteFooter`, unlike `/offline`, legal pages, and the
marketing routes. The implementation uses `PageShell bare` outside the
`(marketing)` layout.

**Impact:** users lose brand navigation and a consistent way home; the support
surface feels like a separate application.

**Fix direction:** render Support through `PublicRouteLayout` (or move it into
the marketing route group) and keep its content-only layout inside that shell.

**Acceptance:** desktop and mobile support pages expose the same top navigation,
skip link, footer, and back-to-home path as other public utility routes.

#### RUMIA-UI-006 — Console pipeline is clipped at mobile width

**Route:** `/console` at `390x844`.

**Evidence:** the pipeline board has an internal scroll width of roughly 1024px
inside a 326px content area, while the outer main uses `overflow-hidden`. The
search/filter row is wider than its parent and the filter control is visibly
clipped; the board’s horizontal scrollbar is easy to miss.

**Fix direction:** stack search and filter controls at mobile, give the board a
clear horizontal-scroll affordance or convert lanes to a vertical read/triage
list, and remove the outer clipping that hides the available content.

**Acceptance:** no search/filter control is clipped at 390px; operators can
reach every lane/card with touch and keyboard; the mobile state satisfies the
Release 5 “deliberate read/triage” gate.

#### RUMIA-UI-007 — Save/remove state is not announced

**Route:** `/explore`.

**Evidence:** after saving, the button changes to “Remove … from this day” and
the visual `Your day` tray appears, but there is no populated `[role=status]`
or `aria-live` region. The only alert observed remained the earlier route
message (“What deserves this day?”), not the save result.

**Fix direction:** add one scoped live status region for save, remove, replace,
empty, and error outcomes. Keep the visual reversible button/tray state, but
announce a concise message such as “Ribeira … added to your day; one activity,
two hours.”

**Acceptance:** screen-reader output and DOM state both report save/remove and
failure; repeated clicks do not duplicate announcements; focus remains on the
action that changed state.

#### RUMIA-UI-008 — MapLibre emits repeated globe warnings

**Route:** `/` and any route mounting the globe.

**Evidence:** the browser console repeatedly reports
`calculateFogMatrix is not supported on globe projection.`

**Fix direction:** skip fog-matrix work on globe projection, or make the
Portugal 2D map the default and keep globe projection opt-in. Do not suppress a
real rendering failure without correcting the unsupported operation.

**Acceptance:** no repeated warning on initial load or route transition; the
chosen map mode retains the intended visual hierarchy and remains usable with
reduced motion.

### P2 — fix during the next visual-polish pass

#### RUMIA-UI-009 — Public pricing exposes downstream commerce promises early

**Routes:** `/pricing`, `/human-review`, `/local-expertise`.

**Evidence:** public copy advertises “Full itinerary” (€19), “Local expert
polish” (€49), and a “Concierge & on-trip help” waitlist, while the activity-first
plan gates commerce and reviewer operations behind later releases.

**Fix direction:** make the current release state explicit (preview/waitlist),
or hide later tiers until their release gates pass. Consolidate the canonical
copy so pricing and human-review do not drift.

**Acceptance:** no public route implies that an unavailable payment/review flow
is live; tier labels match the enabled feature flags and the Release 3/4 gates.

#### RUMIA-UI-010 — Editorial pages leave a large desktop dead zone

**Routes:** `/how-it-works`, `/local-expertise`.

**Evidence:** the first `1440x900` viewport has a strong headline and a sparse
three/four-column row, then a large empty lower field before the single CTA.
The mobile sequence is clearer, but the desktop page underuses the available
space and weakens the next-action hierarchy.

**Fix direction:** tighten the first-screen vertical rhythm or add one useful
evidence/context block (not decorative filler) before the CTA. Preserve the
quiet editorial identity.

**Acceptance:** the first desktop viewport communicates the sequence, proof, and
next action without a long unintentional blank region; mobile remains readable.

#### RUMIA-UI-011 — Mobile menu needs a complete keyboard/focus contract

**Route:** all public routes at `390x844`.

**Evidence:** the menu exposes `aria-expanded` and a close label, but opening it
left focus on `body` in the browser check; the panel has no modal/focus scope,
and the hero remains visible under the translucent panel.

**Fix direction:** focus the first menu link on open, close on Escape, restore
focus to the toggle, and either make the panel an explicit disclosure with
inert underlying content or use a modal-style scrim if it is intended to block
the page.

**Acceptance:** keyboard users can open → traverse links → Escape → return to
the toggle without entering hidden page content.

#### RUMIA-UI-012 — Heading hierarchy skips levels on utility/review surfaces

**Routes:** `/human-review` and public utility pages.

**Evidence:** several surfaces move from H1 directly to H4 for card/section
labels; the footer also uses H4 headings independently of the main outline.

**Fix direction:** use semantic H2/H3 levels for content sections and style
non-heading footer labels as labels when they are not part of the document
outline.

**Acceptance:** each route has one H1 and a meaningful sequential outline in the
main content; footer navigation remains labelled without artificial heading
skips.

## Recommended implementation order

1. Fix RUMIA-UI-001 and RUMIA-UI-002 (shared control/icon and planner contrast).
2. Fix RUMIA-UI-003, RUMIA-UI-004, and RUMIA-UI-007 as one activity-first
   mobile interaction pass: quiet map layer, non-obscuring tray, and announced
   save/remove state.
3. Fix RUMIA-UI-005 and RUMIA-UI-006 (shell consistency and operator mobile
   triage).
4. Remove the globe warning (RUMIA-UI-008) and rerun the map/route visual
   baseline.
5. Reconcile pricing/review copy and complete the P2 typography/outline pass.

## Regression evidence required after implementation

- Fresh screenshots at `1440x900` and `390x844` for `/`, `/explore`,
  `/explore/workspace`, `/planner`, `/support`, `/pricing`, and `/console`.
- Save/remove/empty/error announcements captured from the DOM and verified
  through keyboard interaction.
- Contrast check for planner dark controls and all new status surfaces.
- No fixed tray overlap at mobile; no literal icon text; no console warning for
  globe projection.
- Route shell check: public pages have `Primary` nav + footer unless explicitly
  marked bare; planner remains the only intentional full-screen overlay.
- `prefers-reduced-motion` and keyboard smoke rerun after visual changes.

## Source-level follow-up status (11 July 2026)

The first implementation pass now covers the shared SVG icon path (including
the back-to-top control and shared primitives), planner dark-surface labels,
Portugal-focused hero-map hierarchy, safe-area day-tray spacing, public support
shell, console pipeline wrapping, mobile-menu focus return, and live
save/remove/undo feedback. The MapLibre mount skips the unsupported globe fog
operation, and the chosen-day workspace has a single announced status with an
explicit undo action.

Focused component/API tests, repository typecheck, ESLint, and a Webpack
production build with release-shaped environment variables pass. At the time
of this intermediate capture, the findings remained open pending fresh
1440px/390px browser captures and a clean browser-console run; the final
verification section below supersedes that interim status.

## Second source/browser follow-up (11 July 2026)

The stale browser tab was separated from the Rumia worktree before this pass:
port 3302 had no listener, while the live Next process belonged to Lumes on
port 3003. Rumia was started temporarily on 3302 for a fresh check and stopped
afterward; Lumes was not changed.

Additional source fixes now cover the remaining public literal-icon paths in
the homepage/how-it-works cards, hero projection control, destination bento,
planner destination/transport/navigation controls, and the shared SVG map,
quote, bookmark, note, car, and bus paths. The public navigation bar now uses
an opaque linen surface so its mobile brand/menu controls remain readable over
the ambient map. The homepage fallback map keeps its semantic container but
removes ambient pin labels/buttons from the primary activity decision and drops
its mobile opacity.
Footer column labels are now styled labels rather than artificial H4 headings,
so the public document outline no longer jumps from the page H1 into footer
heading levels.

Fresh Rumia browser evidence from the temporary server:

- 1440×900: homepage loaded with the activity composer, no literal icon text,
  no horizontal overflow, and no browser warning in a fresh tab.
- 390×844: homepage loaded with no literal icon text or horizontal overflow;
  the fallback pin buttons were not visible and the hero copy/composer remained
  readable above the quieter map layer.
- A fresh browser-console read returned no error/warning entries on the
  homepage. The previous globe/fog warning was not reproduced in the fresh tab;
  the adapter guard remains in source.

The mobile menu and `/explore` route were not accepted in this intermediate
pass: the temporary server became resource-constrained while compiling
`/explore`, so it was stopped rather than leaving another process running. The
remaining acceptance set at that point required a fresh `/explore`/workspace
interaction run, keyboard focus trace, and route-wide captures; the final
verification section below supersedes this interim status.

## Current production-artifact verification (11 July 2026)

After the second follow-up, the remaining literal icon output was removed from
the console, itinerary archive, vault, checkout, expert-chat, not-found, and
trip workspace surfaces. The shared `Icon` component now owns the SVG paths;
`rg` reports no legacy `.ph` output in `apps/web/app` (the only match is the
negative assertion in `packages/ui/src/components/icon.test.tsx`).

A fresh Webpack production build completed successfully, and a serialized
`next start` server was run on port 3302. Current source/artifact browser checks
then recorded:

- `/explore?region=porto` at 1440×900: one judged activity, no horizontal
  overflow, no literal icon text, and no console warnings.
- `/explore?region=porto` at 390×844: no horizontal overflow, no literal icon
  text, and no console warnings. Save/remove produced the live messages
  “Ribeira and Miragaia at walking pace added to your day; 1 activity
  selected.” and “... removed from your day.”
- `/explore/workspace?activity=porto-ribeira-slow-walk` at 1440×900: the
  chosen-day workspace rendered the activity, stayed within the viewport, and
  had no literal icon text or console warnings. Remove followed by “Undo
  remove” restored the activity and announced both states.
- `/console` redirected to `/console/pipeline` at 1440×900 with no legacy icon
  text, no overflow, and no console warnings.
- `/support`, `/pricing`, `/how-it-works`, and `/local-expertise` each exposed
  one H1 and a main landmark at 1440px with no overflow, literal icon text, or
  console warnings.

The mobile menu source contract is covered by the focused component test; a
current browser pass observed the menu opening and focusing the first link, but
the in-app viewport override reset during the later Escape action. This was an
intermediate capture; the complete Escape/focus-return trace and route-wide
gates are recorded below.

## Current mobile keyboard trace (11 July 2026)

The mobile viewport was re-applied after navigation and the complete current
source interaction was rerun at 390×844. The unique toggle was visible; opening
the menu produced `aria-expanded="true"`, rendered the mobile panel, and moved
focus to `top-nav-mobile-link-what-to-do`. Sending Escape through the focused
browser surface produced `aria-expanded="false"`, removed the panel, and
returned focus to `top-nav-mobile-toggle`. The responsive media query remained
active at 390px and no browser warnings were recorded. This closes
RUMIA-UI-011's keyboard trace; the broader route-wide visual/a11y/performance
and provider/licence gates remain separate.

## Final release-gate verification (12 July 2026)

The current `rumia-phase0` artifact was rebuilt and exercised after the full
icon/UI migration and baseline refresh. The previously open route-wide UI
evidence is now green:

- `pnpm test:unit`: **154 files / 805 tests passed**.
- `pnpm --dir apps/web test:e2e`: **301 passed / 33 intentionally skipped**
  across desktop and mobile smoke, route, privacy, traveler, reviewer, admin,
  keyboard, overflow, and visual checks.
- `pnpm --dir apps/web test:visual`: **102 passed / 32 intentional skips**;
  all current desktop/mobile visual baselines match the reviewed UI.
- `pnpm --dir apps/web test:perf`: **14 passed**. The default trip overview
  remains map-free on initial load; the owner-authenticated `/trip/[tripId]/map`
  surface mounts the live MapLibre canvas and stays within its route budget.
- `pnpm typecheck`, `pnpm lint:eslint`, and the Playwright TypeScript check pass.
- `pnpm build` passes with the full route table. Motion, asset, perf-report,
  migration, and sensitive-path QA scripts also pass.

The automated visual projects cover the configured Desktop Chrome viewport and
390×844 mobile; the manual browser evidence covers 1440×900. The dedicated
tablet contract also passed 70/70 at 1024×768 and 768×768 with first-viewport
captures, so those rows are now evidenced rather than inferred.

The final source pass removed literal icon output from public, archive,
checkout, trip, expert, and console surfaces; kept the mobile map/hero quiet;
made save/remove/undo announcements reversible; restored the public support
shell; and hardened browser evidence capture with bounded retries plus a fresh
target fallback for Chromium's intermittent screenshot protocol race.

The optional activity-map Phase 1 remains a separately gated capability. The
current app verifies the existing live MapLibre trip route and its list-safe
fallback, but no new activity-map Phase 1/2/3 implementation was introduced
by this UI pass. Reviewed Portugal activity corpus approval, basemap/tile/
glyph/sprite and route-provider licensing remain explicit non-code gates. The
owner's existing `no rumia.pt for now` decision keeps public ingress deferred;
it is not a private-release blocker. Private VPS operations and backup/
restore evidence are recorded separately in `docs/ops/cutover-evidence.md`.

## Local review follow-up (12 July 2026)

The reported `http://127.0.0.1:3002` failure was reproduced: no local
listener existed, while the in-app browser still pointed at the old
`http://127.0.0.1:3302` tunnel and showed a connection error. Starting the
Next development server initially exposed a second local reliability problem:
the compiler became CPU-bound and stopped responding during route compilation.
The stable review target is now the built standalone server on `3002` rather
than the dev compiler. It returns HTTP 200 for `/`, `/explore`, `/portugal`,
`/planner`, `/support`, and `/api/health`; the health response reports a ready
database.

Two follow-up findings were fixed:

- Root metadata still described AI travel planning/cinematic itineraries and
  page titles duplicated `Rumia` through the layout template. Metadata now uses
  the activity-curation promise and page titles are template-safe.
- The root `MapLibreErrorSuppressor` eagerly imported the spatial engine even
  though the homepage uses a static fallback. Its import is now lazy; the
  production homepage emits zero MapLibre chunks, preserving the map-free
  first-viewport contract.

The in-app browser automation could not claim the stale local tab because its
URL policy rejected the localhost navigation. This is a browser-tool boundary,
not an application failure; HTTP and production-artifact checks above are the
current runtime evidence. Refreshing or opening `http://127.0.0.1:3002/`
manually will show the standalone review target.

## Tablet-width release evidence (12 July 2026)

The dedicated `apps/web/playwright/tests/viewport-contract.spec.ts` contract
was run against a fresh production artifact with the local Better Auth/Postgres
fixtures:

- **70/70 passed** at 1024×768 and 768×768;
- public, traveler, reviewer, and admin rows each passed one-main/one-visible-
  H1, placeholder-image, legacy-icon, overflow, and browser-error checks;
- 70 first-viewport PNG captures are stored under
  `.sisyphus/evidence/future-roadmap/viewport-contract/`;
- Chromium's known headless `GPU stall due to ReadPixels` diagnostic is
  filtered only for MapLibre-backed trip rows; real page errors and warnings
  remain fatal.

The homepage now renders only the static Portugal context illustration. It no
longer mounts the decorative MapLibre globe or fetches terrain before explicit
map intent. The MapLibre renderer remains available on the existing trip map
surface and for the separately gated activity-map capability.

## Editorial aesthetics review (12 July 2026)

This pass reviewed the current public surfaces for visual authorship as well as
correctness: type scale, line length, whitespace, rhythm, surface transitions,
action hierarchy, and whether the interface feels like one editorial product.
The reference frame was Awwwards' storytelling/typography language, treated as
inspiration rather than a source to copy. In particular, the Awwwards *When to
Travel* entry demonstrates a useful timeline selection model for a travel
decision, while *Designed by Women* demonstrates strong type, bottom navigation,
and image-reveal interactions. Rumia should translate those patterns into
activity decisions, not portfolio spectacle.

### Confirmed strengths

- The homepage now reads as a cover: one large question, a short dek, a phrase-
  led instrument, and one outcome-oriented action. The quiet Portugal
  illustration supports the mood without becoming a control surface.
- `/explore` has the strongest editorial product expression: the judgement,
  trade-off, fact rail, and save action are easy to scan without looking like a
  generic marketplace.
- Activity detail and local-review pages use a calm dossier rhythm: kicker,
  display title, verdict, then practical facts. This is more credible than
  decorative imagery or star ratings.
- The linen/midnight-olive contrast chapters are distinctive and consistent;
  the serif/sans pairing gives the product a recognisable voice.
- At 390×844, the public routes reviewed kept a single reading column and no
  document-level horizontal overflow. The large type remains legible and the
  composer wraps without losing its action.

### Aesthetic findings carried into the plan

#### RUMIA-AESTHETIC-001 — Planner is still a legacy visual chapter (P1)

The direct `/planner` first viewport still leads with “ADVANCED DAY PLANNING,”
an itinerary-style context card, and “Plan from the activities you have in
mind.” It is visually polished but reads like a separate travel-planning app,
not the activity-first editorial product. The selected-activity path is closer
to the intended experience, but the empty/direct path remains the public entry
that visitors see.

**Plan action:** UI-2A now brings the direct planner into the same vocabulary as
`/explore`: “Shape a day,” chosen activities, time/effort consequences, and a
clear next action. Keep the dark surface as a deliberate contrast chapter; do
not replace it with a generic white form.

#### RUMIA-AESTHETIC-002 — Footer grid and information architecture (P1, fixed in source)

The footer declared four desktop columns while rendering five content groups,
so Legal dropped beneath the first column at wide widths. Support also appeared
under both Help and Legal. That weakened the final-page composition and made
the information architecture look accidental.

**Source fix:** the footer now uses a five-column desktop grid and removes the
duplicate Legal → Support link. Typecheck, lint, build, and diff checks pass
after the source change; the dedicated visual baseline refresh remains part of
the UI-2A follow-on.

#### RUMIA-AESTHETIC-003 — Quiet pages need useful editorial pacing (P2)

`/how-it-works`, `/local-expertise`, and `/human-review` have a strong typographic
voice but can leave a large desktop field with little evidence or next-action
weight. The answer is not adding ornamental cards. Use one meaningful evidence
block, a time/decision index, a short pull quote, or a sourced visual treatment
where it clarifies the decision; otherwise tighten the vertical rhythm.

#### RUMIA-AESTHETIC-004 — Empty workspace needs a stronger recovery composition (P2)

The empty chosen-day workspace is intentionally quiet, but its lower half can
feel unoccupied when no activity is selected. Keep the calm tone while making
“Keep exploring” a visually unmistakable recovery action and showing one small
example of what a saved day will contain. Do not turn the empty state into a
promotional dashboard.

### Editorial guardrails

The plan now records the following Awwwards-informed techniques: masthead/dek/
verdict hierarchy, asymmetric editorial grids, time-window chapter markers,
non-essential desktop hover reveals with touch/keyboard equivalents, evidence-
led imagery with provenance, and short purposeful transitions. It explicitly
excludes autoplay video, scroll hijacking, custom cursors, hover-only meaning,
and ornamental 3D on the homepage. The core generated-plan journey remains the
priority; editorial polish is a follow-on slice and the map remains a later
progressive enhancement.
