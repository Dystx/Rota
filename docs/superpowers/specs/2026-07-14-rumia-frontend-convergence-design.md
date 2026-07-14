# Rumia Frontend Convergence Design

**Status:** Approved architecture; written specification awaiting owner review

**Date:** 2026-07-14
**Supersedes for frontend execution:** the completed-state interpretation of the
2026-07-14 polish checkpoint. Earlier frontend plans remain implementation
history and evidence, not authority for unfinished visual work.

## Purpose

Rumia needs one complete frontend convergence program rather than another set
of isolated styling patches. The product already has a strong cinematic and
editorial direction on its best routes, but that quality is uneven. Core
activity decisions, quiet public pages, saved-day tools, authentication, beta
surfaces, legal pages, and operator interfaces must feel like parts of the same
product without being forced into one generic page template.

This design uses a token-first system followed by vertically reviewable route
batches. Existing behavior, data contracts, URL state, authentication,
accessibility, and the activity-first product model remain authoritative while
the presentation and interaction layers converge.

## Product contract

Rumia helps a traveller who already knows where they will be decide what is
genuinely worth doing with limited time.

The frontend must preserve these boundaries:

- Portugal-wide coverage; no Porto-only product framing.
- Activities and time windows are primary; itineraries are secondary saved-day
  structures.
- Editorial judgement is visible; AI remains in the background.
- No chatbot interface.
- No accommodation or destination search product.
- No direct booking or travel-agency positioning.
- No paid ranking disguised as editorial judgement.
- Maps explain selected activities; they do not replace recommendation cards.
- Human review is optional context after a chosen day exists, not concierge
  planning.

## Current baseline

The Playwright review performed on 2026-07-14 against
`http://127.0.0.1:3311/` covered 26 routes at desktop and mobile widths plus
key interaction states.

The baseline already demonstrates:

- a strong cinematic homepage and Portugal atlas;
- a coherent serif, sans, and monospace typography family;
- working save, remove, undo, share, workspace, navigation, focus, and
  reduced-motion behavior;
- no horizontal overflow at 390 pixels across the reviewed route set;
- visible focus treatment and a functional skip link;
- local, provenance-backed imagery and visible attribution.

The same baseline exposes unfinished work:

- the planner remains trip-first and its continuation state can remain stuck;
- short and quiet routes reuse the same pale field too heavily;
- footer composition dominates short pages, especially on mobile;
- secondary routes retain legacy itinerary and AI-tier language;
- sign-in duplicates failure feedback;
- Sustainability has a desktop title collision;
- route identity, feedback hierarchy, and visual density vary substantially;
- beta, API, commerce, and operator surfaces do not fully share the public
  product's visual grammar.

## Chosen strategy

### Token-first convergence with vertical route batches

The work begins by defining a stable visual and interaction grammar. Route
batches then apply that grammar in complete user-facing slices. A batch is not
accepted because shared CSS exists; it is accepted only when its routes,
states, responsive behavior, accessibility, motion, and visual evidence are
complete together.

This avoids two rejected approaches:

1. **Route-by-route patching:** fast locally, but preserves drift and duplicate
   patterns.
2. **Full rewrite:** visually flexible, but risks functional regressions and
   discards working URL, auth, persistence, accessibility, and testing work.

## Experience principles

### Judgement before spectacle

Every composition must clarify what is worth doing, why it fits, its practical
cost, or the next decision. Media, texture, maps, and motion are supporting
layers.

### One dominant decision

Every viewport has one primary action. Secondary links remain visually and
spatially subordinate. Two adjacent actions may not resolve to the same route
or produce the same outcome.

### Designed quietness

Quiet routes may be calm, but cannot look unfinished. A short page still needs
an authored opening, a purposeful information structure, and a deliberate
closing action.

### Distinct routes, shared grammar

Pages use different compositions but the same typography, spacing, surface,
control, feedback, and motion tokens. Route identity must not depend only on
copy or a heading.

### Progressive depth

The interface starts with the decision needed now. Evidence, alternatives,
editing controls, maps, and operational detail appear when relevant instead of
competing on first view.

## Design-system architecture

### Typography

Define named responsive roles for:

- cinematic display;
- page display;
- section heading;
- verdict and editorial pull quote;
- lead and supporting prose;
- body and compact body;
- label and action text;
- metadata and provenance.

Requirements:

