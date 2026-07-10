# Rumia Full Product Rework Design

**Date:** 2026-07-10
**Status:** Proposed for implementation planning
**Product:** Rumia — Intentional Travel Intelligence

## 1. Purpose

Rebuild Rumia as a coherent Portugal-first travel intelligence product rather
than a collection of editorial pages, card grids, technical demos, and loosely
connected workflows.

The reworked product must express one clear thesis:

> Rumia turns a traveler’s intent into a realistic Portugal route, then lets a
> local specialist verify the decisions that benefit from human judgment.

The product should feel emotionally desirable during discovery, calm and
precise during planning, spatial and useful during trip work, and dense and
operational for specialists and administrators.

## 2. Non-negotiable product principles

1. **Portugal first.** Public copy, imagery, sample routes, metrics, specialist
   regions, and map states must be recognizably Portuguese.
2. **Invisible AI.** AI parses intent, proposes routes, detects gaps, explains
   consequences, and recommends refinements. It is not represented as a chat
   persona.
3. **Living language, not forms.** The main planning interaction is a
   choice-first sentence assembled from premade inline phrases. Accepted phrases
   can be activated, typed over, or erased in place. Conventional boxes,
   dropdowns, and long form grids do not appear anywhere in the consumer
   planning path. Free typing is an escape hatch, not the default interaction.
4. **Human expertise is visible.** Local review is expressed through proposed
   changes, verification evidence, named checks, specialist identity, region,
   response expectation, and audit history—not generic trust claims.
5. **Map-first utility.** Geography, travel time, route shape, and pacing must
   visibly react to traveler decisions.
6. **One workflow, one home.** Trips live in one library, human review lives
   inside the trip, and every purchase starts from an owned trip.
7. **Editorial discovery, operational workspaces.** Cinematic treatment creates
   desire; it must not obscure planning or operator tasks.
8. **No fabricated production state.** Demo data is explicitly labelled and
   disabled in production. Provider errors, empty states, and unavailable
   features are truthful.

“No forms” describes the visible consumer interaction model, not removal of
semantic HTML. Native buttons, inputs, labels, and form submission remain under
the prose interface for keyboard, password-manager, validation, and assistive
technology reliability.

## 3. Experience architecture

Rumia uses four coordinated experience modes.

### 3.1 Discover mode

Purpose: inspire a traveler, explain the product, and start a Portugal brief.

- Warm linen field with full-bleed Portugal imagery and spatial overlays.
- Editorial typography and restrained cinematic motion.
- One primary action per section.
- Real route previews, recognizable regions, travel-time context, and concrete
  examples of specialist judgment.

### 3.2 Compose mode

Purpose: turn traveler intent into a structured brief and a feasible route.

- Dark olive focus environment on desktop; warm linen mobile sheet.
- Living sentence plus immediate map response.
- One focused phrase at a time.
- Persistent, compact route consequence—not a duplicate summary card.

### 3.3 Travel workspace mode

Purpose: inspect, refine, unlock, review, and use a trip.

- Full-height spatial canvas with a reachable timeline/list equivalent.
- Compact top context capsule and one sticky next action.
- No marketing footer or multi-screen scroll story.
- Desktop split workspace; mobile on-trip modes.

### 3.4 Operator mode

Purpose: complete reviewer, content, and operational work efficiently.

- Dense Inter-led hierarchy with Playfair reserved for page identity.
- Role-aware sidebar, command header, status strip, and responsive task modes.
- No marketing chrome, fake production values, or decorative empty space.

## 4. Brand and visual system

### 4.1 Palette

- **Warm Linen `#F7F4F0`:** primary page field and paper surfaces.
- **Deep Midnight Olive `#2B3E34`:** maps, focus environments, navigation,
  operator chrome, and high-emphasis text.
- **Terracotta Ochre `#E3A857`:** active phrases, route changes, verification,
  progress, and primary decisions.
- **Fog Sage:** low-emphasis map land, dividers, disabled states, and calm
  backgrounds. It must not wash every page in pale mint.
- **Signal colors:** reserved semantic colors for success, warning, conflict,
  overdue, and destructive actions. They never substitute for labels.

### 4.2 Typography

- Playfair Display: brand lockup, editorial headlines, route/place identity,
  and short emotional statements.
- Inter: navigation, body copy, controls, timelines, data, essential legal or
  operational data entry outside the consumer planning path, and operator work.
- JetBrains Mono: time, distance, coordinates, status codes, SLA, and compact
  metadata only.

### 4.3 Surface vocabulary

Cards are not the universal layout primitive.

Use:

- Full-bleed image fields for desire and place identity.
- Split map/editor layouts for planning.
- Text-led comparison rows for pricing and trust.
- Inline phrase emphasis for traveler intent.
- Compact ledgers for verification and warnings.
- Drawers or bottom sheets only for complex detail, never basic selection.
- Glass only for content floating over maps or imagery.

### 4.4 Image direction

- Use owned, optimized Portugal photography with a consistent documentary
  treatment: natural light, human scale, movement, food, landscape, and
  recognizable local texture.
- Avoid generic postcard grids, unrelated luxury interiors, abstract gradients,
  and third-party placeholder imagery.
- Each region receives a primary image, secondary detail crop, route thumbnail,
  and static map fallback.
- Phase 1 cannot start until an asset manifest records source, licence,
  attribution requirement, crop focal point, owner, and expiry for every image.
  CI rejects remote placeholder hosts and missing responsive dimensions.

### 4.5 Icon direction

- Use one SVG icon component system.
- Remove icon-font ligatures and literal icon-name text.
- Every icon-only action has an accessible name and visible focus state.

## 5. Navigation and route model

### 5.1 Public navigation

- Portugal
- How it works
- Local expertise
- Pricing
- Primary action: **Plan Portugal**
- Anonymous utility: **Sign in**
- Authenticated utility: account menu

### 5.2 Traveler navigation

- Trips
- Explore Portugal
- Support
- Primary action: **Plan another trip**
- Account menu

### 5.3 Operator navigation

One protected `OperatorShell` with sections exposed by role:

- **Reviewer:** Review only: Queue, Active reviews, History, Profile.
- **Admin with `content:manage`:** Content: Places, Regions, Partners,
  Specialists, Quality.
- **Admin with `operations:manage`:** Pipeline and Messages.
- **Admin with `content:manage`:** Knowledge.
- **Admin with `analytics:read`:** Metrics.
- **Admin with `configuration:deploy`:** Configuration, only when both the
  feature and backend readiness gates pass.

Reviewer Operations is removed. Countries becomes a rollout view inside Regions
until Rumia supports more than one live country.

### 5.4 Route normalization

#### Public and traveler routes

