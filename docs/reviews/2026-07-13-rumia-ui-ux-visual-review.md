# Rumia UI/UX and visual-design review

**Date:** 2026-07-13
**Scope:** full user-facing frontend flow plus representative operator routes
**Target reviewed:** exact current-tree artifact at
`http://127.0.0.1:3304/`, built from `/Users/cheng/rota`; the private
`33302` tunnel is historical and excluded from current-source evidence.
**Disposition (superseded 2026-07-14):** this document remains evidence of the
earlier functional and cinematic closeout. A fresh full-route review reopened
visual acceptance in
[`2026-07-14-rumia-frontend-visual-audit.md`](2026-07-14-rumia-frontend-visual-audit.md).
The earlier disposition was: final local desktop/mobile visual acceptance complete; VPS/public
release acceptance remains an external boundary

**Checkpoint update (2026-07-13):** the local-only closeout tranche now also
includes the chosen-day empty/shape actions, activity-first homepage cards,
direct-planner context language, editorial console vocabulary, feedback/support
proof rails, responsive console-banner wrapping, shared contour/page-entry
treatment, the feedback one-main landmark fix, and concise mobile-safe result
actions. The full unit suite is 173/890 and the changed-slice suite is 13/13.
The exact artifact was built with local PostgreSQL/Better Auth values and
reviewed at desktop and mobile; 26 route/viewport pairs passed 200/H1/main/no-
overflow/no-console-error checks. The current sample passed its action
hierarchy, semantic chapter surfaces, mobile wrapping, and browser-console
check. The full visual gate was rerun after the final phrase-composer fix and
remains green at 104/136 (32 expected skips). The local slice remains
unreleased, so VPS/public release acceptance remains open.

This is an experience review, not a claim that automated green checks equal
design completion. It is linked from the active frontend plan and does not
create a second redesign workstream.

## Product and user goals

Rumia's job is to help a traveller who is already going to Portugal decide
what is genuinely worth doing with limited time. The core flow is:

```text
activity situation → judged results → activity detail → save → chosen day
→ shape the day → save/share/feedback
```

The map is a later explanation of selected activities. Booking, accommodation
search, destination discovery, travel-agency service, and chatbot interaction
are outside this review's product goal.

## Evidence reviewed

- Home, Portugal collections, explore, activity detail, workspace, planner,
  saved-plan/account, sign-in, feedback, pricing, support, offline, how-it-works,
  local expertise, and console/pipeline routes.
- Desktop and mobile compositions, source route contracts, shared tokens,
  primitives, activity-card state, planner state, map fallback, and navigation.
- Existing automated evidence in `specs/PLAN-AUDIT_LATEST.md` and
  `docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md`.

## Summary matrix

| Dimension | Rating | Reason |
| --- | --- | --- |
| Usability | **Pass with follow-up** | The activity journey is understandable and the exact local artifact proves detail-to-day/shape actions; VPS/public release sign-off remains. |
| Accessibility | **Pass with follow-up** | Automated a11y, landmarks, focus, motion, and target gates are green on the exact artifact; release-artifact sign-off remains. |
| Information architecture | **Pass with follow-up** | Activity-first public routes, direct-planner compatibility, and editorial console language are coherent across the 26-pair local route sweep; release sign-off remains. |
| Visual design | **Pass — local closeout** | Typography, semantic chapter surfaces, contour anchors, editorial cards, full-bleed media, and first-viewport hierarchy are accepted in the fresh exact artifact; external release provenance remains separate. |
| Interaction design | **Pass — local closeout** | Detail save/remove, workspace shape, planner continuation, quiet-route actions, and live feedback are proven in the current artifact; public release sign-off remains separate. |
| Content | **Pass with follow-up** | Core verdict and activity-first language are strong; the console fixtures and direct-planner copy are reconciled, with only route-level editorial cleanup remaining. |
| Performance/technical UX | **Pass with constraints** | Map is lazy and list-safe; motion and viewport gates pass. New visual assets/motion must preserve the current budget. |
| Business alignment | **Pass with follow-up** | The reviewed public surfaces lead with worthwhile activities and practical time decisions; the optional map remains secondary and gated. |

## Prioritized findings

### P0 — source/artifact parity before visual sign-off (local pass complete)