- Body text keeps a comfortable 45–75 character measure.
- Mobile display text scales before it creates awkward two-word lines.
- Metadata remains readable at 200 percent zoom.
- Uppercase and tracked labels use sufficient size, weight, and contrast.
- Font loading cannot hide essential text.
- Heading levels follow document structure rather than visual size.

### Spacing, padding, and layout

Use the existing 4/8 base rhythm and semantic route gaps of 48, 64, 96, and
128 pixels. Named container roles are:

- `reading` for long-form prose;
- `content` for forms and decision flows;
- `dossier` for evidence and practical facts;
- `wide` for editorial collections;
- `wide-media` for cinematic and map chapters.

Requirements:

- Content height determines section size; arbitrary page-filling min-heights
  are removed unless required for a purposeful first viewport.
- Card padding, heading gaps, and control spacing use shared tokens.
- Mobile content reaches its final action before the footer becomes the
  dominant visual object.
- Grids collapse without changing reading order.
- Sticky elements never cover headings, controls, toasts, or focused content.

### Colour and contrast

The olive, ochre, linen, sage, and paper palette remains the brand foundation.
It is expressed through semantic roles rather than route-specific raw values:

- background and subdued background;
- dossier and elevated dossier;
- judgement and judgement-muted;
- media overlay and media caption;
- positive, caution, destructive, and informational feedback;
- operator canvas and operator panel;
- border, strong border, focus, and selected state.

Requirements:

- Normal text, controls, links, and focus indicators meet WCAG 2.2 AA contrast.
- Disabled state remains legible without appearing actionable.
- Selection, error, success, hover, focus, and over-media states are specified.
- Colour is never the only signal for status, selection, or validation.

### Backgrounds, surfaces, and depth

Use four composition roles:

1. **Place:** media-led orientation and atmosphere.
2. **Judgement:** high-contrast verdict, caveat, or decision surface.
3. **Dossier:** paper-like evidence and practical facts.
4. **Utility:** restrained form, account, legal, and operational surface.

The contour motif is supporting texture, not the universal page background.
No route may run from header to footer as one undifferentiated mint, sage, or
linen field.

Depth uses one border family and one shadow family. Blur, glass, shadow,
gradient, and border cannot all be stacked on one component without a specific
readability or hierarchy reason.

### Icons, graphics, and media

- Use the existing shared icon system; literal text symbols are not UI icons.
- Decorative marks are hidden from assistive technology.
- Functional icons always have an accessible name through their control.
- Photographs, video, illustration, captions, credits, focal points, posters,
  and fallbacks use one media contract.
- All production media is local and provenance-backed; no hotlinks.
- Media is added only where it improves orientation, atmosphere, comparison,
  or judgement.

## Shared shell

### Navigation

- Desktop navigation has a visible current-route state.
- Mobile navigation uses one close control, traps focus, closes with Escape,
  and returns focus to the trigger.
- The primary Explore action stays visually dominant.
- Navigation height and contrast remain stable across media and quiet routes.

### Footer

Create full and compact compositions from the same link data.

- The full footer is used on major discovery and long-form editorial routes.
- The compact footer is the default on mobile and on short utility surfaces.
- All Portugal, Product, Help, and Legal destinations remain reachable.
- Mobile footer height is targeted at no more than 440 pixels.
- Desktop footer height is targeted at no more than 320 pixels.
- Brand copy is shortened in compact mode; navigation landmarks remain named.
- The footer does not repeat an immediately preceding call to action.

### Overlays and feedback chrome

- Toasts do not duplicate inline errors or obscure primary controls.
- Sheets and dialogs have one title, one close action, clear focus ownership,
  and predictable responsive placement.
- Loading and transition feedback uses shared status and live-region patterns.

## Route design matrix

### Public acquisition

#### Homepage

- Preserve the cinematic place opening.
- Establish one headline, one explanation, and one primary intent action.
- Subordinate the field note and metadata rail.
- Maintain a clear transition from media into the editorial decision chapter.
- Keep media autoplay decorative, muted, pausable by preference, and absent for
  reduced motion or data-saving conditions.

#### Portugal

- Preserve the atlas identity and Portugal-wide scope.
- Vary card size, density, and chapter rhythm to avoid a repeated dark slab.
- Use place media as a transition between orientation and activity decisions.
- End with a clear Explore decision.

#### Explore

- Make the current time, place, mood, and company legible without dominating
  the results.
