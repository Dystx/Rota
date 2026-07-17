# Rumia Frontend Aesthetic Rework Design

**Status:** Approved design for plan writing

**Date:** 2026-07-12

## Purpose

Rumia already has an activity-first product direction and a substantial UI
redesign baseline. This design defines the missing frontend aesthetic and
interaction work: a coherent editorial visual language, shared component
states, purposeful feedback, restrained motion, and a progressive spatial
experience.

This is a frontend design and implementation boundary. It does not replace the
canonical product roadmap, change the backend stack, or make a map the product.

## Product outcome

Rumia should feel like a carefully edited Portugal field guide that happens to
be interactive:

> State the time you have → see a judgement → compare the trade-off → keep a
> day that still feels like yours.

The user journey remains:

```text
activity situation → judged results → compare → save → chosen day → shape the day → optional spatial view
```

The activity list, editorial judgement, and practical consequences are always
more authoritative than decoration, animation, or map geometry.

## Authority and reconciliation

The following documents retain their existing authority:

| Document | Authority | This design's relationship |
| --- | --- | --- |
| `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md` | Product and release authority | Owns Portugal-wide coverage, activity-first positioning, non-goals, and release order. |
| `docs/superpowers/plans/2026-07-14-rumia-frontend-polish.md` | Frontend execution authority | Owns current route responsibilities, visual polish sequencing, accessibility, responsive rules, component state coverage, and aesthetic acceptance gates. |
| `docs/superpowers/specs/2026-07-10-rumia-activity-curation-design.md` | Activity domain contract | Owns editorial fields, review status, judgement semantics, and user-facing boundaries. |
| `docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md` | Spatial capability contract | Owns map phases, route truth, fallback behavior, and licensing constraints. |
| `docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md` | Runtime and deployment authority | Owns the VPS-native stack; this design introduces no hosting or database change. |
| `docs/reviews/2026-07-11-rumia-browser-ui-review.md` | Current evidence | Supplies browser findings and visual/a11y evidence to rerun. |

Historical itinerary-first, route-first, and Supabase plans remain archival and
must not override these decisions.

## Two-tier delivery model

The work is intentionally split into two artifacts:

1. **Full A–H frontend roadmap:** the complete visual workstream from audit to
   production baseline verification.
2. **First-slice implementation plan:** a smaller, independently testable
   slice covering the shared design system and `/planner`/workspace continuity.

The full roadmap gives sequencing and dependency gates. The first slice gives an
engineer concrete tasks that can be implemented and verified without waiting for
3D, new backend work, or a complete image library.

## Scope

### In scope

- Editorial composition grammar across public, traveler, utility, and operator
  surfaces.
- Token-backed typography, spacing, colors, rules, surfaces, and depth.
- Shared shell and primitive state consistency.
- `/planner` continuity with saved activity selections.
- `/explore/workspace` empty, selected, conflict, loading, error, and saved
  states.
- Save, remove, replace, reorder, and status feedback.
- Reduced-motion and keyboard behavior.
- Visual, accessibility, responsive, and performance verification.
- Progressive 2D map, itinerary camera storytelling, and later 3D exploration.

### Explicitly out of scope

- Booking, affiliate checkout, or travel-agency workflows.
- Hotel or accommodation search.
- Chatbot UI or open-ended itinerary conversation.
- Automatic itinerary generation that hides user choices.
- A map-first homepage or WebGL dependency in the initial page path.
- Backend/database replacement or new persistence work for the first slice.
- Decorative 3D before the chosen-day journey is stable.
- Blind visual snapshot regeneration.

## Architecture

The existing stack remains authoritative:

- Next.js, React, TypeScript, Tailwind, and the existing `packages/ui` package.
- Motion is used only for short, interruptible feedback transitions.
- MapLibre is loaded lazily and behind the existing spatial capability boundary.
- Activity state remains authoritative in the existing activity-first flow; the
  first slice does not invent a new state store or persistence contract.
- No new dependency is introduced solely for visual polish without a measured
  need and a bundle/performance review. **Addendum (2026-07-13):** Base UI may
  be introduced incrementally as an unstyled behavior layer for dialogs,
  drawers, action sheets, menus, and select/combobox controls. It must be
  wrapped by `packages/ui`, must not impose a visual theme, and must pass the
  existing accessibility, reduced-motion, visual, and bundle gates before any
  further adoption.

