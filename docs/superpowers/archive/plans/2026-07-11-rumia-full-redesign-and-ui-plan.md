# Rumia full redesign and UI improvement plan

> Companion plan to the canonical activity-first roadmap in
> `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`. This is a
> planning document and current implementation record. The initial UI pass is
> now implemented and verified in the isolated `rumia-phase0` worktree; the
> remaining non-code release gates below still require explicit evidence.
>
> The broader frontend component/art-direction/texture/motion/3D rework is now
> planned in the bounded companion
> `docs/superpowers/plans/2026-07-12-rumia-frontend-aesthetic-rework.md`.

## Goal

Make Rumia feel like one coherent, trusted editorial product from first visit
through saved activity day:

**state the situation → compare judged activities → save a day → shape the day
→ optionally understand it spatially → save/share/feedback**

The redesign must improve clarity, hierarchy, feedback, responsive behavior,
accessibility, and perceived performance while preserving Rumia’s actual
product boundary:

> Rumia helps travellers decide what is genuinely worth doing with the time
> they have.

Rumia is not a booking platform, hotel finder, destination chooser, travel
agency, global directory, or chatbot. A route, expert review, commerce tier, or
3D map is downstream and optional.

## Product and design decisions

1. **Activity judgement is the visual centre.** The first viewport must make
   the phrase-led activity situation and primary action obvious within five
   seconds.
2. **Portugal-wide coverage stays intact.** Porto and Northern Portugal may be
   the first deep corpus, but the interface must not imply Porto-only launch
   scope.
3. **The map is progressive enhancement.** The current hero globe is reduced
   to a quiet, Portugal-relevant context; the useful interactive map begins in
   the selected-day workspace. See the [activity-map capability
   plan](../specs/2026-07-11-rumia-activity-map-capability.md).
4. **Editorial cards carry the reason to trust Rumia.** Every card must make a
   judgement and a trade-off visible; no decorative image or score substitutes
   for that work.
5. **One design system, two surface modes.** Linen/editorial surfaces and
   midnight-olive planning surfaces share typography, tokens, iconography, and
   focus behavior. Context changes contrast tokens; components do not invent
   ad-hoc colours.
6. **State is visible and announced.** Save, remove, replace, share, loading,
   empty, error, and fallback states are first-class UI states, not incidental
   text changes.
7. **Motion explains, never gates.** All movement is short and interruptible;
   reduced motion removes camera travel, view transitions, and decorative
   animation without removing information.

## Scope boundaries

### In scope

- Public home, Portugal collections, activity explorer, activity detail, day
  workspace, planner, saved-trip preview, support/legal shell, sign-in entry,
  and operator mobile read/triage.
- Shared navigation, footer, skip link, page shell, icon system, typography,
  spacing, color tokens, buttons, chips, cards, status messages, and responsive
  layout primitives.
- The browser review findings `RUMIA-UI-001` through `RUMIA-UI-012`.
- A feature-flagged Phase 1 activity map after the core chosen-day journey is
  stable; Phase 2/3 map work remains in its separate capability plan.

### Out of scope for this redesign

- A new booking, payment, concierge, or chatbot experience.
- A new content-management system before the reviewed activity projection is
  stable.
- A native mobile application.
- Replacing the existing VPS-native backend/auth decision.
- Copying the referenced `london-3d` implementation or visual composition.
- Making the 3D map, a hero animation, or the destination atlas the first task.

## 1. Experience architecture

### 1.1 Public journey

| Surface | First question answered | Primary action | UI emphasis |
| --- | --- | --- | --- |
| `/` | What kind of time do I have and what do I want from it? | Start or edit the activity sentence | H1, supporting copy, phrase composer, quiet context only |
| `/portugal` | What kinds of activities and regional judgements exist? | Open an activity collection | Editorial collection cards, not route cards |
| `/explore` | Which reviewed activities fit my situation? | Save, remove, or inspect an activity | Result cards and transparent day tray |
| `/activities/[id]` | Why is this activity worth considering? | Save to the day or choose an alternative | Verdict, trade-offs, evidence, practical facts |
| `/explore/workspace` | What does my selected day look like as a whole? | Remove, reorder, share, view optional map | Activity list first; map is opt-in |
| `/planner` | Can these chosen activities fit a day? | Shape the selected day | Pacing, mobility, buffers, consequences |
| `/trip/[tripId]` | What is the saved version of this day? | Review, revise, share, export when eligible | Agenda and version state |
| `/trip/[tripId]/map` | What is the spatial shape of the saved day? | Inspect or edit with list equivalent | Map/list editor; later camera storytelling |

