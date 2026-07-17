# Rumia frontend visual and UX audit

**Date:** 2026-07-14
**Artifact:** `http://127.0.0.1:3311/`
**Viewports:** 1440 x 900 and 390 x 844
**Evidence:** `output/playwright/visual-audit-2026-07-14/`
**Disposition:** functional baseline retained; visual acceptance reopened

## Goals

- **Traveller goal:** understand what Rumia does, find a worthwhile activity,
  judge the trade-off, save it, and shape a practical day without booking.
- **Product goal:** feel like a distinctive, trusted Portugal activity guide,
  not a generic template, itinerary generator, or decorative travel campaign.
- **Design goal:** create a coherent editorial-cinematic system with strong
  hierarchy, useful motion, tactile interaction feedback, and calm operator
  surfaces.

## Scope and evidence

The review covered these routes as complete desktop and mobile pages:

- `/`, `/portugal`, `/explore`, `/explore/workspace`
- `/activities/porto-ribeira-slow-walk`
- `/planner`, `/trip/new`
- `/how-it-works`, `/pricing`, `/feedback`, `/support`, `/sign-in`
- `/console/pipeline`

The browser reported no console errors. This audit therefore distinguishes
runtime correctness from visual quality: a route can be stable and still fail
the intended art-direction or interaction bar.

## Summary matrix

| Dimension | Rating | Reason |
| --- | --- | --- |
| Usability | Needs improvement | Core actions exist, but hierarchy and affordance vary by route. |
| Accessibility | Needs improvement | Existing semantics and reduced-motion support are useful; unconventional inline forms and future motion still need manual proof. |
| Information architecture | Pass with reservations | Activity-first route structure is coherent, but planner and saved-plan surfaces repeat context and compete with the public journey. |
| Visual design | Fail for target quality | The homepage has atmosphere, but the wider product is repetitive, flat, and inconsistent. |
| Interaction design | Needs improvement | State logic exists; visible hover, selection, save, progress, and transition feedback is too quiet or generic. |
| Content | Needs improvement | Editorial tone is strong, but several quiet routes are verbose and structurally repetitive. |
| Performance / technical UX | Pass with reservations | Current artifact is stable; cinematic media and later map work must stay budgeted and optional. |
| Product alignment | Needs improvement | The activity-first promise is present, but the visual system does not consistently make judgement the dominant object. |

## High-priority findings

### P0. Visual completion was declared too early

The previous closeout proved route rendering, tests, responsive containment,
and key actions. It did not prove that the product had reached the requested
editorial-cinematic finish. The current screenshots show material visual debt
across the whole route set.

**Recommendation:** visual acceptance becomes a separate owner gate. Automated
screenshots protect regressions but cannot close art direction by themselves.

**Acceptance:** the plan stays open until the desktop and mobile route set is
reviewed against one exact artifact and explicitly accepted for aesthetics.

### P1. The product has two different levels of finish

The homepage hero and Portugal atlas feel authored. How-it-works, pricing,
feedback, support, workspace, and parts of activity detail fall back to long
pale sage or linen fields with the same contour texture. This makes the site
feel like one campaign page attached to a lightly themed application.

**Recommendation:** define route-level chapter compositions, not just surface
colors. Each public page needs a deliberate hero, content rhythm, contrast
change, and closing action. Keep operator pages calmer and denser.

**Acceptance:** no public route is an uninterrupted pale contour field for more
than one viewport; every page has a clear opening, middle proof/judgement
chapter, and closing decision.

### P1. The homepage is atmospheric but compositionally unresolved

The hero asks the user to read a large headline, edit a sentence, inspect a
field-note graphic, notice trust metadata, and find a text-like CTA on top of a
high-detail photograph. Below it, the three-step cards are followed by a very
large empty gap. One editorial feature card appears as a gray gradient without
meaningful image content, while adjacent cards use illustration.

**Recommendation:** reduce the hero to one dominant promise and one unmistakable
action; subordinate the phrase controls and field note. Recompose the next
chapter so content begins immediately, and use a consistent media system for
all editorial feature cards.

**Acceptance:** at 1440 x 900 and 390 x 844, headline, product explanation, and
primary action are understood in five seconds; the next section has no orphaned
empty viewport or placeholder-like card.

