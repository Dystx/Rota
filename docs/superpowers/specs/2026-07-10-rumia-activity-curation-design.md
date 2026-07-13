# Rumia activity-curation pivot

## Decision

Rumia is a Portugal-first, independent guide for the decision a traveller
faces after arrival: **what is worth doing with the time I have?** It is not a
booking service, accommodation finder, destination chooser, travel agency, or
open-ended AI chat product.

The public experience leads with local judgement about activities. A saved
day plan remains useful, but becomes a consequence of choosing activities,
rather than the acquisition promise.

## Product boundaries

In scope:

- Activities, walks, food experiences, cultural visits, viewpoints, short
  excursions, and indoor/rainy-day alternatives.
- Editorial verdicts: worth it, best for, best time, realistic duration,
  booking requirement, crowd/cost trade-off, and what to pair or choose
  instead.
- Activity collections expressed around a real constraint: available time,
  traveller group, mood, weather, and region.
- A saved-day flow that combines selected activities into a practical day.

Out of scope:

- Hotels, flights, reservations, packages, or commission-led ranking.
- Generic country/city inspiration with no decision value.
- A chatbot conversation, long conventional forms, dropdown-heavy filters,
  or claims that every recommendation is personally reviewed.

## Public route contract

| Route | Primary job | Primary action |
| --- | --- | --- |
| `/` | Let a traveller state the activity situation they are in. | Start a phrase-led activity search. |
| `/portugal` | Browse activity collections and regional judgement. | Open a collection or activity. |
| `/explore` | Activity explorer, replacing its current redirect. | Refine an activity set with inline phrases. |
| `/explore/workspace` | Save a shortlist and shape it into one day. | Open the saved day. |
| `/planner` | Secondary route composer for a chosen day. | Turn chosen activities into a day plan. |
| `/trip/[tripId]` | Execute, adjust, or save the resulting day plan. | View agenda / revise selections. |

`/plan` continues to redirect to `/planner` for compatibility. Pricing,
human-review, checkout, itinerary archive, export, reviewer, admin, console,
guide, and B2B routes keep their existing gated roles; this slice changes
public acquisition and the traveler entry language only.

## Interaction model

The entry interaction is an editable sentence—not a form or dropdown:

> I have **an afternoon** in **Porto** and want **good food, a walk, and one
> thing worth remembering**.

Each emphasized phrase is an inline, keyboard-accessible token. Activating it
opens a small choice rail in-place; selecting a phrase replaces the token.
Users may type a custom phrase, remove a token, or start with a supplied
sentence. The client normalizes the resulting intent into `{ region,
timeWindow, group, moods, constraints }` while preserving the original words.

The next surface presents at most five judged activity cards. A card always
states the decision, not a vague description:

- `Rumia verdict` — a concise editorial recommendation or caveat.
- `Best for` and `time needed`.
- `Go when` or `avoid when`.
- `Pair it with` and one alternative when the trade-off is material.
- `Save to this day` as the only selection action.

Selection is reversible. Cards enter a visible day tray; the tray describes
travel-time or pacing conflicts rather than silently generating a route. The
desktop workspace can retain map context; every map fact has a list equivalent
on mobile and for keyboard users.

## Information and content model

The existing `places` base remains the source of geographic facts. Add an
application-level activity presentation adapter before changing schema. It
maps curated place records into activity cards with the following explicit
editorial fields:

`verdict`, `bestFor[]`, `durationMinutes`, `bestTime`, `avoidWhen`,
`bookingNeed`, `pairWith[]`, `alternativeId`, `weatherFit[]`, and
`editorialStatus`.

Initial production content must be a small, accountable Portugal set—not
filler. A card without a verdict or editorial status is excluded from public
results. The eventual database migration stores these fields and a review
timestamp; static adapters are allowed only for owned, reviewed seed content
during the transition.

## Visual direction

Keep the linen, midnight-olive, ochre palette and Playfair/Inter editorial
voice. Replace generic destination cards and route language with an activity
ledger:

- A large calm sentence and one atmospheric, owned illustration/map treatment
  on the landing page.
- Typographic collection covers rather than unrelated stock imagery.
- Stacked editorial cards with considered whitespace, modest texture, a
  specific verdict line, and clear selection state.
- Motion communicates a saved activity moving into the day tray; it never
  hides state or becomes required for comprehension.

Desktop prioritizes reading and comparison. Mobile provides one-card focus,
visible pagination, 44px targets, and no document-level horizontal overflow.

The optional spatial enhancement is specified separately in
`2026-07-11-rumia-activity-map-capability.md`: it begins after activity
selection in the workspace, remains list-first, and does not change this
activity-card contract.

## Trust and failure states

- No fabricated expert names, review dates, availability, ratings, or
  inventory.
- An unavailable or incomplete collection says so and routes to a useful
  adjacent activity collection; it does not substitute demo locations.
- Empty search result suggests changing a concrete sentence phrase.
- Loading preserves sentence and tray context.
- Server/data failure uses the typed API envelope and a retry path.
- The feature is English-only. No PT control is rendered.

## Delivery slices

1. **Foundation:** shared activity intent types, phrase composer primitive,
   editorial activity adapter, and route/copy inventory.
2. **Public entry:** rebuild `/`, `/portugal`, and `/explore` around phrase-led
   activity discovery; make `/explore/workspace` an activity day tray.
3. **Chosen-day flow:** adapt `/planner` and trip entry to consume chosen
   activity ids, preserve accessible agenda/map alternatives, and remove
   itinerary-first wording.
4. **Data and trust:** persist editorial activity metadata, review status, and
   saved selections; publish only reviewed records.
5. **Verification:** route matrix, phrase-composer keyboard tests, mobile and
   desktop visual captures, loading/empty/error states, and no mock-content
   assertions.

## Acceptance checks

- A new visitor can select or write an activity situation without encountering
  a conventional form, select, or chatbot.
- Every public activity result communicates a judgment and practical
  constraint, not merely a place name.
- Selecting activities creates a transparent day tray; no route is generated
  silently.
- The public hero and explorer do not imply booking, stays, travel-agency
  service, global coverage, or a human review that did not occur.
- Existing traveler, operator, and gated-beta route boundaries remain intact.
- Keyboard and mobile behavior meet the release matrix: one `main`, one `h1`,
  no serious/critical axe violations, and no document overflow.
