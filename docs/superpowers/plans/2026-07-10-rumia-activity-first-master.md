# Rumia Activity-First Master Execution Plan

> **Canonical plan.** This document supersedes the public-acquisition and route-normalization portions of `rumia-full-rework-master.md`, Phase 1 Public Discovery, and Phase 2 Living Brief. It preserves their security, operations, commerce, and quality gates unless this document states otherwise.
>
> **Infrastructure decision — 11 July 2026.** Rumia retires Supabase as its future backend. The production target is the existing Debian VPS beside Lumes: Caddy → Next.js/Better Auth → private PostgreSQL 17 with PostGIS, pgvector when needed, and Drizzle migrations. The Mac remains local development/test. See `docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md` for the required host, backup, authorization, and migration constraints.
>
> **UI redesign decision — 12 July 2026.** The redesign is a cross-cutting clarity and quality program, not a decorative rewrite. Its screen-by-screen hierarchy, component states, responsive rules, accessibility gates, browser-finding mapping, and release sequence live in `docs/superpowers/plans/2026-07-12-rumia-frontend-deep-redesign.md`.
>
> **Frontend aesthetic decision — 12 July 2026.** The deeper component, art-direction, texture, motion, and progressive 3D work is consolidated in `docs/superpowers/plans/2026-07-12-rumia-frontend-deep-redesign.md`. It is a frontend workstream, not a new product roadmap or permission to make the homepage map-first.

**Goal:** Build Rumia into Portugal’s trusted activity-decision layer: travellers state the time and kind of day they have, receive a small set of independently judged activities, save a transparent day, and only then use planning, purchase, review, and export tools when needed.

**Product thesis:** “I am already going there. What is genuinely worth doing with the time I have?”

**Non-goals:** Rumia is not a booking marketplace, hotel finder, destination chooser, travel agency, global directory, generic itinerary generator, or AI-chat product.

## 0. MVP validation clarification (10 July 2026)

Portugal-wide coverage remains the intended launch scope. The MVP is deliberately limited by the quality and operational depth of the activity catalogue, not by a single-region restriction.

It does **not** require a native mobile app, booking stack, marketplace inventory, local-expert network, or fully automated planning system. It does require a believable end-to-end website journey:

**Homepage → activity situation → judged shortlist → activity detail → editable day → practical route/list → save or share → feedback.**

The public catalogue begins as a small reviewed Portugal corpus and expands only where its evidence and editorial judgement remain current. Manual research, review, exception handling, and plan correction are explicitly permitted behind the product; the user-facing experience must remain clear about what is editorial judgement and what is not a booking or concierge promise.

### MVP validation signals

- Activity situation started and completed
- Judged results viewed
- Activity saved, removed, reordered, or replaced
- Day opened, saved, shared, and used
- Activity detail and practical route/list opened
- Feedback and upgraded-plan interest
- Accommodation-referral source

The initial evidence targets are 100 completed activity briefs, more than 40% brief completion, more than 30% plan save/share, 15 travellers using a plan during a trip, five accommodation-partner tests, and ten people willing to pay for an upgraded plan. These are validation thresholds, not product claims.

## 1. What research changes

### Market conclusion

GetYourGuide is designed as a global marketplace of activity inventory and booking; Atlas Obscura uses a large place map, rich backstory, and saved lists. Rumia must not imitate either. Its differentiated job is to reduce activity-choice overload with an explicit, Portugal-specific editorial judgment layer.

### Design conclusion

Use premium digital-storytelling techniques as pacing and atmosphere, never as the interaction model:

- Spatial atmosphere is a progressive enhancement behind readable editorial content.
- A map explains proximity and day conflicts after selection; it never replaces a list or becomes the hero’s primary task.
- The optional activity-map track begins in the saved activity workspace, stays list-first, and is feature-flagged independently of the core generated-plan journey.
- Motion conveys cause and effect: phrase selected, activity saved, day conflict revealed. It is short, interruptible, and absent under reduced-motion preference.
- Editorial typography, paper-like spacing, visual crops, and a controlled color field create premium feeling; novelty cursor effects, scrolljacking, animated noise, autoplay video, and decorative 3D are excluded.

### Evidence-based guardrails