- Give selected filters a visibly distinct state.
- Support multiple result densities, not a visually empty one-card product.
- Make save, remove, compare, and empty-result consequences explicit.

#### Activity detail

- Keep verdict, suitability, time, effort, cost, caveat, and nearby pairing
  visible in a scannable hierarchy.
- Preserve the alternative comparison chapter.
- Maintain clear continuity into the chosen-day workspace.

#### How It Works

- Use an annotated decision sequence rather than four equal generic cards.
- Keep the final judgement panel close to the sequence.
- Explain optional specialist review without making it a primary step.

#### Pricing

- Use a compact free-first comparison ledger.
- Visually distinguish included, optional, and unavailable/future states.
- State delivery, limitations, and action without presenting booking.

#### Local Expertise

- Use an editorial split followed by evidence and boundary sections.
- Make pace, transfers, seasonality, pairing, and exclusions scannable.
- Keep the next action subordinate to exploring activities.

#### Feedback

- Use selected-day context when available.
- The empty state contains one concise explanation and one Explore action.
- Success, validation, submission, and failure feedback remain visible without
  duplicate toasts.

#### Support

- Group tasks by choosing, shaping, access, account, and recovery.
- Avoid a long grid of equally prominent cards.
- Separate emergency/on-trip boundaries from routine product help.

### Core activity-day and traveller tools

#### Chosen-day workspace

- One saved-day summary and one next action.
- Save, remove, undo, reorder, share, and feedback states remain reversible and
  announced.
- Empty state has one primary recovery route.
- List remains primary when the optional map is present.

#### Planner

- Replace destination/trip-length framing with activity situation and usable
  day/time windows.
- Remove 3, 5, 7, and 14-day trip defaults from the activity-day path.
- Consolidate duplicate summaries and ghosted inactive controls.
- The continuation state must complete, fail with recovery, or remain
  actionable; it may not stay indefinitely disabled.

#### Trip editor and saved plans

- Reframe `/trip/new` as a secondary saved-day editor rather than the primary
  acquisition flow.
- Group related fields and progressively disclose secondary editing.
- Remove obsolete itinerary language from Vault, Itineraries, exports, and
  empty states.

#### Account

- Use utility surfaces with clear navigation, session, saved-day, and account
  status hierarchy.
- Auth and persistence failures receive specific recovery actions.

### Authentication, legal, and recovery

#### Sign-in

- Retain the daybook character while using persistent labels and explicit
  controls.
- Show one failure message in the most useful location.
- Keep trust copy compact on mobile.
- Loading, success, redirect, invalid credentials, and unavailable database
  states are designed and announced.

#### Privacy, Terms, and Sustainability

- Use the shared document frame and readable measure.
- Fix heading/content collisions at all supported widths and zoom levels.
- Keep legal and promise pages calm without making them visually empty.

#### Offline, error, loading, and not-found

- Provide one diagnosis, one primary recovery action, and a secondary escape
  only when it resolves a different need.
- Preserve the shared shell when safe.
- Never expose provider, redirect, database, or stack internals.

### Secondary, beta, commercial, and developer surfaces

#### Guide, onboarding, Expert Chat, and B2B

- Clearly mark private beta or unavailable capability.
- Do not imply chatbot, concierge, booking, or public availability.
- Provide one next step and prevent dead-end decorative pages.

#### Checkout

- Remove `Core AI`, `Hybrid Specialist`, and trip-first sales framing.
- Present only real chosen-day products returned by the commerce contract.
- Distinguish included, optional, unavailable, success, cancel, and failure
  states.

#### API documentation

- Use an intentional developer-document frame with readable code, table, and
  authentication examples.
- Fix duplicated metadata suffixes.
- Keep paused or unavailable endpoints explicitly labelled.
- Do not expose real credentials, internal service addresses, or private
  operational detail.

### Operator surfaces

#### Console, reviewer, and admin

- Use a dense utility grammar rather than marketing spectacle.
- Standardize navigation, panel, lane, filter, status, count, search, empty,
  loading, and error states.
- Preserve keyboard scan order and provide mobile lane-navigation cues.
- Verify that public demo surfaces and protected operational surfaces are
  intentionally separated.
- Seeded authenticated reviewer and administrator sessions are required for
  final visual acceptance.

## Existing route ownership matrix