The exact current-tree artifact is now built from the checked-out source and
served at `127.0.0.1:3304`. The old `33302` tunnel can still show a prior
release and is not accepted as current evidence.

**Local result:** URL, artifact build, representative route status, browser
console, and desktop/mobile screenshots were recorded. A release commit and
VPS handoff are still required before public/private release acceptance.

### P0 — activity detail breaks the main flow (local artifact pass complete)

`/activities/[activityId]` now shows verdict, facts, trade-offs, comparison,
evidence, and an obvious local `Save to my day` action. The current exact
artifact proves the keyboard/touch action, reversible remove state, live
announcement, and handoff into the chosen-day workspace.

**Result:** accepted for the current local artifact; VPS release provenance and
the full route matrix remain open.

### P1 — primary actions are visually underweighted (local artifact pass complete)

The local tranche promotes result-card save, workspace start/shape, planner
continuation, feedback empty-state, and quiet-route next actions to explicit
controls. The result-card action keeps the full activity title in its
accessible name while showing the concise `Save to this day` label, so the
mobile control remains legible and does not clip. The current artifact shows
those controls with a clear primary/secondary hierarchy; VPS/public release
sign-off remains in the release gate.

**Acceptance:** one primary action is visually dominant in every first viewport;
secondary reading links remain quiet; loading, disabled, success, and error
states are visible without relying on hover.

### P1 — the visual field is too beige and too quiet (representative pass complete)

The local surface pass adds stronger contour treatment and short page entry. The
exact artifact review confirmed deliberate linen/sage/midnight/ochre chapter
separation on the public, planner, workspace, console, quiet, and sign-in
routes; the full local route/viewport matrix is green and only release-artifact
sign-off remains.

**Acceptance:** each route group uses a deliberate semantic surface and a
single authored anchor (crop, contour, annotation, proof rail, or illustration)
in the first viewport. No route is a blank beige field, and contrast remains
AA-safe.

### P1 — direct planner still competes with the product promise (local artifact pass complete)

The local direct branch now foregrounds place/time context, “Continue with this
context”, and explanatory transport consequences while preserving compatibility.
The exact artifact confirms the branch reads as secondary to activity judgement
rather than a destination/itinerary planner.

**Acceptance:** selected activities appear before practical controls; direct
entry remains supported but is explicitly secondary; visible labels use
activity/day language; no first-viewport CTA implies automatic route generation.

### P1 — workspace empty state lacks an authored destination (local artifact pass complete)

The local empty workspace now has an ochre field-note/contour anchor, authored
preview rail, and a primary `Start with an activity` action; selected days also
have `Shape this day`. The exact desktop/mobile sample confirms the composition
and action ordering; the full local route/viewport matrix is green and only
release-artifact sign-off remains.

**Acceptance:** show a clear activity count/time promise, an illustrated or
contour anchor, a single `Start with an activity` action, and a responsive
composition that does not leave a large dead panel on desktop or mobile.

### P1 — long-form public routes need visual narrative

The information architecture is sound, but long utility/trust routes rely on
text and thin rails without enough visual rhythm. Awwwards-level craft should
come from composition, typography, owned graphics, and controlled transitions—not
from adding more cards.

**Acceptance:** each page has a clear first-viewport thesis, proof/evidence
block, chapter transition, and next action; body measure and spacing remain
readable at mobile and 200% zoom.

### P1 — console vocabulary is not fully editorial (local artifact pass complete)

The local console pipeline now uses activity evidence, editorial revision,
reviewer follow-up, freshness, and review-focused fallback fixtures while
keeping persistence status keys unchanged. The exact artifact also confirms
the data-source banner wraps cleanly at 393px without clipping.

**Acceptance:** operator screens speak in activity evidence, review state,
freshness, region, reviewer queue, and editorial decisions; fixtures are
clearly labelled as demo data and do not promise booking operations.

### P2 — small but visible craft defects

- the shared phrase composer’s stray terminal punctuation was removed and its
  home/explore desktop and mobile baselines were regenerated;
- the geometric “Field note / 01” treatment can read as a placeholder when it
  is not paired with an authored visual or caption;
- low-contrast side rails and sparse pricing first viewports weaken scanning;
- any literal icon-font text must remain absent from the served artifact;
- mobile hero/header actions need the same visual priority as desktop, not only
  the same semantics.