| Route | Final responsibility |
| --- | --- |
| `/` | Product proposition, Portugal inspiration, three-phrase starter, trust proof |
| `/portugal` | Canonical Portugal atlas with synchronized map/list modes |
| `/explore` | Permanent `308` redirect to `/portugal?view=map` |
| `/explore/workspace` | Permanent `308` redirect to `/planner?view=map&source=explore`; it carries no fixtures |
| `/how-it-works` | Visual product storyboard and transparent limitations |
| `/human-review` | Permanent `308` redirect to `/local-expertise` |
| `/local-expertise` | Human-review proof, checks, specialists, and response expectations |
| `/pricing` | One-time tier outcomes, prices, limitations, and eligibility |
| `/plan` | Permanent `308` redirect to `/planner` |
| `/planner` | Living-sentence composer and anonymous preview |
| `/trip/new?draft=` | Exception-only unresolved-required-phrase resolver; exact missing/expired/foreign/complete outcomes are defined in Section 6.9 |
| `/trip/[tripId]` | Owner-only traveler command center |
| `/trip/[tripId]/map` | Owner-only focused route editor and accessible list equivalent |
| `/trip/[tripId]/export` | Owner-only compact export center |
| `/share/trip/[token]` | Revocable, expiring, read-only, noindex trip projection defined in Section 8.11 |
| `/checkout?trip=` | Authenticated, owned-trip tier ascension checkout |
| `/itineraries` | Authenticated sole trip library |
| `/vault` | Authenticated offline travel pack; it never duplicates the trip library |
| `/account` | Authenticated identity, privacy, receipts, support, and sign out |
| `/logistics?trip={id}` | Permanent `308` redirect to `/trip/{id}/map?panel=route-settings`; missing `trip` uses a `307` redirect to `/planner` |
| `/expert-chat?trip={id}` | Permanent `308` redirect to `/trip/{id}?panel=review&mode=messages`; missing `trip` uses a `307` redirect to `/itineraries` |
| `/sign-in` | One compact auth surface with preserved, validated `next` destination |
| `/support` | Tier-aware help, contact expectations, and emergency limitation |
| `/privacy`, `/terms`, `/sustainability` | Complete, versioned public documents |
| `/offline` | Connectivity, cached packs, retry, and an offline-safe action |

Invalid or unauthorized trip IDs render the same non-enumerating not-found
surface. Redirect parameters are allowlisted; external or role-incompatible
`next` destinations are rejected.

#### Reviewer routes

| Route | Final responsibility |
| --- | --- |
| `/reviewer/queue` | Assigned work queue with `view=queue|active`; assignment occurs in the admin/operations pipeline |
| `/reviewer/trips/[tripId]` | Assigned-trip master revision workspace |
| `/reviewer/history` | Actual completed-review history |
| `/reviewer/profile` | Availability, coverage, capability, and notification settings |
| `/reviewer/operations` | Permanent `308` redirect to `/reviewer/queue` |

“Specialist” is the traveler-facing profession name. `reviewer` remains the
authenticated system role for an approved specialist in this release; it is not
a second persona or permission set.

#### Admin and console routes

| Route | Final responsibility |
| --- | --- |
| `/admin/places` | Place and evidence management |
| `/admin/regions` | Portugal regions and future country rollout |
| `/admin/countries` | Permanent `308` redirect to `/admin/regions?view=rollout` |
| `/admin/partners` | Partner coverage, agreements, quality, and status |
| `/admin/reviewers` | Permanent `308` redirect to `/admin/specialists?view=assignments` |
| `/admin/specialists` | Eligibility, verification, capability, and assignment readiness |
| `/admin/quality` | Evidence-led quality queue |
| `/admin/analytics` | Permanent `308` redirect to `/console/metrics?view=product` |
| `/console` | Permanent `308` redirect to `/console/pipeline` |
| `/console/pipeline` | Operational pipeline and SLA management |
| `/console/workspace?case={id}` | Selected pipeline-case operational workspace; missing `case` uses `307` to Pipeline, foreign/missing cases use non-enumerating not found |
| `/console/messages` | Internal operations messaging, separate from trip review messages |
| `/console/graph` | Knowledge node and relationship workspace |
| `/console/metrics` | System, provider, and operational health |
| `/console/config` | Capability- and readiness-gated versioned configuration |
| `/api/v1/docs` | `developer_docs:read` documentation behind `ENABLE_API_DOCS`; otherwise `404`, including production by default |

#### Beta routes

| Route | Final responsibility |
| --- | --- |
| `/guide` | Specialist application/status hub behind `ENABLE_GUIDE_BETA` |
| `/guide/onboarding` | Invitation- or eligibility-gated staged onboarding |
| `/b2b` | Controlled beta-interest/status page behind `ENABLE_B2B_BETA` |
| `/b2b/[orgSlug]` | Approved member workspace resolved only after organization membership validation |

### 5.5 Shell, footer, and indexability rules

- Marketing, atlas, legal, sign-in, and planner routes use one
  `PublicTravelerShell`; the header swaps **Sign in** for the account menu only
  after verified authentication.
- Authenticated trip, library, vault, and account routes use the traveler
  navigation. Operator routes use only `OperatorShell`. No route renders two
  headers, footers, skip links, or `main` elements.
- The public footer is compact: Portugal, Product, Help, Legal, and one
  **Plan Portugal** action. On mobile these become short labelled groups; the
  footer never outweighs a thin utility page.
- Only `/`, `/portugal`, `/how-it-works`, `/local-expertise`, `/pricing`,
  `/support`, `/privacy`, `/terms`, and `/sustainability` enter the public
  sitemap. Planner, sign-in, app, operator, beta, preview, and API-documentation
  routes are `noindex`.
- Canonical URLs always use the final target. Redirects preserve only documented
  `trip`, `draft`, `view`, `panel`, `mode`, `stage`, `sku`, and `source` values.

### 5.6 API and callback responsibilities

| Endpoint family | Final contract |
| --- | --- |
| `/api/trips`, `/api/trips/[tripId]` | Authenticated create/read/update with owner predicates, typed errors, idempotency, and route-version concurrency |
| `/api/trips/[tripId]/export`, `/retry` | Owner-scoped export request/status/retry against access and route version |
| `/api/trips/[tripId]/messages` | Owner or actively assigned reviewer only; feature/readiness gated |
| `/api/trips/[tripId]/review` | Owner requests/acts on review; assigned reviewer proposes/completes through role-specific actions |
| `/api/trips/[tripId]/unlock` | Retired as a client unlock mutation and returns `410`; only verified payment events can grant access |
| `/api/reviewer-assignments*`, `/api/reviewers*` | Assigned-reviewer self reads where applicable; admin capability required for listing, assigning, or mutating others |
| `/api/places*`, `/api/regions*`, `/api/partners` | Published fields may be public; draft/evidence reads and all mutations require `content:manage` |
| `/api/partner-clicks` | Rate-limited, privacy-safe event capture for approved partners only |
| `/api/console/pipeline/*`, workspace/case APIs, `/api/console/chat-messages` | `operations:manage` plus case/resource scope; no anonymous or traveler reads/mutations |
| Console knowledge APIs | `content:manage` plus entity scope |
| Console metrics APIs | `analytics:read`; aggregate-only response contracts |
| Console configuration APIs | `configuration:deploy` plus `ENABLE_CONSOLE_CONFIG`, readiness, version, validation, and audit |
| `/api/v1/destinations` | Versioned public Portugal destination projection only; no draft/internal evidence |
| `/api/webhooks/stripe` | Raw-body signature verification, idempotent event ledger, owner-bound metadata, and no browser session trust |
| `/auth/callback` | Exchanges auth code, validates same-origin/role-compatible `next`, then resumes the draft claim |

