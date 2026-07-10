# Rumia Activity-First Master Execution Plan

> **Canonical plan.** This document supersedes the public-acquisition and route-normalization portions of `rumia-full-rework-master.md`, Phase 1 Public Discovery, and Phase 2 Living Brief. It preserves their security, operations, commerce, and quality gates unless this document states otherwise.

**Goal:** Build Rumia into Portugal’s trusted activity-decision layer: travellers state the time and kind of day they have, receive a small set of independently judged activities, save a transparent day, and only then use planning, purchase, review, and export tools when needed.

**Product thesis:** “I am already going there. What is genuinely worth doing with the time I have?”

**Non-goals:** Rumia is not a booking marketplace, hotel finder, destination chooser, travel agency, global directory, generic itinerary generator, or AI-chat product.

## 1. What research changes

### Market conclusion

GetYourGuide is designed as a global marketplace of activity inventory and booking; Atlas Obscura uses a large place map, rich backstory, and saved lists. Rumia must not imitate either. Its differentiated job is to reduce activity-choice overload with an explicit, Portugal-specific editorial judgment layer.

### Design conclusion

Use premium digital-storytelling techniques as pacing and atmosphere, never as the interaction model:

- Spatial atmosphere is a progressive enhancement behind readable editorial content.
- A map explains proximity and day conflicts after selection; it never replaces a list or becomes the hero’s primary task.
- Motion conveys cause and effect: phrase selected, activity saved, day conflict revealed. It is short, interruptible, and absent under reduced-motion preference.
- Editorial typography, paper-like spacing, visual crops, and a controlled color field create premium feeling; novelty cursor effects, scrolljacking, animated noise, autoplay video, and decorative 3D are excluded.

### Evidence-based guardrails

- Public activity inventory must always explain *why* an item is shown, not just show a title and image.
- A card needs a verdict, best use, time cost, timing/crowd trade-off, and one alternative when the caveat is material.
- Use 44px practical touch targets for phrase controls and buttons; WCAG 2.2’s 24px minimum remains the absolute floor for constrained inline targets.
- All nonessential animation obeys `prefers-reduced-motion`; no essential information may rely on motion.

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

After public-entry validation, introduce `editorial_activity_profiles`, `activity_collection_memberships`, and `saved_activity_days` through forward Supabase migrations. RLS permits public read only for reviewed/published projections; drafts, notes, and editor evidence remain operator-only. Saved days are traveler-owner scoped.

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

Retain the existing foundations: shared shells, route catalogue, API envelopes, capability authorization, feature readiness, asset gate, route/persona/state matrix, and local/hosted migration parity. No live public-data feature activates while the managed PostGIS security advisory or Auth leaked-password setting remains unresolved.

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

**Gate:** at 1440px and 390px, a visitor can enter a situation, save/remove an activity, reach workspace, and encounter a truthful empty/error state with one main/h1 and no overflow.

### Release 2 — Chosen-day composition and preview

1. Make `/planner` consume repeated `activity` IDs and show “Shape your chosen day” only with saved activities.
2. Retain direct planner entry as an advanced/secondary route with activity-first copy.
3. Adapt Living Brief types so activity selection is a first-class input, not a prompt string stuffed into an itinerary generator.
4. Generate only a day-scale feasibility preview until enough deliberate selections/days exist for a trip route.
5. Preserve anonymous preview, sign-in claim, immutable route version, and owner-scoped protections from the original Phase 2 plan.

**Gate:** no selected activity disappears between explorer, workspace, planner, sign-in, and claimed trip; direct planner remains compatible.

### Release 3 — Saved activity days, traveler workspace, and commerce

1. Persist saved activity days and activity selections with traveler owner RLS.
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

1. Reconcile Supabase migrations and resolve managed-extension/Auth advisor blockers through supported infrastructure changes.
2. Replace in-memory jobs with durable leases, idempotent worker effects, outbox, dead-letter handling, and verified delivery.
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
| Responsive | 1440px and 390px captures; no document overflow; list equivalent for maps. |
| RLS | Anonymous public projection only; draft/editor evidence private; owner/reviewer/admin boundaries tested in staging. |
| Truthfulness | No fake reviews, specialist identity, availability, bookings, accommodation recommendations, or unrelated demo locations. |
| Performance | Public JS ≤220KB excluding lazy map; map is lazy/progressive; LCP/INP/CLS budgets from original master hold. |
| Commerce | Server catalogue, webhook idempotency, persisted return states, version-bound entitlement/export/review. |
| Operations | Capability, audit, assignment, and organization-isolation contract tests. |

## 8. Explicitly retired instructions

- Do not redirect `/explore` or `/explore/workspace`.
- Do not make `destination + duration + pace` the homepage’s first product decision.
- Do not refer to region cards as route shapes or lead users directly to itinerary synthesis.
- Do not make a 3D globe, map, cinematic animation, or human-review claim the hero’s reason to exist.
- Do not launch a large place directory, bookings, accommodations, or global expansion before a reviewed Portugal activity corpus works.

## 9. Research references

- GetYourGuide describes itself as a global marketplace for experiences and bookings: <https://www.getyourguide.press/about-us>
- Atlas Obscura’s app combines a large map, detailed entries, and saved lists: <https://app.atlasobscura.com/>
- Motion must respect user preference and nonessential movement should be avoidable: <https://web.dev/learn/accessibility/motion/>
- WCAG 2.2 target-size minimum guidance: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum>
- Editorial travel interaction inspiration (not a product model): <https://www.awwwards.com/sites/when-to-travel%20>

## 10. Master completion condition

Rumia is complete when a traveler can state an activity situation, receive reviewed and practical Portugal activity judgments, save a transparent day, optionally shape it into a feasible route, claim it, purchase an eligible upgrade, receive real reviewer proposals, and export a version-bound plan—without a mock, role leak, unsupported promise, inaccessible interaction, or orphaned route.