### 1.2 Shared shell contract

- Every public route uses the same `TopNav`, skip link, content width, footer,
  focus ring, and back-to-home path.
- The current `/support` shell exception is removed; utility pages use the
  same public shell as marketing pages.
- Navigation labels stay user-facing and activity-oriented: “What to do,”
  “How it works,” “Local expertise,” and pricing/waitlist only when its feature
  gate is enabled.
- Active route state uses `aria-current="page"` and a visible underline or
  equivalent non-colour cue.
- The mobile menu has a complete focus contract: focus first link on open,
  Escape closes, focus returns to the toggle, and hidden page content is not
  keyboard-reachable while the panel is blocking interaction.

## 2. Visual redesign system

### 2.1 Typography

- Keep the editorial display/body pairing: a serif display voice for judgement
  and a system sans/mono body/UI voice for facts and actions. The production
  build uses self-contained system stacks rather than a build-time Google Font
  fetch, so the VPS and offline release path remain deterministic. Do not add
  an external icon or font dependency to solve a glyph.
- Establish a documented scale for eyebrow, body, lead, H1, H2, H3, label, and
  metadata tokens. The scale must remain readable at 390px without zooming.
- Keep body measure between approximately 45–75 characters for reading blocks;
  use `max-w-*` rather than long full-width paragraphs.
- Use uppercase/mono only for short labels, times, distances, and status data;
  never use tracked uppercase for explanatory copy.
- One route has one H1. Content sections use sequential H2/H3 levels; footer
  labels that are not document sections are styled labels, not artificial H4s.

### 2.2 Color and contrast

- Use the existing token families: primary/midnight olive, linen, surface,
  `on-surface`, `on-surface-variant`, and AA-safe `ochre-on-light`.
- Dark planning panels explicitly use light/linen labels and controls; shared
  components accept a surface context instead of inheriting an unsafe default.
- Normal text targets at least 4.5:1 contrast; controls and meaningful graphics
  at least 3:1. Colour is never the only selected, warning, or route-mode cue.
- Use ochre for judgement/accent and action emphasis, not for large body copy
  on pale backgrounds where the lighter token fails contrast.
- Keep borders subtle but present; selected states add text, border, and
  icon/shape reinforcement rather than relying on a colour shift.

### 2.3 Layout, spacing, and surfaces

- Use the existing spacing/gutter tokens as the baseline; add a token only when
  a repeated rhythm cannot be expressed by the current scale.
- Desktop content uses a calm editorial column with a stable reading measure;
  side rails are sticky only when they do not obscure content.
- Mobile uses a single reading column, no document-level horizontal scroll,
  and safe-area-aware fixed controls.
- Cards use one consistent border, radius, and padding language. Avoid mixing
  glass, heavy shadow, rounded pills, and editorial borders on the same element
  unless the component has a named variant.
- The first viewport should contain the task, its reason, and its action—not an
  empty decorative field or an unbounded map.

### 2.4 Iconography

- Use the existing SVG `Icon` component and add missing paths there.
- Remove literal Material Symbols text. The back-to-top control must render an
  SVG path, not a font ligature or a network font.
- Every icon-only control has an accessible name and a visible focus ring.
- Icons support the label; they never carry the only meaning of a mode, error,
  or selection state.

### 2.5 Editorial art direction (Awwwards-informed, Rumia-specific)

Rumia should borrow the craft of award-winning editorial and storytelling sites,
not their spectacle. Awwwards' travel example *When to Travel* uses a timeline
selection model and horizontal navigation to make time a tangible decision;
*Designed by Women* pairs strong type with a bottom navigation system and image
reveals. Rumia can translate those ideas into useful activity decisions while
keeping native scrolling, readable content, and the activity plan in control.

**Use these techniques:**

- **Masthead + dek + verdict.** Treat each public page like a short magazine
  spread: one decisive headline, a compact explanatory dek, then an explicit
  Rumia judgement before facts or actions.