Every handler returns `{ code, message, fieldErrors? }` for expected errors,
uses non-enumerating not-found behavior, and is covered by the authorization
matrix in Section 17.

## 6. Living Brief Composer

### 6.1 Sentence model

The planner opens with one grammatical sentence, for example:

> We’re planning **seven days** in **Portugal** this **September**, travelling
> **by train**, with a **slow, food-led pace**.

The sentence can expand with optional clauses:

> It’s **two adults**, around **€180 per day**, and we want **small towns,
> Atlantic beaches, and memorable food** while avoiding **long driving days**.

### 6.2 Phrase behavior

Every phrase has two visual states.

- **Accepted:** wrapping emphasized prose rendered as an inline button with no
  container, fill, or box. It can be focused, removed when optional, or
  activated for editing.
- **Editing:** a caret and animated text baseline replace the accepted phrase.
  Scalar values use an autosizing native input. Long interest, avoidance, and
  free-context values use an autosizing borderless textarea that moves to its
  own grammatical line on narrow screens. The rest of the sentence stays
  visible.

Choice comes first: opening a phrase immediately exposes complete premade
phrases. **Write my own** activates free typing for English wording only.

- Pointer/touch: tap an accepted phrase to expose its choices; choose **Write my
  own** to place the caret.
- Keyboard in the accepted state: Tab moves phrase by phrase. Enter/Space opens
  the choice rail and moves focus to the current or first suggestion.
- Keyboard in the choosing state: the rail uses roving-tabindex buttons;
  Left/Right and Up/Down move suggestion focus, Enter/Space accepts, Escape
  closes and restores focus to the phrase, and Tab closes then advances to the
  next focusable phrase. Screen readers hear the phrase label, choice count,
  focused complete phrase, and selected state.
- **Write my own** swaps the phrase button for its labelled editor. Left/Right
  edits text; Down moves focus to the first suggestion; Escape restores the last
  accepted value. Returning from the rail restores the editor caret.
- Backspace/Delete: optional phrases can be erased. Required phrases return to
  a labelled grammatical prompt state; prompt text is never persisted as data.
- Enter: accepts only a deterministically mapped choice or successfully parsed
  custom phrase.
- IME composition suspends idle parsing until `compositionend`.
- Screen reader: every phrase exposes its field label, current value,
  requirement state, edit state, and update announcement.

Unfocused text wraps normally. An active scalar editor is limited to `32ch` on
desktop and the available sentence line on mobile. Long active values use the
borderless textarea, so no inline control creates horizontal overflow at 390px.
Do not use `contenteditable` for the whole paragraph.

### 6.3 Phrase suggestion rail

Activating a phrase reveals a horizontal text rail directly below the sentence.
It is always in document flow, never an overlay, dropdown, popover card, or
boxed option grid. Each phrase controls a labelled suggestion group with
`aria-controls` and `aria-expanded`; focused/selected options are announced.
Visible options retain 44×44px minimum touch targets without visible boxes.

Examples:

- Duration: `a long weekend · five days · one week · two weeks`
- Transport: `mostly by train · with a rental car · car only when useful`
- Pace: `slow and spacious · balanced · full and energetic`
- Interests: `food-led · beaches and small towns · culture and architecture`

Suggestions are complete phrases, not abstract labels. Each premade phrase maps
directly to a typed structured value, so it never requires AI parsing. Selecting
one replaces the inline phrase and moves focus to the next unresolved phrase.
Multi-value interests and avoidances can be added or removed individually; the
accepted result is rendered as grammatical prose rather than chips.

### 6.4 Structured interpretation

The sentence synchronizes with a `TripIntentDraft` structure containing:

- destination and regions
- duration and date window
- traveler count/type
- transport preference
- pace
- interests and avoidances
- budget guidance
- accommodation preference
- free context
- confidence and source for every field

Every phrase follows this state machine:

`prompt → choosing → editing → parsing → accepted | needs_clarification |
conflict | provider_unavailable`

- A premade choice moves directly from `choosing` to `accepted` using its local
  deterministic mapping.
- Custom English text enters `parsing`. Every request carries the phrase ID and
  monotonically increasing revision; prior requests are aborted and stale
  responses are ignored.
- The last accepted raw and normalized values remain authoritative until a new
  revision succeeds. A provisional edit never silently changes route data.
- `needs_clarification` inserts one grammatical clarification phrase.
- When live AI is off or unavailable, custom text remains visible but
  unaccepted; the rail offers deterministic choices and retry. Local/test demo
  mode may use an explicitly labelled deterministic parser.
- This release accepts and produces English only. Unsupported-language text
  receives a plain-language English fallback and deterministic phrase choices;
  it is not silently translated.

### 6.5 Preview completeness contract

Required and accepted before **Create my preview** enables:

- Portugal destination scope: country-wide is valid; a region is optional.
- Duration.
- Exact dates, a month/season, or the explicit choice **dates not decided**.
- Party composition, including children where applicable.
- Transport stance: train, car, mixed, or the explicit choice **help me decide**.
- Pace.
- At least one positive trip interest.

Premade choices have confidence `1.0`. Custom parsed phrases require confidence
`≥ 0.80`; lower confidence enters clarification. Budget, accommodation style,
additional interests, avoidances, and free context are optional. An explicit
unknown choice is accepted data, not a missing value.

Preview creation is blocked only by an unresolved required phrase, a required
custom phrase below `0.80`, or a `blocking` feasibility conflict such as an
impossible island/mainland combination for the duration. Warnings that have a
safe proposed route do not block. `/trip/new` is used only when a required value
or blocking conflict survives the composer handoff; it never re-asks optional
preferences.

### 6.6 Spatial response

- Destination edits focus the atlas.
- Duration edits alter route extent and base count.
- Transport edits redraw travel legs and expose time trade-offs.
- Pace edits change stop density.
- Interest edits visibly re-rank highlighted places.
- Conflicts appear as plain-language annotations on the route, not modal errors.

### 6.7 Desktop and mobile composition

Desktop uses a 55/45 split:

- Left: living sentence, phrase rail, route interpretation, and primary action.
- Right: interactive Portugal map with route, time, bases, and warnings.

Mobile uses:

- Compact map preview at the top.
- Sentence as the primary scroll surface.
- Phrase rail anchored above the keyboard.
- Sticky consequence line and **Create my preview** action.
- No duplicate context summary before the sentence.

### 6.8 Anonymous draft and sign-in claim

- Anonymous phrase values, structured values, preview, and an opaque draft ID
  live in `sessionStorage` for 24 hours. No payment, account, or reviewer data is
  stored there.
- Preview generation may send the current draft to the server, but it does not
  create an owned trip. The response includes a short-lived server-signed
  preview receipt bound to the draft and route checksum. The preview remains
  under `/planner?stage=preview&draft={id}`.
- Save, unlock, export, or review actions require sign-in. The auth flow preserves
  the validated return target and same-origin draft ID.
- After authentication, one idempotent claim transaction verifies the preview
  receipt, creates the trip, and persists the verified initial route version.
  Browser-supplied route data is never trusted by itself. A claim key prevents
  duplicate trips across refresh, back navigation, or multiple tabs;
  `BroadcastChannel` updates sibling tabs.