Every current page route belongs to an explicit frontend batch. Redirect-only
routes are verified for destination, metadata, and transition behavior rather
than receiving a second visual implementation.

| Batch | Current routes and patterns | Required treatment |
| --- | --- | --- |
| Acquisition | `/`, `/portugal`, `/explore`, `/activities/[activityId]` | Cinematic orientation, editorial judgement, activity selection, and one clear next decision. |
| Chosen day | `/explore/workspace`, `/planner`, `/plan`, `/logistics` | Saved-activity continuity, activity-day scope, route-safe redirect behavior, and practical context. |
| Saved traveler work | `/trip/new`, `/trip/[tripId]`, `/trip/[tripId]/export`, `/trip/[tripId]/map`, `/account`, `/vault`, `/itineraries` | Secondary saved-day editing, account/session hierarchy, export/map fallback, and authored empty/error states. |
| Public explanation | `/how-it-works`, `/pricing`, `/local-expertise`, `/human-review`, `/feedback`, `/support` | Purpose-specific compositions, honest product boundaries, optional review framing, and compact completion paths. |
| Legal and recovery | `/privacy`, `/terms`, `/sustainability`, `/offline`, `/sign-in`, root loading/error/not-found surfaces | Shared document or recovery grammar, readable hierarchy, one recovery action, and safe failure copy. |
| Beta and partner | `/guide`, `/guide/onboarding`, `/expert-chat`, `/b2b`, `/b2b/[orgSlug]` | Explicit availability, no dead-end spectacle, truthful beta boundaries, and one next step. |
| Commerce and developer | `/checkout`, `/api/v1/docs` | Real commerce-state rendering, activity-first language, developer-document styling, safe code examples, and failure/cancel states. |
| Console | `/console`, `/console/pipeline`, `/console/workspace`, `/console/messages`, `/console/graph`, `/console/metrics`, `/console/config` | Dense operator shell, responsive navigation, filters, counts, status, task feedback, and intended public/protected boundary. |
| Reviewer | `/reviewer/queue`, `/reviewer/history`, `/reviewer/operations`, `/reviewer/profile`, `/reviewer/trips/[tripId]` | Authenticated task flow, evidence hierarchy, keyboard operation, queue/history states, and mobile proof. |
| Administration | `/admin/analytics`, `/admin/countries`, `/admin/partners`, `/admin/places`, `/admin/quality`, `/admin/regions`, `/admin/reviewers`, `/admin/specialists` | Authenticated data-management grammar, table/form states, permissions, loading/error/empty states, and responsive proof. |

## Motion and interaction feedback

### Timing model

- Control response: 160–220 milliseconds.
- Sheet, dialog, and contextual panel: 220–320 milliseconds.
- Page and chapter continuity: 300–450 milliseconds.
- No decorative infinite animation outside explicitly approved ambient media.

### Required feedback states

Every relevant interactive component defines:

- default;
- hover;
- focus-visible;
- pressed;
- selected;
- loading;
- success;
- warning;
- error;
- disabled;
- unavailable;
- empty;
- reduced-motion behavior.

Save, remove, reorder, replace, share, submit, retry, and navigation actions
must visibly confirm their result. Feedback is not duplicated simultaneously
in a toast and inline region unless the two messages convey different scopes.

### Reduced motion and data

- Reduced motion disables autoplay, smooth scrolling, camera tours, parallax,
  and non-essential entrance motion.
- Essential state changes remain immediate and understandable.
- Reduced-data conditions use posters and static map/list fallbacks.
- Information is never hidden until an animation finishes.

## Responsive requirements

Primary acceptance viewports are:

- 1440 × 1000;
- 1024 × 768;
- 768 × 1024;
- 390 × 844.

Additional safeguards:

- no horizontal overflow from 320 pixels upward;
- 44-pixel minimum interactive targets;
- content remains usable at 200 percent browser zoom;
- safe-area insets are respected;
- orientation changes do not lose state;
- map, media, tables, filters, and operator lanes provide explicit narrow-screen
  alternatives;
- desktop visual order and mobile reading order remain semantically aligned.

## Accessibility requirements

- Target WCAG 2.2 AA.
- Each route has one `main` landmark and one descriptive `h1`.
- Heading order, lists, forms, tables, and navigation landmarks are semantic.
- Focus is visible, never trapped accidentally, and restored after dialogs.
- Status and errors are associated with their controls and announced once.
- Drag/reorder behavior has keyboard and non-drag alternatives.
- Media includes appropriate text alternatives; decorative media is ignored by
  assistive technology.