### P1. Section hierarchy is too dependent on typography alone

Many routes use the same green/cream field, serif title, mono kicker, thin rule,
and rounded card. Large areas have equal tonal weight, so sections do not feel
like chapters and important decisions do not consistently stand out.

**Recommendation:** introduce a controlled depth grammar: full-bleed media only
for major editorial moments, dark judgement bands, inset paper sheets, image
chapters, side annotations, and compact data rails. Limit each route to two or
three depth levels and one primary accent.

**Acceptance:** grayscale review still reveals the primary decision, supporting
evidence, and secondary navigation without relying on ochre text alone.

### P1. Planner and saved-plan UI feels generic and duplicated

`/planner` places large light-gray option cards on a dark field and repeats the
brief in two right-column panels. The hierarchy is functional but resembles a
form builder more than Rumia's curated judgement language. `/trip/new` is more
authored, yet the long stack of identical editable rows becomes visually
monotonous.

**Recommendation:** make the saved activities or current decision the visual
anchor; collapse duplicate summaries; use choice components with distinct
selected, consequence, and unavailable states; reveal secondary editing only
when needed.

**Acceptance:** each viewport has one obvious next decision, one compact context
summary, and no duplicate block conveying the same trip facts.

### P1. Quiet routes are too long, pale, and repetitive

How-it-works, pricing, feedback, and support are readable but visually static.
They rely on generous whitespace and repeated rules/cards rather than place,
evidence, or a memorable progression. On mobile, the large repeated footer
often becomes a disproportionate part of the page.

**Recommendation:** give each route one purpose-built visual device: an
annotated decision sequence for how-it-works, a compact comparison ledger for
pricing, a traveller outcome prompt for feedback, and a task-oriented support
index. Create a compact mobile footer variant.

**Acceptance:** each route can be identified from an unbranded screenshot;
mobile content reaches its final action before the footer dominates the scroll.

### P1. Sign-in is distinctive but harder to parse than necessary

The sentence-form email and password controls create editorial character, but
the line wrapping is awkward on mobile and the submit action reads like part of
the sentence. The large dark manifesto panel comes after the form on mobile,
adding length without helping completion.

**Recommendation:** retain the daybook art direction while restoring a clear
form hierarchy: persistent labels, bounded inputs, explicit submit button,
visible error/help regions, and a shorter trust note. On mobile, place the trust
proof before or directly beside the action in compact form.

**Acceptance:** a user can identify both fields and the submit control without
reading the surrounding prose; keyboard, autofill, error, loading, and 200%
zoom states remain clear.

### P1. Activity detail needs stronger decision choreography

The image, title, and save action are now visible, but the remainder becomes a
long pale dossier. The right-hand decision note is detached from the main
verdict on desktop, and mobile turns practical facts into a long undifferentiated
stack.

**Recommendation:** bind verdict, trade-off, save state, and practical facts
into one decision module; follow it with nearby alternatives or pairings and a
contextual map preview only after the list decision is clear.

**Acceptance:** verdict, disqualifying trade-off, time cost, and save/replace
action are visible as one coherent unit on desktop and mobile.

### P2. Interaction feedback is present but visually too quiet

The codebase contains transitions, status regions, sheets, and reduced-motion
handling, but the rendered product gives little visible sense of progression,
selection, save confirmation, or spatial continuity. Static screenshots expose
how much meaning currently depends on copy.

**Recommendation:** define a small motion language: 160–220 ms control response,
300–450 ms chapter reveal, shared-element continuity for an activity card into
detail, and explicit save/undo feedback. Motion must never be required to
understand state.

**Acceptance:** every interactive primitive has default, hover, focus, pressed,
selected, loading, success, error, and disabled visual states; reduced-motion
uses immediate state changes with equal clarity.

### P2. Operator UI needs denser, more intentional information design

The console correctly avoids cinematic decoration, but the pipeline has large
unused areas and lanes with weak density cues. Mobile shows only the first lane
without a strong indication that more status groups exist.

**Recommendation:** retain the neutral operator shell, improve lane density,
status color semantics, filtering feedback, horizontal wayfinding, and empty
space use. Do not import marketing textures or large serif hero treatments.

**Acceptance:** status, urgency, owner, and next action are scannable in one
pass; mobile makes lane navigation and result count explicit.

