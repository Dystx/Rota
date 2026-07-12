# Choice-led traveler experience design

## Purpose

Transform Rumia's traveler experience from a conventional travel-planning
form flow into a cinematic, selection-led journey. A traveler composes a
Portugal itinerary by seeing options, understanding their route consequence,
and making a choice; no traveler route presents a long form as its primary
interaction.

## Scope and sequencing

This specification is the first program in the full-app redesign. It covers
public discovery and the complete traveler lifecycle. Operator routes,
specialist onboarding, B2B, and production-provider activation follow as
separate programs so the traveler journey can ship as a coherent vertical
slice.

| Release | Outcome |
| --- | --- |
| 0 | Shared interaction primitives, motion rules, route audit baselines, and public/traveler navigation contract. |
| 1 | Public discovery: `/`, `/portugal`, `/explore`, `/explore/workspace`, `/how-it-works`, `/pricing`, `/human-review`, and support utilities. |
| 2 | Planning: `/planner`, `/trip/new`, and `/logistics?trip=`. |
| 3 | Trip lifecycle: `/trip/[tripId]`, map, checkout, export, itineraries, vault, account, and feature-gated expert chat. |

## Interaction model

### Invariants

- Traveler decisions use cards, chips, map taps, tabs, segmented controls, or
  focused option sheets.
- A text input is allowed only for authentication, Stripe-hosted payment,
  support contact, or optional free-form trip context inside a collapsed
  refinement surface.
- Every choice has a visible selected state and communicates a route outcome
  before or immediately after selection.
- The app keeps one primary action visible per screen or decision sheet.
- Keyboard, touch, and pointer input produce equivalent outcomes.

### Shared units

| Unit | Responsibility | Behaviour |
| --- | --- | --- |
| `TripContextBar` | Displays the current destination, duration, pace, transport, and trip state. | Each value opens the corresponding option sheet; it is sticky on mobile after the first selection. |
| `ChoiceCard` | Represents one high-impact exclusive option. | Shows title, consequence, selected state, and keyboard radio semantics. |
| `ChoiceChipGroup` | Represents multi-select refinements. | Supports toggle buttons with `aria-pressed`; changes update the draft immediately. |
| `OptionSheet` | Isolates one decision on mobile or desktop. | Bottom sheet on mobile and modal/popover on desktop; focus is trapped and restored. |
| `RouteConsequence` | Explains the current route impact. | Updates from deterministic routing data: stop count, drive time, required transport, warnings, and unlock/review status. |
| `TripSummary` | Persists chosen state between planning routes. | Is created from the existing trip brief contract and survives route navigation. |

### State and data flow

1. The public hero seeds `TripSummary` with a destination, duration, and travel
   style selected from visible options.
2. `/planner` owns the editable draft and derives a valid existing `TripBrief`
   using the deterministic normalizer; no new persistence schema is introduced
   for the visual redesign.
3. `RouteConsequence` reads the draft and the current routing/AI result. It
   never claims a route is recalculated until the server result returns.
4. `/trip/new` is an exception-only confirmation surface. It asks only for
   missing or invalid required fields and places optional preferences in
   `Refine this plan`.
5. On save, the existing trip API persists the validated brief. The trip,
   map, logistics, checkout, export, archive, and account routes read that
   persisted trip state rather than passing untrusted query values.

## Visual system

### Composition

- Use the existing olive, ochre, linen, Playfair Display, Inter, and
  JetBrains Mono tokens.
- Treat the map and itinerary as one compositional object: a selected route
  choice changes map emphasis, route summary, and day/stop focus together.
- Preserve quiet paper-like surfaces for dense content; reserve dark map or
  olive surfaces for route focus, payment, and unlock moments.
- Use full-bleed imagery only as an entry point or context layer. Content and
  controls always sit on contrast-safe surfaces.

### Advanced motion

- Use shared-element transitions only for destination card → planner context,
  planner summary → trip hero, trip stop → map focus, and trip → export.
- Use a capability check and static fallback for view transitions.
- Use CSS scroll-driven reveal only for public storytelling sections; route
  planning never depends on scroll animation to expose or operate controls.
- Use short selection feedback: ochre edge-light, one map-pin pulse, and a
  route-line redraw after a confirmed change.
- Under `prefers-reduced-motion`, replace transforms, parallax, line drawing,
  and view transitions with immediate state changes or an opacity change only.

## Route behaviour and page visuals

| Route group | Required visual/UX behaviour |
| --- | --- |
| `/` | Globe plus three high-confidence starters: destination, duration, and style. The primary action is `Build my route`; destination bento cards are secondary shortcuts. |
| `/portugal`, `/explore`, `/explore/workspace` | A single destination-atlas system: visual region cards and map pins feed the same trip draft; map layers and day previews use chips/tabs. |
| `/how-it-works`, `/pricing`, `/human-review` | Explain one ascension model: free preview → itinerary unlock → expert polish. Plan cards own selection; no detached conversion forms. |
| `/planner` | A trip-composition canvas: map/context panel, choice rail for place/rhythm/movement/interests, live consequence panel, and one build action. |
| `/trip/new` | Summary rows open focused option sheets. The route asks only for absent requirements; food, access needs, accommodation, and free text remain inside `Refine this plan`. |
| `/logistics?trip=` | A trip-scoped mobility scene. Transport cards show travel-time and destination-access consequences before selection. |
| `/trip/[tripId]` | Lead with today's plan and one next action, then route overview, day tabs, stop cards, detailed agenda, and unlock/review state. |
| `/trip/[tripId]/map` | Map-first, with equivalent accessible stop list, day tabs, transport/layer chips, and direct stop-to-agenda synchronization. |
| `/checkout`, `/trip/[tripId]/export` | Package/format cards with availability states. Stripe handles payment input; export state shows queued, ready, failed, and retry actions. |
| `/itineraries`, `/vault`, `/account` | Card archives with status/filter chips and choice-driven actions; no hardcoded demo trips or text-search-first interaction. |
| `/expert-chat` | Remains feature-gated until trip-scoped messaging exists. No demo conversation appears in any enabled public state. |
| `/support`, `/offline`, legal routes | Utility pages retain the shared public shell; support is topic-card/accordion led and offline explains cached-trip recovery. |

## Failure states

- A route consequence panel renders a stable `Updating your route` state only
  while a server request is active, then either shows the result or a retry
  card that retains the last valid selection.
- Unavailable map/WebGL renders the existing static schematic with the same
  stop information and controls.
- Invalid/missing trip routes redirect to the archive or show an owned error
  state; they never show placeholder itinerary data.
- Disabled beta/integration capabilities render truthful availability copy and
  an actionable return link.

## Acceptance criteria

- A traveler can create, revise, unlock, and export a Portugal trip without
  encountering a traditional form as the dominant interaction.
- Every high-impact choice has selection, consequence, keyboard, touch,
  reduced-motion, loading, error, and rollback behaviour.
- Mobile shows one focused choice or stop at a time; document-level horizontal
  overflow is zero.
- Every traveler route has desktop 1440px and mobile 390px visual coverage,
  one visible `h1`, one `main`, and no serious or critical accessibility
  violations.
- View and scroll transitions enhance only supported, no-preference motion
  environments; the static experience is complete and equivalent.