### Behavior-library addendum (2026-07-13)

The design system remains Rumia-owned. Base UI is selected only to reduce the
amount of hand-rolled focus, portal, keyboard, and dismissal behavior. The
implemented slices are the mobile navigation sheet, planner/trip-new choice
sheet, and authenticated export side sheet. Route files must consume Rumia
wrappers, not Base UI directly. Radix and React Aria remain alternatives only
if a concrete interaction requirement cannot be met; shadcn is not a wholesale
replacement strategy. The one-day activity save/remove action remains direct;
an action sheet is deferred until a real multi-day or replacement-choice
workflow exists.

The component boundary is:

```text
route surface
  → page shell / semantic chapter
    → editorial primitives
      → activity and chosen-day components
        → state feedback and optional map/list enhancement
```

**Implementation checkpoint (2026-07-13):** the mobile navigation,
planner/trip-new choice, and authenticated export side-sheet slices are
implemented through `packages/ui` wrappers. Base UI is not imported by route
files. This addendum does not make the optional map/3D work complete.

The list and text state must remain usable if imagery, motion, map tiles, or
WebGL are unavailable.

## Visual system

### Composition grammar

Authored pages follow:

```text
kicker → headline → dek → judgement/evidence → action → source/context
```

The first viewport must contain the task, the reason it matters, and one clear
action. A strong reading column, a measured fact rail, thin rules, and stable
asymmetry create authority without dashboard chrome.

### Typography and spacing

- One display serif for editorial headlines.
- One sans-serif for body and interface text.
- Mono only for short time, distance, and system metadata.
- Named tokens for kicker, display, lead, body, label, metadata, and action
  text.