- Map information has a complete list equivalent.
- Colour, motion, hover, and spatial position are not sole information carriers.

## Performance requirements

- Largest Contentful Paint below 2.5 seconds on the agreed review profile.
- Cumulative Layout Shift below 0.1.
- Interaction to Next Paint is monitored and must not regress from the accepted
  baseline.
- Routes without cinematic media do not download cinematic media.
- Video uses an approved poster, constrained preload, pause-offscreen behavior,
  and preference fallback.
- Images use correct responsive sizes and avoid unnecessary original-resolution
  downloads.
- Maps and 3D load only after explicit intent or on their dedicated surface.
- Route-level JavaScript growth is measured during each phase.

## Map and 3D capability

### Phase 1: practical activity map

- First surface: chosen-day workspace.
- Selecting an activity synchronizes card and marker state.
- Top-down 2D view is the default practical map.
- List remains complete when the map fails or is disabled.
- Attribution is always visible.

### Phase 2: itinerary camera transitions

- User-initiated Explore Your Day mode.
- Camera stops follow itinerary order.
- Morning, afternoon, and evening may use distinct stops.
- User can pause, skip, exit, or return to top-down view.
- Reduced motion replaces transitions with immediate camera changes.

### Phase 3: richer destination exploration

- 3D buildings and terrain appear only where data, licensing, performance, and
  comprehension justify them.
- No decorative homepage dependency.
- No automatic tour on initial page load.
- Shared-plan previews preserve a static and 2D fallback.

Provider, tile, route, glyph, sprite, terrain, data, quota, attribution, and
privacy decisions remain hard gates before Phase 2 or Phase 3 enablement.

## Component boundaries

The implementation plan should prefer existing components and introduce a new
shared primitive only after at least two route implementations prove the same
interface.

Expected shared responsibilities include:

- semantic typography and spacing tokens;
- `SiteFooter` full and compact compositions;
- chapter heading and chapter band;
- judgement panel;
- dossier/evidence group;
- editorial action group;
- feedback/status region;
- media frame and attribution;
- responsive overlay/sheet;
- activity-map client boundary and semantic fallback.

Route components retain their own information architecture. Shared primitives
must not force Home, Pricing, Legal, and Console into the same composition.

## State and data boundaries

- Existing server/client component boundaries remain unless a specific
  interaction requires change.
- URL-backed activity selection and chosen-day state remain canonical for the
  public flow.
- Visual work does not create a second persistence layer.
- Better Auth, PostgreSQL/Drizzle, commerce, activity content, analytics, and
  routing contracts remain owned by their existing packages.
- A visual fallback cannot fabricate saved, paid, reviewed, routed, available,
  or authenticated state.

## Implementation phases

### Phase 0: truth and baseline

Reconcile the plan index, supersession status, route/state matrix, dirty-tree
ownership, exact artifact, viewport set, and current screenshots. Create a
reviewable visual-contract surface for tokens and component states.

### Phase 1: foundations

Converge typography, spacing, layout widths, colours, borders, shadows,
background roles, focus, and interaction-state tokens. Do not redesign routes
before the shared contract is visible and testable.

### Phase 2: shell and global feedback

Converge navigation, mobile sheet, full/compact footer, overlays, toast/status
placement, page entry, loading shell, and route transition behavior.

### Phase 3: acquisition

Complete Homepage and Portugal as the strongest public art-direction pair,
including responsive media, chapter transitions, and final Explore decisions.

### Phase 4: activity decisions

Complete Explore, activity detail, chosen-day workspace, feedback continuity,
and the optional Phase 1 list-first map boundary.

### Phase 5: planning and saved work

Correct the planner's activity-day scope and transition state. Converge
`/trip/new`, account, vault, itineraries, export, and saved-day empty/error
states.

### Phase 6: quiet public, auth, legal, and recovery

Complete How It Works, Pricing, Local Expertise, Feedback, Support, Sign-in,
Privacy, Terms, Sustainability, Offline, loading, error, and not-found
surfaces.

### Phase 7: secondary, beta, commerce, and developer

Complete Guide, onboarding, Expert Chat, B2B, Checkout, API documentation, and
their unavailable, gated, success, cancel, and failure states.

### Phase 8: operator