## System-level direction

1. **Use editorial contrast, not universal decoration.** A full-bleed image,
   dark judgement band, paper dossier, and quiet utility surface should each
   have a clear job.
2. **Make judgement the strongest object.** The activity verdict and trade-off
   should outrank scenery, generic prose, and trip mechanics.
3. **Reduce repeated chrome.** Contour texture, mono kickers, round cards, and
   large footer columns cannot be the answer on every route.
4. **Use motion as continuity.** Animate selection, save, and movement between
   activity, detail, and day; do not add decorative autoplay outside approved
   poster-backed media.
5. **Keep 3D and maps secondary.** The first spatial enhancement belongs after
   a saved activity/day is understandable in list form.

## Decision

The current frontend is not aesthetically complete. It is a stable functional
baseline for a focused polish program. The new canonical plan is
`docs/superpowers/plans/2026-07-14-rumia-frontend-polish.md`.

## Follow-up checkpoint — 2026-07-14

The implementation checkpoint has since addressed the highest-impact system
issues: shared route surfaces, public decision hierarchy, planner duplication,
quiet-route framing, legal/vault composition, operator density, focus states,
and selected-save feedback. The final candidate is served at port `3311` and
has a fresh 36-capture route matrix. The home bento now also carries a local
poster/background fallback behind lazy media, so a below-fold card does not
collapse into an unstyled field before its image arrives; the Lisbon, Douro,
and Azores cards use distinct regional media.

The remaining visual acceptance work is deliberately narrower than the earlier
redesign queue:

- review the exact desktop/mobile artifact as an owner for art direction, not
  only correctness;
- capture selected, loading, and error states alongside the settled states;
- seed a safe local reviewer/admin session if those operator pages must receive
  visual approval rather than redirect proof;
- decide whether the long reading-field pauses on the homepage and activity
  detail are an intentional cinematic rhythm or should be tightened.

These are acceptance decisions, not a reason to reopen archived plans or start
map/3D work. The active execution authority remains the 2026-07-14 polish plan.

## Follow-up verification — 2026-07-14 (post-build restart)

The exact production artifact was restarted on `http://127.0.0.1:3311/` after
the latest build and the fallback surfaces were captured again with
`networkidle`:

- `/nonexistent` renders the authored Rumia 404 composition with the linen
  field, contour texture, brand mark, editorial headline, clear recovery
  actions, and the compact footer.
- `/offline` renders the shared navigation, sage recovery field, offline
  status action, next-step panel, and footer.
- `/` retains the local bento poster/background fallback and distinct Lisbon,
  Douro, and Azores media after restart.

The earlier unstyled fallback screenshots were stale-server evidence, not a
current CSS defect. No new redesign queue is warranted. The remaining work is
owner art-direction approval and, only if requested, authenticated settled
operator proof.

## Follow-up checkpoint — 2026-07-14 (final review and auth feedback)

The exact rebuilt candidate was reviewed again across the core public journey
at `http://127.0.0.1:3311/`: home, Explore, Portugal, activity detail, planner,
saved workspace, sign-in, quiet routes, legal/recovery routes, and mobile
variants. The current visual system now reads as an intentional field guide:
full-bleed place media is reserved for orientation, dark judgement surfaces
carry decisions, dossier surfaces hold evidence, and utility/operator screens
stay restrained. No new broad visual defect was found that justifies reopening
the archived redesign plans.

The review did identify two decisions to keep explicit rather than silently
calling them defects:

1. the long quiet pauses after a settled Explore/detail result are a deliberate
   cinematic reading rhythm; tighten only if the owner prefers denser browsing;
2. planner options below the first viewport reveal as they enter view, so the
   settled capture must be judged after the relevant scroll rather than from a
   top-of-page full-page screenshot.

One non-visual trust defect was found and fixed: Better Auth/database failures
could previously surface provider or `NEXT_REDIRECT` internals in the sign-in
feedback. The server action now returns a generic safe result, the form renders
an accessible inline alert, and legacy query-string errors are normalized. Live
wrong-credential and legacy-error checks on the rebuilt artifact show no
placeholder, provider, or redirect leakage.

### Verification after the follow-up fix