- A 4/8 rhythm: `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- A readable body measure of approximately 45–75 characters where the layout
  permits.
- Headings stay legible at 390px and 200% text zoom.

### Semantic surfaces

- **Linen:** reading, collections, activity detail, and utility pages.
- **Sage:** discovery, comparison, empty, and feedback states.
- **Midnight olive:** chosen-day composition and deliberate planning focus.
- **Ochre:** judgement, selected state, and next-action emphasis.

Depth uses borders, tonal shifts, and one restrained shadow level. Glass,
heavy shadows, pills, and editorial rules are not combined without a named
component variant.

### Imagery and graphic language

Use owned or licensed Portugal imagery/illustration with source, licence, crop,
alt text, and refresh metadata. Prefer one strong crop with a caption over
thumbnail grids. Imagery expresses atmosphere or evidence; it never replaces a
visible verdict.

Brand-owned graphics may use contour lines, cartographic annotation, azulejo-
like geometry, and simple line illustrations. No specific award-site layout or
asset is copied.

#### Full-bleed media contract

The current abstract/contour language is retained, but important public
chapters may use one place-specific full-bleed image as an authored anchor:

- home cover;
- activity detail;
- Portugal/explore chapter break;
- chosen-day route/atmosphere preview after activities are saved.

Explore result cards, planner inputs, empty states, sign-in, support, feedback,
and operator surfaces remain readable without a media layer. Video is not the
default: it may be introduced only as one silent 6–10 second ambient loop after
the still-image baseline passes. Every video has a poster, inline muted playback,
captions/transcript policy where informative, and a reduced-motion/reduced-data
still path.

The existing asset manifest is the source of truth for route/activity/chapter
references, responsive variants, dimensions/bytes, alt/caption, source and
licence, focal point/text-safe zone, poster/fallback, review dates, and motion
policy. Responsive `srcset`/`sizes`, reserved aspect ratios, lazy below-fold
loading, and a measured LCP/CLS budget are required. Full-bleed media must
support the activity judgement; it cannot become a map-first or cinematic
homepage dependency.

## Component and state contract

Shared primitives to audit or refactor include:

- `PageShell`, `PublicRouteLayout`, `TopNav`, `SiteFooter`, `BrandMark`
- `Button`, `LinkAction`, `Icon`, `Kicker`, `SectionHeading`, `EditorialRule`
- `PhraseComposer`, `ChoiceRail`, `OptionSheet`, `Modal`
- `ActivityResultCard`, `ActivityDayTray`, `FactRail`, `CollectionCover`
- `EmptyState`, `Skeleton`, `Toast`, `StatusRegion`, `BackToTop`
- `ImageFrame`, `EditorialFigure`, `MapPanel`, `MapListFallback`

Every interactive primitive defines default, hover, focus, pressed/selected,
disabled, loading, success, error, empty, keyboard, touch, and reduced-motion
behavior. No essential content is hidden behind hover.

## Interaction and state model

The existing activity-first contract remains:

- The activity situation is the source of the result set.
- Only reviewed activities render publicly.
- Saving adds an explicit activity ID to an ordered day.
- Remove and reorder are reversible, explicit operations.
- `/planner` consumes selected activity IDs when present.
- Direct `/planner` remains supported but is clearly secondary.
- Anonymous state remains editable until the user chooses to save or claim it.
- No selection silently disappears between explorer, workspace, planner, sign-in,
  or a claimed trip.

### Base UI behavior checkpoints — 2026-07-13

`NavigationSheet`, the controlled `OptionSheet`, and the utility `SideSheet`
now use Base UI underneath Rumia-owned wrappers. The choice sheet is used by
planner and trip-new to keep
place, time, transport, pace, and interest decisions in a mobile bottom sheet
and desktop centered dialog with the same linen/editorial treatment. The
wrapper owns the controlled-trigger focus handoff, while Base UI owns dialog
semantics, inert background, focus containment, portal mounting, and Escape or
backdrop dismissal. Focused behavior tests and fresh 390px/1440px browser
smoke are required evidence. The authenticated itineraries export drawer now
uses the right-anchored `SideSheet` wrapper. Activity save/replace remains a
direct reversible action in the one-day MVP and should only become a sheet
when a real multi-day or replacement-choice workflow exists.

Feedback behavior:

- Save uses a short title-to-tray cue and an accessible status announcement.
- Remove is reversible and confirms what changed.
- Replace preserves time and preference context where possible.
- Conflicts explain practical consequences in text.
- Loading states communicate real work without theatrical delay.
- Errors provide a clear recovery action.
- Reduced-motion mode updates state immediately without camera movement,
  card-flight animation, or reveal sequences.

## Progressive spatial experience

Spatial work is downstream of the first-slice contract:

### Phase 1 — practical 2D activity map

The selected activity list remains complete and authoritative. The map shows
locations, proximity, and a route/list equivalent. Users can act without moving
the map.

### Phase 2 — itinerary camera storytelling

An explicit “Explore your plan” mode may move through stops in order. Morning,
afternoon, and evening chapters can use distinct camera stops. Motion is
interruptible, optional, and replaced by a static sequence under reduced motion.

### Phase 3 — richer Portugal exploration

Terrain, building extrusions, and broader Portugal context may be added only
after the chosen-day journey is stable and performance evidence supports it.
Mobile may remain 2D/list-first permanently.

Map attribution, tile/data licences, fallback, keyboard alternatives, and
reduced-motion behavior are release requirements. The homepage remains map-free
from the critical path.

## Full roadmap phases

### Phase A — audit and design contract

Inventory route surfaces and shared components, reconcile current browser
findings, define tokens, and establish visual evidence before edits.

### Phase B — shared system and shell

Implement token-backed primitives, navigation/footer consistency, icon paths,
focus behavior, and semantic surface variants.

### Phase C — public editorial surfaces

Align `/`, `/portugal`, `/explore`, `/activities/[id]`, and `/how-it-works` to
the editorial grammar while preserving the activity-first conversion path.

### Phase D — chosen-day continuity

Align `/explore/workspace`, `/planner`, `/trip/new`, and saved-day surfaces so
the selected activity set and practical consequences remain authoritative.

### Phase E — motion and feedback

Add short save/remove/replace/status transitions, accessible announcements,
and reduced-motion alternatives.

### Phase F — progressive spatial capability

Add the practical 2D map, then explicit itinerary storytelling, then optional
3D destination exploration.

### Phase G — utility and operator consistency

Bring support, legal, auth, reviewer, console, and admin surfaces into the
same hierarchy while keeping dense operator surfaces task-oriented.

### Phase H — verification and release baselines

Run responsive, keyboard, axe, performance, build, smoke, and visual checks.
Review screenshot changes route-by-route and record evidence rather than
refreshing snapshots automatically.

## First-slice design

The immediately executable plan covers six independently testable deliverables:

1. **Design tokens and primitive inventory:** establish the type, spacing,
   surface, rule, icon, and state contracts without changing product behavior.
2. **Shared shell:** align navigation, footer, page shell, focus rings, and
   icon rendering; preserve the current footer five-column correction.
3. **Planner continuity:** rename and restructure the direct planner chapter to
   “Shape a day,” consume selected activities, and retain a truthful direct-entry
   path.
4. **Workspace states:** make empty, loading, error, selected, conflict, and
   saved states useful on desktop and mobile.
5. **Feedback and motion:** add reversible, announced, reduced-motion-safe
   save/remove/replace feedback.
6. **Verification:** run typecheck, lint, build, focused tests, axe, responsive
   checks, and reviewed visual baselines.

The first slice does not include MapLibre 3D, a new content corpus, new
database migrations, or a homepage hero experiment.

## Acceptance criteria

The design is successfully implemented when:

- `/planner` reads as “Shape a day,” not an independent itinerary generator.
- Selected activities survive explorer → workspace → planner.
- Workspace has useful empty, loading, selected, conflict, error, and saved
  states.
- Shared shell, icons, footer, cards, trays, and status regions use the same
  token-backed visual grammar.
- No document-level horizontal overflow exists at 390px.
- Keyboard focus is visible and all essential actions are reachable without a
  pointer or hover.
- Reduced-motion mode removes nonessential movement and automatic camera work.
- Meaningful content remains usable when images, map tiles, or WebGL fail.
- WCAG 2.2 AA checks, typecheck, lint, build, smoke, and focused visual checks
  pass.
- Visual baselines are reviewed route-by-route; stale height drift is not
  silently accepted as a product regression or hidden by a blanket refresh.

## Performance and accessibility requirements

- Practical primary touch targets are 44px; constrained inline controls remain
  keyboard and screen-reader reachable.
- LCP target is ≤ 2.5s, INP ≤ 200ms, and CLS ≤ 0.1 at the 75th percentile.
- Images reserve dimensions and use intentional loading behavior.
- WebGL/map code is not part of the homepage critical path.
- `prefers-reduced-motion: reduce` is honored for transitions, reveals, and
  camera movement.
- Essential meaning is never conveyed by color, hover, motion, or image alone.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Polish becomes decoration | Require every visual treatment to clarify a decision, consequence, or source. |
| Legacy planner semantics remain | Make selected activity IDs the explicit planner input and test direct entry separately. |
| Snapshot drift hides regressions | Review each baseline with route and viewport evidence before updating. |
| 3D harms mobile performance | Lazy-load, feature-flag, measure, and retain a list/2D fallback. |
| Images become a licensing liability | Require provenance, licence, alt text, and refresh metadata before publication. |
| Map/tile licence blocks release | Treat attribution, provider terms, and fallback as release gates. |
| Operator UI becomes ornamental | Keep dense surfaces compact, keyboard-safe, and task-oriented. |

## References

- [Awwwards storytelling collection](https://www.awwwards.com/websites/storytelling/)
- [Awwwards fullscreen inspiration](https://www.awwwards.com/websites/fullscreen/?from=gyagbbb3&mobile=1&page=79)
- [Awwwards fullscreen video guidance](https://www.awwwards.com/20-websites-with-fullscreen-video.html)
- [Awwwards When to Travel](https://www.awwwards.com/sites/when-to-travel)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
- [MDN video element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video)
- [web.dev responsive images](https://web.dev/learn/design/responsive-images?hl=en)
- [web.dev video performance](https://web.dev/learn/performance/video-performance)
- [web.dev Core Web Vitals](https://web.dev/articles/vitals)
- [MapLibre GL JS documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre style layers and extrusion](https://maplibre.org/maplibre-style-spec/layers/)
- [MapLibre terrain specification](https://maplibre.org/maplibre-style-spec/terrain/)