Complete Console, Reviewer, and Admin systems at desktop and mobile with seeded
authenticated proof.

### Phase 9: motion and cross-route continuity

Apply the timing model, shared-element continuity where reliable, feedback
transitions, offscreen pausing, reduced-motion behavior, and performance
budgets across accepted route compositions.

### Phase 10: map storytelling and 3D

After the activity-day journey, provider, licensing, accessibility, and
performance gates are stable, implement Phase 2 camera storytelling and then
evaluate Phase 3 destination depth.

### Phase 11: final acceptance

Run the complete route/state/viewport matrix, accessibility, visual,
performance, unit, typecheck, lint, build, asset, motion, and licensing gates.
Completion requires explicit owner visual approval on the exact artifact.

## Verification model

Every implementation phase includes:

1. a failing behavior or contract test before behavior changes;
2. focused unit and component tests;
3. responsive Playwright evidence at the primary viewport set;
4. keyboard and accessibility checks;
5. reduced-motion verification where motion or media changes;
6. route-specific visual snapshots;
7. typecheck and lint;
8. production build and relevant performance/asset gates;
9. explicit comparison against the phase acceptance criteria.

The final gate also includes the full route matrix for signed-out, traveler,
reviewer, administrator, empty, loading, error, unavailable, unauthorized, and
success states where those states exist.

## Global acceptance criteria

The frontend convergence is complete only when:

- every existing route is accounted for as public, traveler, auth/legal,
  secondary/beta, commerce/developer, operator, fallback, or intentionally
  redirected;
- every reviewed route has a recognizable composition and one dominant action;
- no route relies on one flat background field;
- typography, spacing, colour, surface, depth, and control states use named
  tokens;
- no duplicate CTA, trip summary, error, toast, or status competes for the same
  job;
- all loading, empty, error, disabled, unavailable, success, and recovery
  states are designed;
- desktop, tablet, and mobile acceptance matrices have no horizontal overflow,
  collisions, clipped controls, or hidden actions;
- WCAG 2.2 AA, keyboard, zoom, reduced-motion, list-equivalent map, and media
  fallback requirements pass;
- performance and asset budgets pass on the exact production artifact;
- legacy itinerary-first, visible AI-tier, chatbot, booking, and concierge
  language is absent outside explicitly historical documentation;
- automated verification is green;
- the owner explicitly approves the final visual artifact.

## Explicit exclusions

This frontend program does not authorize:

- a backend, database, authentication, or deployment-platform rewrite;
- direct booking, accommodation search, travel-agency operations, or live
  concierge support;
- chatbot functionality;
- fabricated map routes or unsupported availability claims;
- unlicensed source code, imagery, video, fonts, map tiles, geographic data, or
  3D assets;
- public enablement of gated beta, commerce, operator, or map capabilities
  without their existing product, security, licensing, and operational gates;
- destructive cleanup of unrelated dirty worktree changes.

These exclusions constrain behavior and risk. They do not exclude any existing
frontend route from visual, responsive, accessibility, feedback, and state
coverage.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| A global CSS change silently damages many routes | Lock token contracts, change in phases, and run the route/viewport matrix after each shared-system task. |
| Route-specific art direction creates new drift | Reuse semantic tokens and primitives while keeping route composition local. |
| Motion harms comprehension or performance | Use the timing model, intent-triggered motion, reduced-motion/data fallbacks, and performance budgets. |
| Media overwhelms editorial judgement | Require a decision-support purpose for every image, video, map, or 3D chapter. |
| Footer compaction removes important navigation | Keep one shared link source, preserve named navigation landmarks, and test every destination. |
| Beta or checkout pages promise unavailable products | Derive visible states from real feature and commerce contracts and label unavailable states explicitly. |
| Operator redesign weakens density | Use a separate utility grammar and seeded task-based acceptance rather than marketing compositions. |
| Dirty-tree overlap loses current work | Record ownership, use narrow patches, review diffs before each phase, and never reset unrelated files. |
| Green tests are mistaken for visual completion | Require exact-artifact screenshots and explicit owner visual approval. |

## Decision record

The owner selected approach 3 on 2026-07-14: token-first convergence with
vertical route batches. The owner also explicitly expanded the scope to every
frontend route and state, including animation, feedback, typography, spacing,
padding, hierarchy, colour, backgrounds, responsive behavior, accessibility,
performance, media, maps, 3D, secondary routes, and operator surfaces.