- Cancelled sign-in returns to the intact anonymous preview. Expired or missing
  session state returns to the composer with a truthful recovery message.
- Signed-in drafts autosave to the owner account and survive devices. A complete
  draft bypasses `/trip/new`; only unresolved route-critical phrases use
  `/trip/new?draft={id}`.

### 6.9 Preview and generation transition

- Anonymous **Create my preview** produces an ephemeral preview in the planner.
- Authenticated **Create my preview** creates an owned trip in `generating`,
  starts one idempotent generation job, and navigates to `/trip/[tripId]`.
- Claiming an anonymous preview creates the same owned trip and persists the
  server-verified preview as route version 1 before any regeneration. An expired
  receipt offers regeneration and never silently substitutes a default route.
- `/trip/new` with no `draft` uses `307` to `/planner`. A known locally expired
  draft uses `307` to `/planner` plus a server/session flash recovery message.
  An unknown, malformed, or foreign draft returns non-enumerating `404`.
- A valid unresolved draft renders only its required missing/conflicting phrase.
  A complete unclaimed draft uses `307` to its planner `stage=ready|preview`.
  A claimed/owned draft uses `307` to `/trip/[tripId]`. None of these outcomes
  fabricate defaults or restart a valid owned trip.

## 7. Consumer pages

### 7.1 Homepage `/`

First viewport:

- Direct proposition: **Your Portugal trip, solved.**
- Supporting line: AI shapes the first route; Portugal specialists verify the
  decisions that benefit from local judgment.
- Short living-brief starter with three editable phrases.
- One **Plan Portugal** action.
- Cinematic Portugal route visual that does not compete with the composer.

Following sections:

1. Route preview showing map, two bases, travel-time logic, and one warning.
2. Before/after specialist review comparison.
3. Regional Portugal stories synchronized with a map.
4. Trust ledger: timing, transport, seasonality, local quality.
5. Three one-time tiers.
6. Final living-brief CTA.

The hero cannot use fixed heights that clip its conversion action. On mobile,
only three starter phrases appear before the CTA; advanced intent moves to the
planner.

### 7.2 Portugal atlas `/portugal`

- Map/list view switch with synchronized focus.
- Region modules show image, best season, ideal duration, transport implication,
  route archetype, and verified local note.
- Filters are text rails for `coast · city · wine · islands · nature`, not boxed
  controls.
- Selecting a region starts a living brief with that phrase already populated.
- Future region detail pages use the same data and visual grammar.

Launch coverage is complete only when all of these destination groups have the
same minimum content contract: Lisbon/Sintra/Cascais, Porto/North, Douro,
Central Portugal and the Silver Coast, Alentejo, Algarve, Madeira, and Azores.
Each group needs a licensed primary image, detail crop, route geometry/static
fallback, best-season range, recommended duration, transport consequence, route
archetype, one verified local note, evidence source, and review date. Missing
groups remain unpublished rather than receiving gradients or generic prose.

### 7.3 How it works `/how-it-works`

Four-part visual storyboard:

1. Write a living brief.
2. Watch a feasible route take shape.
3. Refine through language and map controls.
4. Add local expertise when confidence matters.

Use real interface fragments. Product limitations live in a separate transparent
section, not as a fake fourth workflow step.

### 7.4 Local expertise `/local-expertise`

- Named specialist identity and eligible region.
- Annotated before/after itinerary example.
- Exact checks: timing, transport, seasonality, food quality, local context,
  accessibility, and traveler constraints.
- Response expectation and assignment state.
- Clear boundary between review and concierge.
- No fabricated testimonial or email-preview plumbing.

Specialist identity, portrait, credentials, region, and annotations come only
from consented, approved production profiles. When none are available, the page
shows the review method and current regional availability without inventing a
person. Assignment acknowledgement targets two business hours during published
coverage windows; completed polish targets one business day, paused while a
traveler decision is required. These are separate SLAs and never imply 24/7
coverage.

### 7.5 Pricing `/pricing`

Use a vertically aligned comparison rather than three isolated cards.

- Free preview — route shape, sample stops, no export.
- Full itinerary unlock — complete route, details, PDF/calendar, immediate after
  confirmed payment.
- Local expert polish — requires unlocked trip, named review scope, response
  target, proposed changes, and final verification.
- Concierge and physical guide remain waitlist-only with no checkout.

All copy is traveler-facing. Remove checkout-session, webhook, queue, and
provider terminology.

Launch prices are **€19** for Full itinerary unlock and **€49** for Local expert
polish. A shared, server-owned commerce catalogue is the only source for public
pricing, checkout amount, receipt, and eligibility. Price changes require a
versioned catalogue update and pricing-page snapshot in the same release.

### 7.6 Support, legal, sustainability, and offline

- Support is organized by planning, payment, export, review status, account,
  and emergency limitation.
- Privacy and Terms are complete structured documents with effective date,
  processors, retention, payments/refunds, AI limitations, and contact.
- Sustainability includes only substantiated commitments and methodology.
- Offline shows connection state, cached trip packs, last update time, retry,
  and an offline-safe action.

### 7.7 Sign-in and public chrome

- Sign-in has one brand lockup, one `h1`, a sentence-style magic-link action,
  a concise privacy note, and at most one compact footer: **Send my private
  sign-in link to _email_**. The email is a labelled inline native input with a
  visible caret/baseline, not a boxed field grid.
- `next` and draft-resume context survive authentication only after same-origin
  and role validation.
- Anonymous navigation says **Sign in**; it never renders a fake initial/avatar.
- After verified authentication, the same position becomes the account menu.
- Public and traveler shells choose navigation from the route responsibility
  first and verified auth state second; marketing routes do not unexpectedly
  become operator chrome.

## 8. Traveler workflow

### 8.1 Deterministic route

`Homepage/Atlas → Planner → Missing phrase only if needed → Generated preview →
Trip workspace → Unlock → Export and/or Local review`

The planner must never loop back to itself. A complete draft skips `/trip/new`.
Every checkout and expert action requires an owned trip.

Rumia uses orthogonal state machines instead of one overloaded trip status:

- **Trip:** `draft → resolving → generating → preview_ready → active →
  completed → archived`, with `generation_failed → generating` retry.
- **Orders:** each SKU follows `eligible → session_creating → redirected →
  webhook_pending → confirmed`, with `canceled`, `failed`, `refunded`, and
  `disputed` branches. Duplicate events are idempotency outcomes, not new
  states; `already_owned` is an eligibility result.
- **Entitlements:** `full_itinerary_v1` and `local_polish_v1` each follow
  `none → pending → active`, with product-specific `fulfilled`, `suspended`, or
  `revoked` outcomes. One entitlement never implies the other.
- **Review:** `not_requested → requested → queued → assigned → in_review →
  awaiting_traveler → in_review → completed`, with explicit `canceled`,
  `reassigned`, and `provider_unavailable` transitions.
- **Export:** `locked → queued → generating → ready`, with `failed`, `expired`,
  and `stale` transitions.

Each transition records actor, timestamp, prior state, reason, and correlation
ID. UI actions derive from these states rather than ad hoc booleans.

### 8.2 Persisted route versions