- 6 focused sign-in tests pass (server action, form error, and legacy-error
  normalization).
- `pnpm --filter web typecheck`, production build, `pnpm lint`,
  `pnpm qa:assets`, `pnpm qa:motion-gate`, and `git diff --check` pass.
- The monorepo unit suite passes after the auth package test script uses the
  root Vitest configuration.
- The existing 36-capture desktop/mobile matrix, 72 Axe runs, route sweep,
  performance samples, and selected-save/loading/error evidence remain valid
  for unchanged visual surfaces.

The exact artifact is ready for owner aesthetic approval. Do not begin map/3D
enhancement or create another visual plan until that approval either accepts
the quiet spacing or requests a bounded spacing adjustment.

## Follow-up implementation — 2026-07-14 (spacing and chapter closure)

The two previously open visual decisions were converted into bounded
implementation changes rather than left as subjective debt:

- Explore now reserves the larger mobile bottom inset only when the fixed saved
  day tray exists. An empty discovery result no longer carries a full tray-sized
  blank tail.
- Activity detail now closes with a contextual “Continue the judgement” panel
  linking to the reviewed alternative activity, so the evidence dossier ends in
  a next decision instead of an unexplained reading field.

Fresh captures are stored as:

- `output/playwright/visual-audit-2026-07-14/closeout/explore-empty-mobile-v2.png`
- `output/playwright/visual-audit-2026-07-14/closeout/explore-saved-mobile-v2.png`
- `output/playwright/visual-audit-2026-07-14/closeout/detail-desktop-polish-v2.png`
- `output/playwright/visual-audit-2026-07-14/closeout/detail-mobile-polish-v2.png`

The changed routes were rechecked at 390px and 1440px: all returned HTTP 200,
had an `h1`, no horizontal overflow, no browser errors, and no Axe violations.
The production build and focused Explore/detail tests pass. The remaining
closeout gate is now only owner aesthetic approval plus optional seeded
operator-page proof.

## Closeout verification — current run — 2026-07-14

The rebuilt candidate was re-reviewed after the sign-in test isolation fix. The
fix changes test loading only; it does not alter the rendered sign-in surface.

- 34-route desktop/mobile sweep (17 routes × 2 viewports): all routes returned
  without 5xx responses, had a visible heading, no horizontal overflow, and no
  page errors.
- `pnpm test:unit`: 180 files / 904 tests passed.
- `pnpm --filter web typecheck`, `pnpm lint`, production build,
  `git diff --check`, `pnpm qa:assets`, and `pnpm qa:motion-gate`: passed.
- Planner and activity-detail captures were checked on the current server; the
  planner choices are fully visible after settlement, the empty Explore mobile
  tail is compact, and activity detail closes with the contextual alternative
  decision panel.

Plan pruning is complete for this checkpoint. Only the Portugal-wide product
plan, the active frontend polish plan, and the explicitly deferred map packet
remain in `docs/superpowers/plans/`; completed redesign and VPS implementation
plans remain under `docs/superpowers/archive/plans/` for provenance. No new
frontend redesign plan is warranted until the owner either accepts this exact
artifact or identifies a concrete bounded aesthetic change.

## Reopened bounded polish — 2026-07-14

The owner still perceived the settled frontend as under-polished. A new visual
pass isolated the remaining issue to chapter closure: Explore, a one-stop
Workspace, and How it works had correct content but too much unstructured
sage field after the primary content. This was addressed without adding
decorative media, a chatbot, or map/3D work.

The new `EditorialChapterClose` primitive gives those surfaces a shared dark
judgement band with a compass mark, stronger display hierarchy, compact facts
where useful, and a single clear next action. Explore varies the close by
empty/unsaved/saved state; Workspace summarizes selected activities, attention
time, and remaining space; How it works now ends with a trial panel instead of
a lone button.

The changed routes were captured at 1440px and 390px in
`output/playwright/visual-audit-2026-07-14/reopen-polish/`. The current
production artifact was rebuilt and served from port 3311. Six changed-route
viewport checks report no page errors or horizontal overflow, and the same
12 route/viewport combinations report no serious or critical Axe violations.
The focused route tests, full 180-file/904-test unit suite, web typecheck,
lint, production build, asset provenance gate, motion gate, and diff check are
green.