- Public activity inventory must always explain *why* an item is shown, not just show a title and image.
- A card needs a verdict, best use, time cost, timing/crowd trade-off, and one alternative when the caveat is material.
- Use 44px practical touch targets for phrase controls and buttons; WCAG 2.2’s 24px minimum remains the absolute floor for constrained inline targets.
- All nonessential animation obeys `prefers-reduced-motion`; no essential information may rely on motion.

The full redesign plan maps these guardrails to every public, traveler, utility,
and operator surface. Read it before changing shared shells, tokens, activity
cards, the day tray, planner controls, or the optional map.

## 2. Canonical information architecture

| Route | Product responsibility | Primary interaction | Must not do |
| --- | --- | --- | --- |
| `/` | Activity situation entry and independent-guide proposition | Editable phrase sentence | Lead with route generation, price, booking, or an opaque globe |
| `/portugal` | Portugal activity collections and regional editorial context | Choose a collection or region | Behave as a generic destination atlas |
| `/explore` | Judged activity results | Refine phrases and save activities | Redirect away or render a raw directory |
| `/explore/workspace` | Shortlisted activities and practical day tray | Remove, reorder, continue | Silently manufacture an itinerary |
| `/planner` | Secondary chosen-day composer | Solve pacing/mobility only after a choice set exists | Be the only acquisition path |
| `/trip/new` | Exception resolver only | Resolve one blocking phrase | Show a second broad form |
| `/trip/[tripId]` | Persisted activity day / travel workspace | Execute, adjust, unlock, review, export | Regenerate content from brief on load |
| `/trip/[tripId]/map` | Focused spatial editor / list equivalent | Edit a saved day | Require map manipulation to act |
| `/trip/[tripId]/export` | Version-bound output center | Request/retry/download permitted artifact | Pretend generation is instant |

`/plan` permanently redirects to `/planner`. `/human-review` permanently redirects to `/local-expertise`. Every operator, guide, B2B, legal, support, and account route retains its existing scoped purpose.

## 3. Consumer interaction contract

### 3.1 Phrase-led entry

The first meaningful interface is a sentence:

> I have **an afternoon** in **Porto** and want **good food, a walk, and one thing worth remembering**.

- Highlighted phrases are buttons with in-place choice rails, not selects or popovers that conceal state.
- Each phrase can be replaced, cleared, or supplemented with one optional “Add a detail” text input.
- A custom phrase never erases the previous valid choice until parsing succeeds or the user explicitly removes it.
- The action reads “Show me what is worth doing,” not “Generate itinerary.”
- No sign-in is required for the first judged result; anonymous state lives only as an editable browser copy until claiming a saved day.

### 3.2 Activity result contract

Results contain a maximum of five reviewed activities. Each activity row/card has:

1. **Rumia verdict** — plain-language editorial judgment.
2. **Best for** — mood, group, and situation.
3. **Time needed** — real duration, including practical friction when material.
4. **Go when / avoid when** — crowd, weather, light, season, or booking constraints.
5. **Pair with / choose instead** — an adjacent choice or alternative.
6. **Save to this day** — one reversible action.

No public card contains review stars, an invented specialist, affiliate prominence, fake availability, “hidden gem” language without an editorial basis, or a book-now path.

### 3.3 Day tray

Saving adds an activity to a visible tray. The tray reports selection count, order, neighborhood/proximity clues, time total, and a concrete conflict when one exists. It never conceals selection in a heart icon and never auto-arranges a full trip.

The tray supports keyboard reordering and removal. Continuing enters `/explore/workspace`; only an explicit “Shape this day” transfers selections to `/planner`.

## 4. Editorial content and data model

### 4.1 Initial source of truth

Keep `places` as geographic fact storage. Add a narrow `EditorialActivity` projection above it before a schema expansion. It exposes only records marked reviewed:

```ts
type ActivityIntent = {
  region: "porto" | "lisbon" | "douro" | "algarve" | "azores";
  timeWindow: string;
  moods: readonly string[];
  group: string;
  constraints: readonly string[];
};

type EditorialActivity = {
  id: string;
  placeId: string;
  region: ActivityIntent["region"];
  title: string;
  verdict: string;
  bestFor: readonly string[];
  durationMinutes: number;
  bestTime: string;
  avoidWhen: string | null;
  bookingNeed: "none" | "consider" | "essential";
  pairWith: readonly string[];
  alternativeId: string | null;
  weatherFit: readonly ("sun" | "rain" | "either")[];
  editorialStatus: "reviewed" | "draft";
  reviewedAt: string;
};
```