Every generated or edited route is a durable `RouteVersion` containing version
number, normalized brief snapshot, ordered days/stops, legs, timing, travel
mode, warnings, integrity results, provider/generation provenance, checksum,
creator, and timestamps. Exactly one version is published per trip.

- Traveler and reviewer workspaces derive projections from the same published
  version; access changes the fields returned, never the underlying route.
- All mutations include `baseVersion`; a stale write returns a typed conflict
  and never overwrites a newer route.
- Generation, traveler edits, and accepted specialist proposals create a new
  version and supersede the prior one while retaining history.
- Review proposals target a route version and one or more atomic changes.

Direct traveler/reviewer access to raw route-version tables and Storage objects
is denied. Server functions validate owner/assignment and entitlement, then
return the permitted projection.

### 8.3 Commerce entitlements and preview projection

- `orders` records one immutable SKU, catalogue version, trip owner, trip ID,
  amount/currency, Stripe references, and lifecycle. The browser cannot choose
  an amount or owner.
- A confirmed `full_itinerary_v1` webhook transaction writes the active Full
  itinerary entitlement and access audit event.
- `local_polish_v1` is eligible only while Full itinerary is active. Its
  confirmed webhook transaction writes the polish entitlement and creates the
  review request exactly once.
- Refunding/revoking Local polish cancels an unstarted review or enters manual
  resolution after work begins; it never revokes Full itinerary. A Full
  itinerary refund/dispute affects only full/export access and cannot silently
  delete the route or review audit. Suspended/revoked states show Support and
  block a new checkout until resolved.

The server-enforced free preview projection contains route bases, coarse route
geometry, total days, daily themes, aggregate travel time, warning summaries,
and at most two sample public stops. It excludes the remaining stop IDs/order,
detailed agenda, notes, full leg timings, downloadable assets, partner data, and
specialist artifacts. `full_itinerary_v1` returns the complete traveler route;
an actively assigned reviewer receives the complete review projection. UI blur
or hidden markup is never used as access control.

### 8.4 Trip command center `/trip/[tripId]`

The page is a tool, not a multi-viewport cinematic story.

Desktop:

- Top context capsule: destination, dates, travelers, transport, review state.
- Primary next action: finish brief, view route warning, unlock, respond to
  specialist, or export.
- 60/40 map and agenda split.
- Day tabs and timeline remain synchronized with map focus.
- Compact route-integrity ledger.
- One access/review section below the working area.

Mobile:

- Modes: Overview, Map, Plan, Pack before departure; Today, Map, Plan, Pack
  during the trip; Recap, Map, Plan, Pack after it. Date comparison uses the
  destination timezone, including the Azores offset.
- One-card stop progression with visible position.
- Offline availability and last-sync status.
- Bottom action dock for the current next action.
- Never label a future itinerary as “Today.”

### 8.5 Route editor `/trip/[tripId]/map`

- Full-height map and persistent accessible stop list.
- Day, transport, and route-layer text rails.
- Selecting a stop synchronizes map, list, and detail.
- Optional partner or place-provider failures do not invalidate the trip.
- Each data boundary has independent loading, empty, error, and retry state.
- Route settings replace the standalone logistics page.

Travelers can add, remove, reorder, replace, and move stops between days; change
leg transport; and apply route-setting phrases such as **less driving** or
**one slower base**. The editor exposes `clean`, `dirty`, `saving`, `saved`,
`conflict`, and `save_failed` states, keeps a 20-action local undo stack, and
recomputes legs/warnings before publishing a new route version. Navigation never
silently discards a dirty edit.

### 8.6 Checkout `/checkout?trip=`

- Missing `trip` uses `307` to `/itineraries`. An anonymous request with a
  syntactically valid trip uses the validated sign-in return flow. An anonymous
  preview is claimed first, then continues with the new owned trip ID.
- After authentication, malformed, nonexistent, and foreign trip IDs share the same
  non-enumerating `404`. No response reveals whether another owner’s trip exists.
- Show the owned trip route summary and current product entitlements.
- Compare the next eligible tiers only.
- One selected package, exact price, deliverable, timing, limitation, and Stripe
  action.
- Checkout return reads persisted payment state; query parameters never prove
  purchase.
- Canceled returns preserve the chosen tier. Webhook-pending shows a bounded
  polling/retry state. Confirmed, failed, refunded, disputed, duplicate, and
  already-owned outcomes each have truthful next actions.
- An already-active requested SKU uses `307` to the trip’s relevant itinerary or
  review panel. Local polish is not selectable until Full itinerary is active.
  A suspended/refunded/disputed entitlement renders the access-resolution state
  with Support; it cannot start a replacement checkout until resolved.

### 8.7 Export center `/trip/[tripId]/export`

- One compact screen.
- PDF, calendar, print, and markdown rows.
- Locked, queued, generating, ready, failed, and retry states.
- Ready formats expose direct download and updated time.
- Purchases route through checkout.
- Durable job state comes from `trip_export_jobs`.
- PDF, calendar, print file, and markdown require Full itinerary access. A free
  preview may create the redacted share link but cannot generate a file.
- Jobs bind to a route version. A later route change marks the pack stale and
  offers regeneration; an expired signed URL can be reissued without rerunning
  the job. Refund/dispute access follows the relevant persisted entitlement and
  policy.

### 8.8 Trip library `/itineraries`

- Sole archive with explicit text-rail filters: Planning (`draft`, `resolving`,
  `generating`, `generation_failed`, `preview_ready`); Upcoming/In Portugal/Past
  (active/completed plus trip-local dates); Expert review (non-default Review
  states); and Archived. “Reviewed” is never treated as a Trip lifecycle value.
- `draft → resolving` occurs only when a required value remains; route-job start
  enters `generating`; successful publication enters `preview_ready`; **Keep
  this route** or confirmed Full itinerary activates the trip. With exact dates,
  the trip-local day after the end date completes it; without exact dates, the
  traveler explicitly marks it complete. Archive is always an explicit owner
  action and never occurs while a save/generation job is running.
- Overview/Today/Recap modes use the same date contract. A trip without exact
  dates always uses Overview until dates are accepted.
- Text rails also filter region and independent Entitlement/Review state.
- Route thumbnails use real map geometry and region imagery.
- Primary action continues the trip; export and archive are secondary.
- Empty state begins a living brief.

### 8.9 Vault and account

- `/vault` is the offline travel pack containing ready PDFs, calendars, cached
  maps, share links, route-version freshness, size, last sync, and update status.
  Before its Phase 3 readiness gate passes, direct access renders a controlled
  unavailable state; it does not become a second archive.
- `/account` contains identity, notification choices, personalization/privacy,
  receipts, support, and sign out. It contains no trip grid and no internal IDs.

### 8.10 Human review workspace

Human communication remains trip-scoped and paid-only.

- Specialist identity, region, status, and response expectation.
- Proposed itinerary changes with accept, decline, or ask-why actions.
- Questions that require traveler decisions render as editable phrases.
- Resolved checks form the review ledger.
- Optional message composer is secondary; no AI chatbot bubbles.
- Attachments, escalation, and unavailable-provider states are explicit.