## Actual visual direction

### New media finding — place needs an authored anchor, not a blanket background

The current local artifact is coherent and intentionally restrained, but the
travel feeling is still mostly abstract: contour graphics and small SVG crops
carry the atmosphere while activity detail and selected-day surfaces have little
visual evidence of the actual place. The next pass should therefore introduce
one strong, place-specific image on the home cover, one on activity detail, and
one chapter-break image on a long Portugal/explore route. This is a P1 visual
enhancement, not a reason to turn the homepage into a video or map canvas.

The research comparison and asset/performance contract are recorded in
[`2026-07-13-rumia-full-bleed-media-research.md`](2026-07-13-rumia-full-bleed-media-research.md).
Still media comes first; ambient video is a later, single-loop experiment with
a poster, reduced-motion/reduced-data fallback, and measurable performance
budget. The first still slice is now implemented locally on the home cover,
Porto activity detail, and a Portugal chapter break; the full route matrix and
release sign-off remain open. Utility and operator routes remain quiet.

The implementation direction is recorded in the active frontend plan's
“Actual visual direction for the closeout” section. The essential decisions are:

- midnight cover and chosen-day focus;
- sage discovery/comparison;
- linen editorial reading and trust;
- ochre as a small judgement/action accent;
- serif claim/verdict, sans interface/body, mono metadata;
- numbered editorial dossiers, fact rails, contour/field-note graphics, and
  one strong crop rather than thumbnail grids;
- purposeful 160–240ms transitions for cause/effect, with reduced-motion
  removal and text/state equivalents;
- map/3D only after the selected activity day exists and remains list-first.

## Flow acceptance map

| Flow step | Must be true | Current disposition |
| --- | --- | --- |
| Situation entry | The traveller can state time, group, interest, and pace without a chatbot. | Implemented; visual hierarchy closeout open |
| Judged results | Verdict, trade-off, practical facts, and save action are scannable. | Implemented in cards; visual affordance closeout open |
| Activity detail | Verdict and `Save to my day` are adjacent and obvious. | Local exact-artifact pass accepted; VPS/public release sign-off remains |
| Chosen day | Saved activities, total time, removal, reorder, and next action are clear. | Local exact-artifact pass accepted; VPS/public release sign-off remains |
| Shape the day | Selected activities precede time/transport consequences. | Local exact-artifact pass accepted; direct branch copy reconciled; VPS/public release sign-off remains |
| Save/share | Sign-in/claim preserves activity IDs and order with honest status. | Functional baseline evidenced; visual trust pass open |
| Feedback | Rating and note explain why the input matters and show confirmation. | Functional baseline evidenced; hierarchy pass open |
| Optional map | Map explains selected activities and never hides the list. | Phase 1 gated/available behind flag; Phase 2/3 deferred |

## Required next design pass

The implementation order is complete for the current local tranche. The next
pass is evidence-only: route-by-route visual acceptance at the required
viewports, release-artifact provenance, and owner/provider/legal gates. Do not
start 3D or add a new animation dependency before the core flow and full visual
matrix are accepted.

## Final local closeout update — 2026-07-14

The two residual visual defects found during the fresh review are fixed:

- `CinematicMedia` no longer forces `position: relative`, so the homepage
  cover is genuinely full-bleed. The CTA now sits above the proof rail on
  desktop and remains inside the first viewport on mobile.
- The activity-detail save/remove action is now directly below the title. The
  responsive hero crop and spacing place the full action within both the
  1440x900 and 390x844 first viewports.

Fresh evidence against `http://127.0.0.1:3310/`:

- 26 desktop/mobile route pairs: 200, one H1, one main, no horizontal overflow,
  and no browser/page errors.
- Homepage CTA handoff reaches `/explore` with the selected activity context.
- Activity save/remove announces both states, preserves the activity-specific
  chosen-day URL, and returns to the save state.
- Reduced-motion mode removes the hero video layer while preserving the poster.
- 179 unit files / 900 tests, 64-route production build, lint/typecheck,
  motion gate, and asset gate pass.

The earlier local frontend redesign/polish objective was marked complete. That
visual conclusion is superseded by the 2026-07-14 audit; the functional and
technical evidence below remains valid. Public ingress and
the separately gated map/provider/legal decisions remain external release
boundaries, not unfinished visual work.