The seed set is deliberately small: 30–50 reviewed activities across Porto, Lisbon, Douro, Algarve, and Azores. A record without an editor, review date, evidence note, verdict, or necessary alternative is excluded. No generic placeholder content is acceptable.

### 4.2 Persistence release

After public-entry validation, introduce `editorial_activity_profiles`, `activity_collection_memberships`, and `saved_activity_days` through forward Drizzle/PostgreSQL migrations. Public activity reads use reviewed/published server projections; drafts, notes, and editor evidence remain operator-only. Saved days are traveler-owner scoped through server-only repositories, explicit owner predicates, a restricted runtime database role, and defense-in-depth RLS.

## 5. Visual system: intentional humanism, operational restraint

### 5.1 Desktop

- Full-width editorial field at entry; headline and phrase sentence remain first and legible.
- The map is a muted contextual layer, not an interaction tax.
- Results read like an annotated guide: serif title/decision, Inter facts, mono only for time/distance metadata.
- The day tray becomes a sticky but non-obscuring side rail after the first activity is saved.

### 5.2 Mobile

- One activity at a time, with visible “1 of 5” progress and no clipped carousel.
- Sticky bottom day tray with count and one continued action; expand as a bottom sheet only on user request.
- Phrase rails wrap and remain screen-reader/keyboard reachable; there is no horizontal document scrolling.
- Tap targets are 44px for clear/save/remove; inline phrase buttons preserve an equivalent reachable control when their text line height is constrained.

### 5.3 Motion

- Phrase rail: 120–180ms opacity/translate; no layout jump.
- Save: activity’s title moves conceptually to tray using a 160–220ms transform/opacity cue; state is also announced through accessible text.
- Conflict: one calm status change, never shaking, flashing, or map camera seizure.
- `prefers-reduced-motion: reduce`: no automatic map camera, no saved-card flight, no reveal sequence, and immediate state updates.

## 6. Delivery sequence

### Release 0 — Platform and safety (complete or continue)

Retain the existing foundations: shared shells, route catalogue, API envelopes, capability authorization, feature readiness, asset gate, and route/persona/state matrix. Establish the self-hosted platform before enabling persistence: Mac PostgreSQL parity, a VPS `rumia` runtime identity, Node 24, PostgreSQL 17/PostGIS, loopback-only services, Caddy host routing, encrypted off-server backup with tested restore, and a restricted runtime database role. No public persistence feature activates until the owner/reviewer/admin authorization matrix and restore drill pass.

### Release 1A — Activity domain foundation

1. Define `ActivityIntent` and `EditorialActivity` as shared types.
2. Build the reviewed activity adapter, query normalization, eligibility filter, deterministic ranker, and URL serializer.
3. Build and test the reusable phrase-led activity composer in `@repo/ui`.
4. Establish approved seed-content ownership and evidence fields.
5. Add unit tests for omitted/draft records, phrase parsing, custom-text retention, keyboard rails, URL round trip, and typed empty state.

**Gate:** no unreviewed record renders; composer has no form/select/combobox; package typecheck and focused tests pass.

### Release 1B — Public activity discovery

1. Rebuild `/` around activity situation, independent judgment, and the phrase composer.
2. Convert `/portugal` from route archetypes into curated activity collections with regional context.
3. Replace `/explore` redirect with an explorer; replace `/explore/workspace` redirect with a day tray workspace.
4. Build result cards, result/empty/loading/error states, shortlist persistence in URL/session, and accessible mobile day tray.
5. Update public navigation labels and SEO metadata to “what to do” intent without making unsupported editorial claims.
6. Clear the browser UI review findings before the next public visual baseline: shared icon rendering, planner dark-surface contrast, mobile map hierarchy, non-obscuring day tray, save/remove announcements, public utility shell consistency, and map warning cleanup.