Proposals support partial acceptance, decline with optional reason, ask-why,
specialist withdrawal/revision, reassignment, and cancellation. Acceptance
checks `targetRouteVersion`, recalculates affected legs and warnings, creates a
new route version transactionally, notifies the specialist, and marks other
stale proposals for rebase. Review completion is disabled while required checks,
unresolved conflicts, or traveler decisions remain.

### 8.11 Read-only sharing

- The owner creates a cryptographically random 256-bit token; only its hash is
  stored. Links expire within 30 days, can be revoked immediately, are
  rate-limited, and use `/share/trip/[token]` with `noindex`, no-referrer policy,
  and no mutation endpoints.
- A preview share returns only the server-enforced free preview projection. An
  owner with Full itinerary may explicitly choose a full traveler projection.
- Every shared projection excludes traveler identity/contact, internal party
  constraints, precise accommodation, payment/receipt data, messages,
  attachments, reviewer contact, internal notes, unpublished proposals,
  provenance secrets, and partner/private evidence.
- The owner sees scope, expiry, last access time, and revoke action in Vault.
  Expired, revoked, malformed, and unknown tokens return the same `404` surface.

## 9. Specialist experience

### 9.1 Queue

- Sort by SLA urgency, assignment, trip stage, blocker count, and status.
- Compact rows/cards with one clear open action.
- No commerce implementation badges.
- Mobile shows triage fields first.

### 9.2 Master revision workspace

- Traveler brief and constraints.
- Persisted route, not a regenerated substitute.
- Map, timeline, and selected-stop detail.
- Required-check progress.
- Proposed change with reason, traveler impact, and audit event.
- Internal notes separated from traveler-visible proposals.
- Sticky completion bar with validation summary.
- Mobile uses explicit Brief, Route, Checks, and Proposals modes. Every mode is
  reachable from a labelled switcher, preserves selected trip/stop, and returns
  focus to the invoking control.

### 9.3 History and profile

- History derives metrics and themes from actual completed reviews; empty means
  empty and never fabricates throughput.
- Profile manages availability, workload, regions, specialties, languages,
  notification settings, and verification state.

### 9.4 Messaging

- Conversation list, selected thread, trip timeline, and snippet library.
- Mobile becomes separate Conversations, Thread, and Trip Context modes.
- Snippets are context-aware but require specialist confirmation.
- Provider errors never coexist with production-looking conversations.

## 10. Admin and operations

### 10.1 Places and knowledge

- Searchable place list plus map preview.
- Category, region, confidence, seasonality, verification, and quality evidence.
- Edit drawer for text fields and controlled choices.
- Knowledge graph focuses one node and its semantic relationships.
- Embedding state is visible but never editable as a raw vector.
- Places mobile modes are List, Map, and Edit. Knowledge mobile modes are Tree,
  Node, and Relationships; no sibling pane is clipped or unreachable.

### 10.2 Regions, partners, and specialists

- Regions owns country rollout until expansion begins.
- Partners show agreement, coverage, quality, status, and audit history.
- Specialist verification uses an evidence drawer, confirmation, denial reason,
  capability view, and audit trail.
- Demo rows cannot invoke production mutations.
- Specialist verification mobile modes are Queue, Evidence, and Decision.

### 10.3 Quality and analytics

- Quality workflow: inspect evidence → approve, reject, or re-score → audit.
- Analytics includes date range, funnel, cohort, and clear unavailable/zero/
  untracked distinctions.
- Metrics are Portugal-first and real; no fabricated global GMV.
- Quality mobile modes are Queue, Evidence, and Decision. Analytics mobile modes
  are Summary, Funnel, and Cohorts.

### 10.4 Pipeline and configuration

- Pipeline desktop preserves drag-and-drop; mobile uses lane tabs and explicit
  open/move actions.
- Configuration stays hidden until permissions, versioning, diff preview,
  validation, deploy, rollback, and audit exist.
- Never present inert controls beside “Production” labels.

Across operator routes, data tables become labelled record cards below `md`.
Only boards and maps may retain horizontal interaction, and then only inside a
labelled, keyboard-focusable region with an equivalent non-drag action.

## 11. Beta and authorization model

Every gated request is evaluated in this order:

1. Feature enabled.
2. Authenticated identity.
3. Eligible role or organization claim.
4. Resource membership or assignment.
5. Entity lifecycle state.
6. Provider readiness.

Render distinct states for disabled, anonymous, ineligible, applied, pending,
denied, approved, and provider unavailable.

Authorization is enforced at three independent boundaries: route/layout,
server handler or action, and database RLS/Storage policy. A hidden link or
protected shell is never treated as security.

`app_role_capability_grants` is the authoritative, audited database source for
roles and capabilities. User-editable metadata never grants access. A shared
database authorization function reads current grants for server loaders,
handlers/actions, and RLS/Storage policies; middleware performs only coarse
anonymous/namespace routing. Provision/revoke operations require
`access:manage`, write actor/reason/expiry audit events, and take effect on the
next database authorization check. The initial access owner is migration-seeded;
there is no self-grant path.

| Surface | Required identity and capability | Data boundary |
| --- | --- | --- |
| Public and planner | Anonymous or authenticated | Published Portugal data; anonymous session draft only |
| Tokenized trip share | Possession of one valid, unexpired token | Selected read-only preview/full projection only |
| Traveler app/API | Authenticated traveler owner | Own trips, route versions, payments, exports, conversations |
| Reviewer queue/profile | `reviewer` role | Own profile and assigned work only |
| Reviewer trip/API | `reviewer` role plus active assignment, or audited admin override | Assigned trip and review artifacts only |
| Admin content | `admin` plus `content:manage` | Content entities and audited mutations |
| Console pipeline/workspace/messages | `admin` plus `operations:manage` | Operational records; console messages remain separate from trip messages |
| Knowledge | `admin` plus `content:manage` | Published/draft knowledge and evidence |
| Metrics | `admin` plus `analytics:read` | Aggregated privacy-safe metrics |
| Configuration | `admin` plus `configuration:deploy` and readiness flag | Versioned config; dual confirmation and audit |
| API documentation | `admin` plus `developer_docs:read` and readiness flag | Sanitized API contracts only |
| Guide beta | Authenticated invite or eligibility record | Own application/profile until approved; approved user receives `reviewer` role |
| B2B | Authenticated organization membership | Current organization only |

The implementation evidence matrix must enumerate every page, API route, server
action, query, mutation, Storage bucket, and RLS policy against anonymous,
traveler, reviewer, admin, specialist candidate, and organization member.

Page/API authorization outcomes are fixed: an anonymous protected page uses a
safe same-origin `307` sign-in redirect; an anonymous API returns typed `401`;
an authenticated identity without role/capability returns typed `403`; a
missing, foreign, or non-owned resource returns non-enumerating `404`. B2B
unknown and wrong-organization responses have identical status, envelope, and
timing class.

### 11.1 Feature-flag contract

- `ENABLE_LIVE_AI`
- `ENABLE_STRIPE`
- `ENABLE_TRANSACTIONAL_EMAIL`
- `ENABLE_TRIP_MESSAGING`
- `ENABLE_B2B_BETA`
- `ENABLE_GUIDE_BETA`
- `ENABLE_OPERATOR_CONSOLE`
- `ENABLE_CONSOLE_CONFIG`
- `ENABLE_API_DOCS`
- `ENABLE_PT`