- **Editorial grid, not dashboard chrome.** Use a strong reading column with a
  measured fact rail, thin rules, asymmetric but stable columns, and generous
  section breaks. Let alignment and whitespace create authority instead of
  cards, shadows, and badges everywhere.
- **Time as a visual index.** On `/explore` and the day workspace, use a quiet
  morning/afternoon/evening rail or chapter markers to show how activities fit
  the available slice of time. It must remain a normal list on mobile.
- **Reveal supporting context, never the core judgement.** Desktop hover/focus
  can reveal a still image, nearby pairing, or “choose instead” note; title,
  verdict, duration, and action stay visible without hover and are never hidden
  from touch or keyboard users.
- **Paced transitions.** Use short fade/position changes between an activity
  selection and its detail/workspace state. A transition should explain what
  changed, not delay it. Keep camera storytelling for the later map phases.
- **Evidence-led imagery.** Use a small set of owned or licensed Portugal
  images/illustrations with captions and provenance. Do not add stock imagery
  merely to fill a card or imitate a portfolio homepage.
- **Chapter navigation where it helps.** Long editorial pages may have a small
  section index or sticky “you are here” marker, but no scroll hijacking,
  hidden cursor, or navigation that requires discovering a gesture.

**Apply the language by surface:**

| Surface | Editorial treatment | Product guardrail |
| --- | --- | --- |
| `/` | Cover-like masthead, one phrase-led instrument, quiet Portugal context | No map controls or decorative tour before the decision |
| `/portugal` | Atlas/index of activity collections with typographic covers and short judgements | Portugal-wide coverage stays visible; no destination-search framing |
| `/explore` | Results as a judged reading list with a compact time rail | Save/remove remains the clearest action |
| `/activities/[id]` | Activity dossier: verdict, caveat, fact rail, pairing, alternative | Practical facts and source status stay above decorative media |
| `/explore/workspace` | Editor's desk: selected day, time order, consequences, optional spatial view | List remains complete without a map |
| Utility/legal | Quiet colophon style with clear recovery/action links | Do not make low-frequency pages look like a different product |

**Do not import:** autoplay hero video, infinite/parallax-only navigation,
custom cursors, scroll hijacking, ornamental 3D on the homepage, or hidden
content that only appears on hover. Awwwards' own evaluation model gives
usability 30% and content 10% alongside design 40% and creativity 20%; for
Rumia, the useful editorial decision is the creative constraint.

## 3. Screen-by-screen redesign

### 3.1 Homepage (`/`)

**Hierarchy:** H1 → one-sentence value proposition → phrase composer → one
primary action → supporting proof/how-it-works.

- Keep the activity question: “What is actually worth your time in Portugal?”
- Reduce the current globe to a muted contextual layer. On mobile, move it
  below the composer or replace it with a quiet 2D Portugal treatment; remove
  world labels, decorative region pins, and desktop-only “Use ⌘ + scroll” copy.
- Do not place projection toggles, zoom controls, or map instructions in the
  first decision layer.
- Ensure the composer has a visible label/context, clear phrase states, focus
  return, custom-text retention, loading, and error feedback.
- Keep the primary action outcome-oriented: “Show me what is worth doing.”
- Avoid pricing, booking, expert, or itinerary promises above the fold.

### 3.2 Portugal collections (`/portugal`)

- Present collections around real activity decisions: time, mood, group,
  weather, season, mobility, or region.
- Each collection card has a clear title, one-line judgement, coverage state,
  and a single action. No generic “Plan a route” labels.
- Use owned/verified imagery or typographic covers; do not add decorative
  media to fill a layout gap.
- Preserve Portugal-wide discovery while allowing Porto/Northern Portugal to
  show greater depth when the corpus supports it.

### 3.3 Activity explorer (`/explore`)

- Keep the phrase editor visible but compact after the first result.
- Result cards place the verdict and title first, then practical metadata in a
  consistent scan order: best for → time → go/avoid when → pairing/alternative.
- Use a short visual action (“Save to your day”) with a complete accessible
  name; after saving, expose the reversible “Remove” state.
- Add one bounded `role="status"` region for save/remove/replace/empty/error
  messages. Do not create duplicate announcements from the card and tray.