**Gate:** at 1440px and 390px, a visitor can enter a situation, save/remove an activity, reach workspace, and encounter a truthful empty/error state with one main/h1 and no overflow.

The cross-cutting UI redesign sequence is Phase 0 through Phase 7 in
[`docs/superpowers/plans/2026-07-12-rumia-frontend-deep-redesign.md`](2026-07-12-rumia-frontend-deep-redesign.md): artifact truth first, then shared surfaces, the public activity journey, chosen-day continuity, feedback/accessibility, utility/operator quality, optional spatial enhancement, and final hardening. UI work does not change the release order or authorize implementation of gated commerce.

### Release 2 — Chosen-day composition and preview

1. Make `/planner` consume repeated `activity` IDs and show “Shape your chosen day” only with saved activities.
2. Retain direct planner entry as an advanced/secondary route with activity-first copy.
3. Adapt Living Brief types so activity selection is a first-class input, not a prompt string stuffed into an itinerary generator.
4. Generate only a day-scale feasibility preview until enough deliberate selections/days exist for a trip route.
5. Preserve anonymous preview, sign-in claim, immutable route version, and owner-scoped protections from the original Phase 2 plan.

**Gate:** no selected activity disappears between explorer, workspace, planner, sign-in, and claimed trip; direct planner remains compatible.

### Optional map capability track — after the Release 2 gate

This is a progressive enhancement, not a prerequisite for the activity-first
MVP and not a reason to delay the saved-day or persistence releases. The full
product/technical contract is in
[`docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md`](../specs/2026-07-11-rumia-activity-map-capability.md).

1. **Phase 1 — Basic interactive activity map:** add an explicit `View on map`
   surface to `/explore/workspace`, with one-to-five reviewed activity points,
   list/marker selection sync, user-triggered focus, fit/reset controls,
   optional licensed route segments, attribution, and a semantic 2D/list
   fallback. Use the existing `@repo/spatial-engine` MapLibre adapter in
   Mercator mode. No globe, auto-tour, terrain, building extrusions, or map
   dependency on the homepage.
2. **Phase 2 — Itinerary camera transitions and route storytelling:** after
   Release 3 saved-day ownership, sharing, and route geometry are stable, add
   an explicit “Explore your plan” mode with morning/afternoon/evening camera
   presets, pause/step/stop controls, and walking/driving/transit segments.
   Reduced motion uses immediate camera changes; the list remains equivalent.
3. **Phase 3 — Richer 3D destination exploration:** only after repeated plan
   use and provider, licensing, accessibility, and performance review, add
   optional pitched views, dense-urban building extrusions, or terrain where
   it materially explains an activity day. Mobile may remain 2D.

**Map track rule:** Phase 1 may be released as an optional Release 2A slice,
but it must not block Release 3. Phase 2 and Phase 3 are separately gated
capabilities, not part of the base public MVP completion condition.

### Release 3 — Saved activity days, traveler workspace, and commerce

1. Persist saved activity days and activity selections through server-only Drizzle repositories with traveler-owner predicates and defense-in-depth PostgreSQL RLS.
2. Update trip workspace hierarchy: next activity/day action → timing/proximity overview → agenda/detail → entitlements/review/export.
3. Keep map/list synchronization and versioned route edits, but construct routes from chosen activities and explicit traveler changes.
4. Preserve server-owned catalogue, Stripe session/webhook idempotency, export job state, receipt/email boundaries, archive, vault, and share policy.
5. Require Local Polish only after an eligible saved day/full itinerary; do not sell unsupported concierge or guide services.

**Gate:** owner cannot access foreign saved day/trip; payment return never proves payment; export and review are version-bound.

### Release 4 — Specialist editorial and traveler review operations

1. Let approved specialists manage activity editorial evidence, verdicts, caveats, alternatives, and review timestamps through a capability-scoped workflow.
2. Keep trip review separate: assigned reviewers propose changes to a traveler’s persisted selected day/route.
3. Implement queue, revision workspace, proposals, history, profile, and messaging only with actual assignment/evidence.
4. Keep Guide application and profile upload gated by eligibility and private Storage path rules.

**Gate:** editorial drafts never leak publicly; a reviewer cannot see or mutate an unassigned trip; messaging has the correct participant boundary.