Flags default off outside an explicitly approved environment. `ENABLE_PT`
remains off for this English-only release. A flag-on route still requires its
credentials, migration/RLS version, provider health, and role capability. Tests
cover flag off, flag on/provider missing, and flag on/ready. Direct URLs render
a controlled unavailable state until readiness passes.

### 11.2 Specialist eligibility

- `specialist_applications` stores invite/eligibility, applicant owner,
  lifecycle (`invited`, `draft`, `submitted`, `pending`, `approved`, `denied`,
  `withdrawn`), evidence, decision reason, and audit events.
- The staged onboarding sequence is Regions → Languages → Specialties → Service
  mode → Identity/evidence → Review. Text inputs are reserved for legal identity,
  optional biography, and licence evidence.
- The applicant can edit only their draft; approval/denial requires
  `specialists:verify`. Approval provisions the internal `reviewer` role and
  lands at `/reviewer/queue`.

### 11.3 Organization isolation

- `organization_members` is the trusted membership source; one user may belong
  to multiple organizations and selects the active membership before any entity
  query.
- Only after membership validation may the server resolve `orgSlug`; the slug is
  cosmetic routing context, not authority.
- Unknown, wrong-organization, and unauthorized slugs return the same response
  and reveal no organization existence.
- Every read/write includes `organization_id`; RLS rejects cross-tenant access.
  Logo and brand assets live under organization-owned Storage paths; colors and
  rich content are schema-validated and sanitized.
- The approved beta workspace contains organization identity, invited members,
  organization-owned Portugal route templates, scoped trip requests, status,
  and support. It never lists consumer trips or another tenant’s templates. A
  program without this real data renders interest/pending status, not a demo
  workspace.

### 11.4 Demo and unavailable invariants

- Production builds refuse fixture adapters at startup and CI scans production
  imports/bundles for fixture modules.
- Provider failure never falls back to demo rows. Empty, unavailable, denied,
  and error remain distinct states.
- Explicit local/demo mode displays **Demo data** in the shell, disables live
  mutations, and uses non-production entity IDs.
- Production persona visual baselines contain no fixtures. Separately named demo
  baselines must contain the label and prove mutation controls are disabled.
- Unsupported Tier 3/4 operational claims are removed until the program exists.

## 12. Motion and tactile behavior

Motion has three jobs:

1. Preserve continuity between phrase, map, route, and itinerary.
2. Confirm a decision or state transition.
3. Direct attention to a route consequence or conflict.

Approved techniques:

- Route-line drawing after accepted phrase changes.
- Map camera easing to the selected region or stop.
- Shared view transitions between atlas region, planner phrase, and trip cover.
- Image mask reveals for public storytelling.
- Sheet and mode transitions on mobile.
- Subtle text morphing when sentence grammar changes.

Rules:

- No content begins at opacity zero awaiting scroll.
- Reduced motion shows the final state immediately.
- Core actions never depend on animation completion.
- Map animation is cancelled or coalesced when input changes rapidly.

## 13. Performance architecture

- Target 60fps for map pan, zoom, stop selection, and phrase-driven route update.
- Keep the map instance stable across workspace mode changes.
- Batch source updates once per animation frame.
- Never query a map layer before style/layer readiness.
- Public hero has a designed static fallback and cannot delay the primary action.
- Owned imagery uses explicit dimensions, responsive variants, and modern
  formats.
- Defer nonessential map, analytics, and operator modules.
- Production p75 Core Web Vitals: LCP ≤ 2.5s, INP ≤ 200ms, and CLS ≤ 0.10 on
  every public/traveler route.
- CI mobile lab budgets: initial compressed JavaScript ≤ 220KB for public pages,
  ≤ 320KB for planner/trip workspaces, and ≤ 300KB for operator pages, excluding
  a lazily loaded map chunk. No route may defer its primary action into that map
  chunk.
- First-viewport image transfer: ≤ 600KB at 390px and ≤ 1.2MB at 1440px. A
  single mobile hero variant is ≤ 450KB.
- After map activation, first usable map is ≤ 4.0s on the CI mid-tier mobile/
  Slow 4G profile and ≤ 2.5s on desktop broadband. Phrase-to-visible route
  acknowledgement is ≤ 100ms; full recomputation announces progress if it
  exceeds 500ms.
- Panning and stop-selection traces target 60fps, with no interaction-blocking
  task over 50ms in the measured path.
- Reviewer/admin/console lab routes target LCP ≤ 2.5s desktop and ≤ 3.5s mobile,
  INP ≤ 200ms, and CLS ≤ 0.10. Queue, Workspace, Messages, and data-card/table
  routes expose their first usable task surface within the same LCP budget;
  decorative charts or secondary panes cannot block it.

## 14. Data and state integrity

- Planner phrase values and parsed structured values keep separate provenance.
- Persisted trip data is the only source for traveler and reviewer workspaces.
- Route generation errors, place-provider errors, partner errors, exports, and
  review status are independent boundaries.
- Every server-backed surface implements loading, empty, unavailable, denied,
  error, retry, and success where applicable.
- Typed API errors remain `{ code, message, fieldErrors? }`.
- Payment state is persisted and webhook-idempotent.
- Export job state is durable and owner-scoped.
- Demo adapters are development/test-only and visibly labelled.

## 15. Accessibility

- Exactly one `main` and one visible `h1` per route.
- Skip link targets the active main surface.
- Living phrases expose labels, requirement state, and updates; grammar alone
  cannot carry meaning.
- Suggestion rails support keyboard, touch, pointer, and screen reader use.
- Map-only information has an equivalent list and announcements.
- No document-level horizontal overflow at 390px.
- Multi-pane operator pages become explicit mobile modes.
- Focus is visible and restored after sheets, drawers, and route transitions.
- Serious and critical axe violations remain zero.

## 16. Analytics and success measurement

Privacy-safe events:

- brief_started
- phrase_accepted
- brief_completed
- route_preview_generated
- route_conflict_seen
- route_refined
- checkout_started
- payment_confirmed
- export_ready
- review_requested
- specialist_change_proposed
- specialist_change_accepted
- review_completed

Primary success measures:

- T1 preview to T2 full itinerary conversion: 15% target.
- Specialist first response under two hours for active revisions.
- Zero traveler-reported logistical conflict flags during live-trip execution.

Guardrails:

- Planner completion rate.
- Time to preview.
- Route-generation failure rate.
- Map interaction responsiveness.
- Refund/contact rate after payment.
- Review rejection and reassignment rate.

## 17. Testing and evidence

The route audit is a versioned route × persona × state matrix. Applicable state
sets are fixed by surface family:

| Surface family | Required states |
| --- | --- |
| Static public/legal | default, image fallback, offline navigation |
| Atlas | loading, partial region data, map unavailable/static fallback, ready |
| Planner | empty prompt, focused phrase, choices, custom edit, parsing, unrecognized, provider unavailable, clarification, conflict, preview loading/error/ready, auth resume |
| Traveler trip/map | generating, generation failed, preview projection, full entitlement, loading, empty, denied/not found, independent map/place/partner failure, dirty, saving, conflict, offline/stale, ready |
| Checkout | ineligible, creating, canceled, webhook pending, confirmed, failed, already owned, refunded, disputed |
| Export | locked, queued, generating, ready, failed, retry, expired, stale |
| Read-only share | preview scope, full scope, expired/revoked/unknown not found, rate limited |
| Review | ineligible, queued, assigned, in review, awaiting traveler, stale proposal, provider unavailable, completed, canceled/reassigned |
| Operator data | loading, empty, denied, error, retry, success; explicit local demo is a separate suite |
| Beta | disabled, anonymous, ineligible, invited/applied, pending, denied, approved, provider unavailable |

### 17.1 Contract tests

- Phrase grammar and structured parsing.
- Inline editing, erasure, suggestion acceptance, confidence, and clarification.
- Owner, reviewer, admin, and organization access boundaries.
- Payment webhook idempotency.
- Export job transitions and retry.
- Independent map/partner/place error handling.
- Anonymous draft expiry, idempotent claim, multi-tab claim, and auth return.
- Trip, order, entitlement, review, export, and route-version transitions.
- Stale parser response, stale route edit, and stale specialist proposal
  rejection/rebase.
- Every operator page/API/action plus reviewer assignment, specialist portrait
  Storage, and organization cross-tenant isolation.
- Demo IDs cannot mutate; unknown organizations cannot be enumerated.
- Share token hashing, expiry, revocation, scope, redaction, indistinguishable
  not-found response, and rate limit.

### 17.2 Journey tests

- Homepage brief → planner → preview → owned trip.
- Complete brief skips exception resolver.
- Missing brief asks only the unresolved phrase.
- Trip → checkout → persisted unlock → export.
- Paid trip → local review → proposed change → traveler decision → completion.
- Specialist queue → revision → audit → completion.
- Admin place edit and specialist verification.
- Refresh/back recovery, multiple-tab draft claim, canceled sign-in, and direct
  invalid `/trip/new` entry.
- Payment-return delay, duplicate webhook, route-save conflict, partial proposal
  acceptance, stale offline pack, and expired export URL.
- Create preview/full share, verify redaction, revoke it, and verify the same
  not-found response as an unknown token.
- On mobile, open every reviewer/admin/console mode, reach its primary content,
  complete or safely cancel its core action, return focus, and prove that no
  action exists only inside a clipped sibling pane.

### 17.3 Visual coverage

Capture at 1440×900 and 390×844:

- Every route and redirect.
- Default, focused phrase, suggestion rail, parsed, conflict, loading, empty,
  denied, error, retry, and success states.
- Signed-out, traveler, specialist-candidate, approved reviewer, admin, and
  organization-member personas.
- Each authenticated fixture asserts an expected visible role marker and a
  successful role-scoped data read before capture; a cookie or non-sign-in URL
  is not sufficient evidence.
- Production baselines may contain no fixture claims, provider errors, clipped panels,
  unreachable panes, raw icon names, or invisible core content.
- Explicit demo baselines live in a separate project, show **Demo data**, and
  assert that mutation controls are unavailable.

### 17.4 Release gates

- Lint and strict typecheck.
- Unit and integration tests.
- Route smoke and redirect tests.
- Accessibility and keyboard journeys.
- Mobile overflow and mode reachability.
- Visual review by route family.
- Performance budgets.
- Staging RLS and organization-isolation tests.
- Monitored provider smoke tests before each production flag is enabled.

Every provider smoke contract names environment, credential source, one
privacy-safe operation, expected response, timeout, retry count, evidence sink,
monitoring owner, and rollback trigger. Activation requires five consecutive
successful staging operations, one production canary, 30 minutes without an
elevated error/latency alert, and a documented flag-off rollback. No smoke
evidence contains a trip brief, message body, email address, or payment secret.

## 18. Phased delivery strategy

### Phase 0 — Foundations

Design tokens, typography, icon cleanup, shared shells, minimal accepted-phrase
and deterministic-choice primitives, route catalogue, exact redirects, state
contracts, feature flags, hosted-migration reconciliation, staging RLS baseline,
asset manifest, and evidence matrix.

### Phase 1 — Public proposition

Homepage, Portugal atlas, product storyboard, local expertise, pricing, sign-in,
support, legal, imagery, compact footer, and route normalization. The homepage
three-phrase starter uses the Phase 0 primitive and hands its deterministic draft
to the planner; it does not wait for the full custom parser.

### Phase 2 — Living Brief

Inline phrase editor, suggestion rail, parser/provenance, map consequence,
responsive composition, anonymous/authenticated draft persistence and claim,
preview generation, and exception resolver.

### Phase 3 — Traveler command center

Generated preview, trip workspace, route editor, checkout, export, trip library,
offline pack, account separation, local review workspace, route versioning, and
the trip/order/entitlement/review/export state machines. Commerce or messaging stays
unavailable until its own staging RLS/provider gate passes.

### Phase 4 — Specialist operations

Queue, master revision workspace, history, profile, messages, SLA, proposals,
audit, assignment RLS, and mobile triage modes. Direct routes stay in a
controlled unavailable state until the reviewer backend readiness check passes.

### Phase 5 — Admin and control plane

Places, regions, partners, specialist verification, quality, pipeline, knowledge,
metrics, capability policies, configuration gating, and responsive operational
modes. Each surface requires real scoped data before its flag can enable.

### Phase 6 — Production hardening

Production migration verification, live-provider canaries, worker-job resilience,
observability, analytics, performance, accessibility, complete visual matrix,
staging personas, rollback drills, and per-flag production rollout. This phase
hardens and activates boundaries built in prior phases; it does not postpone
authorization until the end.

Each phase must ship a coherent, testable improvement and must not expose an
unfinished next-phase route in public navigation.

## 19. Acceptance criteria

The rework is accepted only when:

1. A traveler can write, replace, type, and erase inline phrases without using
   a conventional planning form or dropdown; deterministic premade phrases work
   when live AI is unavailable.
2. The planner creates a preview/trip instead of reloading itself.
3. The same persisted trip powers traveler and reviewer workspaces.
4. Map, route, time, and warning consequences react visibly to intent changes.
5. The homepage primary action is visible in the first desktop and mobile
   conversion sequence.
6. Public pages contain no developer implementation copy or fake trust proof.
7. `/itineraries` is the only trip library; Vault and Account have distinct
   responsibilities.
8. Human review is proposal-led, trip-scoped, and visibly attributable to a
   local specialist.
9. Operator routes are protected, usable on mobile, and contain no unlabeled
   production-looking fixtures.
10. No visual baseline contains clipped content, duplicate chrome, provider
    errors, raw icon ligatures, invisible core panels, or role-inappropriate
    screens.
11. All required accessibility, RLS, performance, payment, export, and provider
    gates pass before production activation.
12. Every existing route has the documented production purpose, exact redirect,
    non-indexed protected surface, or gated beta state—there are no orphaned
    shells or fixture workspaces.
13. Anonymous work survives sign-in and is claimed once; trip, route, payment,
    review, and export history remain durable and owner-scoped.
14. Configuration, B2B, Guide, messaging, AI, Stripe, and email never appear
    ready from a flag alone; capability, RLS/migration, credentials, and provider
    health must also pass.