- Preserve loading and empty states without unrelated filler. A no-result state
  proposes one concrete phrase change.
- On mobile, reserve bottom padding equal to the expanded day tray plus safe
  area; no card text or focused element may sit underneath it.

### 3.4 Activity detail (`/activities/[id]`)

- Lead with the Rumia verdict, followed by “Best for,” realistic duration,
  best timing, caveats, booking requirement, effort/cost, and accessibility
  notes where known.
- Keep editorial evidence close to the claim it supports. Label source facts
  versus Rumia judgement.
- Provide `Save to your day`, `Choose instead`, and nearby pairing actions as
  explicit choices; no booking action.
- If coordinates are available, show a quiet map/list context after the main
  judgement, not before it.

### 3.5 Day tray and workspace (`/explore/workspace`)

- Desktop: use a stable side rail with count, total activity time, proximity
  clue, and the next action.
- Mobile: use a compact fixed bar that expands on request; reserve safe-area
  space and never cover `Avoid when`, `Choose instead`, or evidence links.
- Keep remove/reorder/share states reversible and announced.
- Make the optional `View on map` control secondary. The list remains complete
  if WebGL, tiles, or route geometry fail.
- Map Phase 1 uses the separate activity-map capability plan and the dormant
  `ENABLE_ACTIVITY_MAP` flag; no 3D hero dependency is introduced here.

### 3.6 Planner and saved trip

- Make `/planner` read as “Shape your chosen day,” not “generate a trip.”
- Keep the dark panel, but switch labels and chip text to the correct light
  contrast context. Verify hover, focus, selected, disabled, and error states.
- Show pacing consequences in plain language: time left, transfer effort,
  meal/rest buffer, weather fallback, or a specific conflict.
- `/trip/[tripId]` prioritizes next action, day overview, agenda/detail, then
  gated review/export/commerce. Do not let a map or decorative timeline hide
  the saved activity list.

### 3.7 Utility, auth, and operator surfaces

- `/support`, `/offline`, legal pages, and `/sign-in` use the same public shell
  and content width. Their first action and recovery path are explicit.
- `/pricing`, `/human-review`, and `/local-expertise` show only enabled
  capabilities; future tiers are labelled preview/waitlist or hidden until the
  relevant Release 3/4 gate passes.
- `/console` at 390px stacks search/filter controls and provides a clear
  horizontal-scroll or vertical triage affordance. The outer shell must not
  clip reachable content.
- Operator cards preserve dense information but keep action labels, focus
  states, destructive confirmations, and audit affordances visible.

## 4. Interaction and feedback contracts

Every interactive surface must define these states before implementation:

| State | Required behavior |
| --- | --- |
| Default | Clear label, affordance, and next action. |
| Hover | Non-essential visual cue; never the only state cue. |
| Focus | Visible 2px-equivalent ring with sufficient contrast and no clipping. |
| Selected/saved | Text, border, and status change; reversible action remains available. |
| Loading | Preserve the traveller’s sentence/selection and show what is pending. |
| Empty | Explain why there are no results and offer one concrete recovery action. |
| Error | Use the typed error envelope, plain language, retry/recovery, and status announcement. |
| Disabled | Explain why the action is unavailable; do not hide required context. |
| Reduced motion | Immediate state/camera change; no information disappears. |

Shared feedback rules:

- A single scoped live region handles save/remove/share/fallback outcomes.
- Focus stays on the action that changed state unless the user explicitly
  opened a new surface.
- Copy describes outcomes (“Saved to your day,” “Try a different time”) rather
  than internal mechanics (“submitted,” “mutation failed”).
- Map camera movement, a shimmer, or a colour transition never substitutes for
  a text status.

## 5. Responsive and accessibility matrix

| Viewport | Required layout proof |
| --- | --- |
| 1440×900 | Hero hierarchy, readable line lengths, stable side rails, no decorative map dominance, no large accidental dead zones. |
| 1024–1200 | Navigation and two-column cards collapse without clipped actions or overly narrow reading measure. |
| 768 | Tablet menu/rails switch intentionally; no half-desktop overflow. |
| 390×844 | One-column activity reading, safe-area tray, touch-specific guidance, no map overlap, no clipped controls or horizontal document scroll. |

Accessibility gates:

- One `main` and one H1 per route; sequential heading outline.
- Keyboard path through nav, menu, phrase composer, result card, day tray,
  map toggle, planner chips, and recovery states.
- Focus return for menus, phrase rails, sheets, and map panels.
- Axe has no serious/critical violations; manual contrast checks cover dark
  planner labels and all new status surfaces.
- Screen-reader announcements cover save/remove, loading, empty/error, map
  fallback, and share results.
- `prefers-reduced-motion` is tested both in CSS and in camera/React behavior.
- Touch targets are at least 44px where practical; constrained inline targets
  have an equivalent reachable control.

## 6. Performance and technical UX

- Keep the initial public JS budget (`≤220KB`) separate from the lazy map chunk.
- Homepage and initial `/explore` do not load MapLibre, map tiles, 3D terrain,
  or optional imagery before explicit map intent.
- Avoid layout shift from fonts, fixed trays, map panels, or status messages.
- Use skeletons only where they preserve the final geometry; do not animate an
  empty map as though data exists.
- Measure LCP, INP, CLS, map-open latency, tile count, WebGL failure, and route
  transition warnings at 1440px and 390px.
- Keep animation durations tokenized and disable them under reduced motion.
- Provide list/static/error fallbacks for map, image, network, and data failure.

## 7. Implementation sequence

### UI-0 — Baseline, tokens, and shared shell

**Maps to:** Release 0 and the existing browser P0/P1 gate.

1. Replace literal icon-font output with the SVG `Icon` system; add missing
   paths and tests.
2. Audit token usage, dark-surface contrast, focus rings, and typography
   hierarchy; add only reusable variants.
3. Fix `TopNav` mobile focus/open/close behavior and move `/support` into the
   shared public shell.
4. Add the shared live-status primitive and document its ownership rules.

**Implementation status (11 July):** SVG icon rendering, planner dark-surface
label contrast, shared support shell, mobile-nav focus return, save/remove
announcements, and chosen-day undo feedback are implemented with focused tests.
The follow-up pass migrated the remaining public, operator, archive, checkout,
vault, and trip-workspace `ph` icon usages, strengthened the opaque mobile
navigation surface, and quieted the homepage fallback map so it cannot compete
with the activity composer. A fresh Webpack artifact and serialized browser
pass now cover `/explore`, chosen-day workspace, `/console`, and the utility
routes at 1440px; `/explore` save/remove and workspace remove/undo are recorded
at 390px/desktop respectively. The current 390px browser trace now also proves
the complete mobile menu contract: open → first-link focus → Escape → closed →
toggle focus. Route-wide visual/accessibility/reduced-motion/performance
evidence is now recorded in the final browser-review verification section and
the UI-5 gate below.

**Exit:** RUMIA-UI-001, 002, 005, 007, 011, and 012 have component tests and
fresh desktop/mobile evidence.

### UI-1 — Public activity journey

**Maps to:** Releases 1A and 1B.

1. Redesign the homepage first viewport around the activity situation and
   quiet context layer.
2. Normalize phrase composer, result card, activity detail, empty/loading/error,
   and day-tray variants.
3. Remove or gate unsupported pricing/review copy from public acquisition.
4. Establish Portugal-wide collection templates and content density rules.
5. Add analytics for intent started, results viewed, saved, removed, day opened,
   shared, and feedback.

**Exit:** a new visitor can complete the activity journey at 1440px and 390px;
all public cards are reviewed and no fixed element obscures content.

### UI-2 — Chosen day and saved-trip continuity

**Maps to:** Release 2 and the start of Release 3.

1. Make planner labels/chips context-aware and improve pacing consequence
   hierarchy.
2. Preserve selected IDs and status across explorer → workspace → planner →
   sign-in → saved trip.
3. Make share, feedback, error, and recovery states explicit.
4. Keep the practical list and agenda available above any spatial enhancement.

**Exit:** no selected activity disappears; planner contrast and keyboard tests
pass; saved-trip hierarchy is legible without animation or map interaction.

### UI-2A — Editorial polish and cross-page art direction

This is a visual-quality slice, not a new product surface. It follows the
core journey gates and must not delay activity data, save/remove continuity, or
the list-safe fallback.