### Release 5 — Admin, content operations, and B2B beta

1. Extend Places and Regions into an editorial activity-quality workspace with review state, evidence, freshness, and collection membership.
2. Keep specialist verification, partner records, quality cases, metrics, pipeline, configuration, and API docs capability scoped.
3. Maintain console-only messaging separate from traveler/reviewer messaging.
4. B2B remains an organization-isolated beta gate and never gains cross-tenant consumer content.

**Gate:** responsive operator views work at desktop; mobile supports deliberate read/triage; all destructive actions have confirmation and audit.

### Release 6 — Production proof and controlled launch

1. Reconcile Drizzle migrations between the Mac and VPS; verify PostgreSQL extension versions, restricted runtime grants, backup restore, and no public database listener.
2. Replace in-memory jobs with durable PostgreSQL leases, idempotent worker effects, outbox, dead-letter handling, and verified delivery through the VPS worker service.
3. Add privacy-safe activity funnel events: `activity_intent_started`, `activity_results_viewed`, `activity_saved`, `day_workspace_opened`, `chosen_day_started`, then preserve checkout/review/export events.
4. Run route/persona/state matrix, screenshot, axe, keyboard, RLS, visual, performance, and rollback drills.
5. Enable features independently: reviewed public data → saved days → live AI → Stripe → email → messaging → B2B/Guide beta.

**Gate:** staging evidence exists for every enabled feature; production enablement follows a monitored canary and a tested rollback.

## 7. Verification matrix

| Area | Required proof |
| --- | --- |
| Activity integrity | Adapter excludes draft/missing-verdict records; reviewed timestamp/evidence present. |
| Phrase interaction | Mouse, touch, keyboard arrows/Enter/Escape, clear, custom text, and focus return. |
| Route continuity | `/` → `/explore` → workspace → planner → trip preserves selected IDs or reports truthful recovery. |
| A11y | Zero serious/critical axe violations; one main/h1; focus indicator; reduced motion; label/announcement for save/remove/conflict. |
| Responsive | 1440px and 390px captures; no document overflow; list equivalent for maps; no fixed tray overlap; console mobile read/triage is usable. |
| Activity map | When the feature flag is enabled, map opens only from an explicit workspace action; one-to-five reviewed points synchronize with the list; 2D fallback, route fallback, attribution, reduced motion, keyboard controls, and cleanup are evidenced. |
| Authorization | No browser database access; public reviewed projection only; draft/editor evidence private; owner/reviewer/admin boundaries tested through server routes and a restricted database role. |
| Truthfulness | No fake reviews, specialist identity, availability, bookings, accommodation recommendations, unrelated demo locations, or unsourced route connectors. |
| Performance | Public JS ≤220KB excluding lazy map; map is lazy/progressive; LCP/INP/CLS budgets from original master hold. |
| Commerce | Server catalogue, webhook idempotency, persisted return states, version-bound entitlement/export/review. |
| Operations | Capability, audit, assignment, and organization-isolation contract tests. |

## 7A. Browser UI review gate — 11 July 2026

The live private release was reviewed at `1440x900` and `390x844` through the
Mac tunnel on port 3302. The detailed finding list and evidence are recorded in
[`docs/reviews/2026-07-11-rumia-browser-ui-review.md`](../../reviews/2026-07-11-rumia-browser-ui-review.md).

The review confirms that the activity-first journey is understandable, but it
also found P0/P1 issues that must clear before a public visual baseline is
accepted:

- replace the broken literal Material Symbols back-to-top text;
- restore contrast for planner `Transport`/`Vibe` labels on dark surfaces;
- make the mobile map subordinate to the activity decision;
- reserve space for the mobile day tray;
- restore the shared public shell on `/support`;
- make the console usable for mobile read/triage;
- announce save/remove state changes;
- remove the repeated unsupported globe fog warning.

P2 work then reconciles commerce copy, editorial whitespace, mobile-menu focus,
and heading semantics with the release gates. No P0/P1 finding is considered
closed from a source change alone: each requires fresh desktop/mobile captures,
keyboard/announcement evidence, and a clean browser warning check.