For the complete component inventory, background/asset direction, motion
vocabulary, 3D hero decision, and phased frontend refactor, use the dedicated
[`frontend aesthetic rework plan`](2026-07-12-rumia-frontend-aesthetic-rework.md).

1. Bring the direct `/planner` entry into the same activity-first vocabulary:
   “Shape a day,” “chosen activities,” and pacing consequences; remove the
   remaining generic multi-day itinerary tone from the first viewport.
2. Keep the dark planning surface as a deliberate contrast chapter, but align
   its masthead, context summary, controls, and action hierarchy with the
   linen/editorial surfaces.
3. Give long public pages a consistent editorial rhythm: kicker → H1 → dek →
   judgement/decision → facts → next action. Add a section index only where it
   materially improves orientation.
4. Repair shared shell polish found in the visual review: the footer must keep
   Portugal, Product, Help, and Legal on the same desktop grid, and duplicate
   links must not make one destination appear to belong to two categories.
5. Add only purposeful motion or image reveals after the static composition is
   approved; every reveal has a visible keyboard/touch equivalent and a reduced-
   motion path.

**Exit:** representative public, planner, workspace, utility, and sign-in
surfaces read as one editorial product at 1440×900 and 390×844; no route uses
legacy itinerary language in its first viewport; footer columns and mobile
stacking are intentional; no animation is required to understand a judgement
or action.

### UI-3 — Optional spatial enhancement

**Maps to:** optional Release 2A and later map phases.

1. Implement activity-map Phase 1 only after UI-1/UI-2 journey gates pass.
2. Add Phase 2 camera storytelling only after saved-day and route contracts are
   stable.
3. Consider Phase 3 3D only after usage, licensing, accessibility, and
   performance evidence justify it.

**Exit:** use the dedicated activity-map acceptance criteria; map work never
   blocks the list journey or base MVP.

### UI-4 — Utility and operator quality

**Maps to:** Releases 4 and 5.

1. Reconcile pricing, local-expertise, human-review, support, offline, and
   legal page states with enabled capabilities.
2. Finish console mobile read/triage and operator focus/destructive-action
   patterns.
3. Keep specialist and B2B surfaces capability-scoped and visually distinct
   from consumer promises.

**Exit:** operator mobile and public utility routes pass the same shell, focus,
   heading, and responsive matrix.

### UI-5 — Visual baseline and production hardening

**Maps to:** Release 6.

1. Capture the approved route matrix at 1440×900, 1024, 768, and 390×844.
2. Run visual diff, axe, keyboard, reduced-motion, performance, and browser
   warning checks.
3. Verify no external icon/font dependency, no unsupported map warning, no
   unbounded overflow, and no enabled copy that promises a gated feature.
4. Canary changes behind feature flags and retain the previous route/component
   path for reversible rollback until evidence is accepted.

**Exit:** no unresolved P0/P1 UI finding, no serious/critical a11y finding,
truthful route/state matrix, and measured Web Vitals within project budgets.

**Verification status (12 July 2026):** UI-0 through UI-2 and the UI-4 browser
gates are satisfied by the current artifact: the full smoke matrix passed 301
tests with 33 intentional skips, the visual matrix passed 102 tests with 32
intentional skips, the performance matrix passed 14 tests, and the
unit/typecheck/lint/build gates are green. Automated visual coverage is the
configured Desktop Chrome viewport plus 390×844 mobile, with fresh manual
1440×900 evidence. The dedicated `@viewport-qa` contract has now run against a
fresh production artifact: **70 passed** across all public, traveler, reviewer,
and admin rows at 1024×768 and 768×768, with 70 first-viewport evidence captures
under `.sisyphus/evidence/future-roadmap/viewport-contract/`. The optional
activity-map Phase 1 is deliberately not included in this completion claim; it
remains gated on reviewed Portugal activity data, route geometry, provider/
licence terms, and the dedicated map acceptance criteria. The homepage hero now
uses a static Portugal context illustration and does not mount MapLibre; globe
terrain is opt-in and disabled by default so no unapproved DEM source is
fetched while that gate is open.

## 8. Likely implementation files

Shared design system and shell:

- `packages/ui/src/styles.css`
- `packages/ui/src/components/icon.tsx`
- `packages/ui/src/components/icon.test.tsx`
- `packages/ui/src/components/choice-chip-group.tsx`
- `packages/ui/src/components/shell.tsx`
- `apps/web/app/_components/top-nav.tsx`
- `apps/web/app/_components/site-footer.tsx`
- `apps/web/app/globals.css`

Activity journey:

- `apps/web/app/(marketing)/page.tsx`
- `apps/web/app/(marketing)/hero-map.tsx`
- `apps/web/app/(marketing)/_components/hero-intent-card.tsx`
- `apps/web/app/(marketing)/_components/activity-result-card.tsx`
- `apps/web/app/(marketing)/_components/activity-day-tray.tsx`
- `apps/web/app/(marketing)/explore/activity-explorer.tsx`
- `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`
- `apps/web/lib/content/activities.ts`

Planner, utility, and operator surfaces:

- `apps/web/app/planner/_components/planner-single-screen.tsx`
- `apps/web/app/support/page.tsx`
- `apps/web/app/console/_components/pipeline-board.tsx`
- `apps/web/app/console/_components/pipeline-header.tsx`
- public utility page layouts under `apps/web/app/(marketing)/`

Spatial capability:

- `apps/web/app/(marketing)/explore/workspace/activity-map.tsx`
- `apps/web/app/(marketing)/explore/workspace/activity-map-model.ts`
- `apps/web/playwright/tests/viewport-contract.spec.ts`
- `packages/types/src/geographic-route.ts`
- `docs/ops/rumia-content-approval.md`
- `docs/ops/map-provider-licensing.md`
- `docs/ops/geographic-route-contract.md`
- `packages/spatial-engine/src/components/workspace-canvas.tsx`
- `packages/spatial-engine/src/core/types.ts`
- `packages/spatial-engine/src/adapters/maplibre/layers/route-layer.ts`
- new activity-point layer only if the existing route layer cannot support it

Verification:

- `docs/reviews/2026-07-11-rumia-browser-ui-review.md`
- `apps/web/playwright/tests/visual.spec.ts`
- `apps/web/playwright/tests/accessibility.spec.ts`
- `apps/web/playwright/tests/perf.spec.ts`
- focused component tests beside each redesigned component
- new `apps/web/playwright/tests/integration/activity-map.spec.ts` for the
  optional map track

## 9. Quality gates

Run the smallest relevant gate after each slice, then the full gate before
release:

```text
pnpm exec vitest run <focused-test>
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm --dir apps/web test:e2e
pnpm --dir apps/web test:a11y
pnpm --dir apps/web test:visual
pnpm --dir apps/web test:perf
pnpm qa:motion-gate
pnpm qa:perf-budget
pnpm build
```

The application build must not depend on a live font CDN. When the default
Turbopack runner is unavailable in a restricted environment, the equivalent
Webpack production build is an acceptable diagnostic path, provided it runs
with the same release environment variables and produces the full route table.

Manual evidence is required in addition to green commands:

- fresh 1440×900 and 390×844 captures for `/`, `/explore`,
  `/explore/workspace`, `/planner`, `/support`, `/pricing`, and `/console`;
- keyboard path and focus-return trace for navigation, composer, tray, and
  map sheet;
- DOM/assistive announcement evidence for save/remove/share/error;
- browser console with no unsupported globe/fog warning;
- reduced-motion run with no essential information lost;
- map network trace proving no MapLibre/tile load before map intent.

## 10. Rollback and release policy

- Keep redesign slices small and route-scoped. Do not combine shell, content,
  map, and commerce changes in one irreversible release.
- Use feature flags for the optional map and any later 3D behavior.
- If a visual change causes a regression, revert the component variant or flag
  rather than changing data contracts or deleting the previous fallback.
- Never roll back by reintroducing Supabase assumptions or old itinerary-first
  public copy; rollback restores a working activity-first surface.
- No slice is complete from source inspection alone. Each P0/P1 finding needs
  fresh browser evidence at both primary viewports.

## Final recommendation

The redesign should be executed as a **clarity-first UI program**, not a
visual makeover sprint. Fix the shared defects first, then make the public
activity journey excellent, then make chosen-day continuity reliable, and only
then add the optional map/3D enhancement. The most important visual decision
is also the simplest: the traveller should always know what Rumia wants them
to decide next.