**Closure evidence (2026-07-13):** the canonical frontend plan records the
fresh route-level closure: the shared icon, planner contrast, mobile map
hierarchy, day-tray spacing, public utility shell, console mobile treatment,
save/remove announcements, and warning cleanup are covered by the current
authenticated smoke, visual, accessibility, performance, viewport, and private
tunnel checks. Public ingress remains deferred by owner decision; that is an
operational gate, not an unresolved frontend finding.

## 7B. Optional activity-map capability gate — 11 July 2026

The map capability is intentionally separated from the core activity-first
journey. Phase 1 is accepted only when the workspace list remains fully useful
without WebGL and the map is opened deliberately. The gate requires:

- no MapLibre import or tile request before map intent on `/` or `/explore`;
- one-to-five reviewed activities rendered with stable points and bidirectional
  list/marker selection;
- 2D Mercator as the default, with no automatic tour, globe fog, pitch,
  terrain, or building extrusion;
- only validated and licensed route geometry, with truthful list/proximity
  fallback when geometry is absent;
- visible basemap/tile/route attribution and a provider licence record;
- 44px mobile controls where practical, no day-tray overlap, no document
  overflow, and cooperative gestures;
- keyboard-equivalent activity controls, map summary, live selection/error
  announcements, Escape-to-close, and reduced-motion `jumpTo` behaviour;
- map instance/layer/source cleanup, no unsupported globe-fog warning, and
  focused unit, Playwright, accessibility, visual, and performance evidence.

The inspiration repository is not a code dependency. Its reviewed directory
does not expose an explicit project licence, so no source, asset, copy, data,
or distinctive visual/camera sequence may be reused without permission. Rumia
rebuilds the required interaction with documented MapLibre APIs and the
existing spatial-engine/provider boundary. MapLibre’s BSD-3-Clause licence is
recorded separately from basemap, tile, OpenStreetMap, glyph, sprite, route,
and 3D-building terms.

## 8. Explicitly retired instructions

- Do not redirect `/explore` or `/explore/workspace`.
- Do not make `destination + duration + pace` the homepage’s first product decision.
- Do not refer to region cards as route shapes or lead users directly to itinerary synthesis.
- Do not make a 3D globe, map, cinematic animation, or human-review claim the hero’s reason to exist.
- Do not build the optional map track before the generated-plan/list journey is stable; later 3D remains a user-invoked workspace enhancement with a practical 2D/list equivalent.
- Do not launch a large place directory, bookings, accommodations, or global expansion before a reviewed Portugal activity corpus works.

## 9. Research references

- GetYourGuide describes itself as a global marketplace for experiences and bookings: <https://www.getyourguide.press/about-us>
- Atlas Obscura’s app combines a large map, detailed entries, and saved lists: <https://app.atlasobscura.com/>
- Motion must respect user preference and nonessential movement should be avoidable: <https://web.dev/learn/accessibility/motion/>
- WCAG 2.2 target-size minimum guidance: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum>
- Rumia activity-map capability and phased MapLibre architecture: [`docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md`](../specs/2026-07-11-rumia-activity-map-capability.md)
- MapLibre GL JS Map API: <https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/>
- MapLibre source specification: <https://maplibre.org/maplibre-style-spec/sources/>
- MapLibre examples (GeoJSON, camera, attribution, and 3D patterns): <https://maplibre.org/maplibre-gl-js/docs/examples/>
- MapLibre GL JS licence: <https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt>
- Interactive 3D inspiration reviewed for concepts only: <https://github.com/siddsachar/gpt5.6-sol-test/tree/main/london-3d>
- Frontend deep redesign and polish plan: [`docs/superpowers/plans/2026-07-12-rumia-frontend-deep-redesign.md`](2026-07-12-rumia-frontend-deep-redesign.md)
- Editorial travel interaction inspiration (not a product model): <https://www.awwwards.com/sites/when-to-travel%20>

## 10. Master completion condition

Rumia is complete when a traveler can state an activity situation, receive reviewed and practical Portugal activity judgments, save a transparent day, optionally shape it into a feasible route, claim it, purchase an eligible upgrade, receive real reviewer proposals, and export a version-bound plan—without a mock, role leak, unsupported promise, inaccessible interaction, orphaned route, or unresolved P0/P1 browser UI finding.
