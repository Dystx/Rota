# Rumia frontend polish and visual completion plan

**Status:** historical — bounded polish evidence retained; superseded by the 2026-07-14 convergence implementation plan  
**Created:** 2026-07-14  
**Evidence baseline:** `http://127.0.0.1:3311/`
**Audit:** `docs/reviews/2026-07-14-rumia-frontend-visual-audit.md`

## Goal

Turn the stable current frontend into one coherent, premium, editorial-
cinematic Portugal activity guide. Preserve the existing activity-first UX and
working routes while improving art direction, hierarchy, spacing, typography,
media, interaction feedback, motion, responsive composition, and operator
clarity.

This plan is the only active frontend redesign queue. It replaces the completed
2026-07-12 implementation history without reopening its finished technical
tasks.

## Implementation checkpoint — 2026-07-14

The shared polish layer and the first route pass are now implemented in the
working tree. The current candidate has been served from the production build
at `http://127.0.0.1:3311/` and reviewed at desktop and mobile sizes.

Completed in this checkpoint:

- layered sage/linen surfaces, page-entry motion, navigation depth, compact
  footer, and named route hooks;
- visible intent-composer action treatment and stronger result/workspace/day
  hierarchy;
- local, provenance-backed bento imagery replacing the blank feature card;
- activity detail judgement/dossier/decision grouping;
- planner summary de-duplication while retaining accessible edit controls;
- quiet-page chapter panels for How it works and Pricing;
- reusable legal/promise document framing for Privacy, Terms, and
  Sustainability, replacing short-page dead space;
- authored empty-state treatment for the Saved Vault with a clear next action;
- operator shell depth and secondary-route matrix review; auth-gated reviewer
  and admin routes correctly fall back to Sign in when no session is seeded;
- shared reviewer/admin streaming boundaries now preserve the operator shell
  while data resolves instead of showing an unstyled skeleton;
- sign-in sentence-form responsive layout and focus treatment;
- valid planner definition-list semantics and non-nested draggable pipeline
  card controls;
- fresh 36-screenshot desktop/mobile matrix with no route errors or overflow.

### Follow-up visual fix — 2026-07-14

The home bento now uses provenance-backed regional media with an authored CSS
poster/background fallback behind lazy-loaded images. This prevents a first
paint or full-page capture from showing a blank/flat card and gives Lisbon,
Douro, and Azores distinct visual entry points without adding another network
dependency.

Remaining gates before this plan can close:

- receive explicit owner aesthetic approval on the exact served artifact;
- optionally capture an authenticated reviewer/admin session if the owner
  requires settled operator pages rather than the verified unauthenticated
  redirect and shared loading-shell proof.

The selected-save state is captured in the final matrix, the reviewer/admin
loading shell is unit-covered, and the 404/offline recovery surfaces were
rechecked after restarting the current production build. Accessibility,
performance, viewport, asset, motion, typecheck, test, and build evidence is
already retained in the audit ledger; these are no longer implementation
tasks.

### Follow-up correctness fix — 2026-07-14

The final anonymous-browser review found one trust-critical edge case in the
otherwise complete surface: a failed Better Auth/database sign-in could expose
provider or redirect internals in the inline error and toast. The server action
now returns a serializable generic result, the client form preserves the
activity-first composition while showing an accessible alert, and legacy
`?error=` values are normalized to the same safe message. The package-level
auth test runner was also pointed at the root Vitest configuration so the
monorepo test command uses the same `server-only` alias as the web suite.

Verified against the rebuilt artifact at `http://127.0.0.1:3311/`:

- wrong credentials stay on `/sign-in` and show only the generic message;
- legacy query errors do not render `NEXT_REDIRECT`, provider, or database
  details;
- sign-in action/form tests (6), typecheck, production build, lint, asset
  provenance, motion gate, and the monorepo unit suite pass.

This does not create a new redesign queue. The remaining closeout decisions are
visual-owner choices: whether the intentional reading-field pauses on the
Explore/detail chapters should be tightened, and whether a seeded
reviewer/admin session is required for settled operator aesthetics.

### Bounded spacing and chapter closure — 2026-07-14

The final review converted the last visible low-content issues into two small,
reversible changes inside this plan:

- `/explore` uses compact mobile bottom spacing when the day is empty and keeps
  the tray-safe inset only for a saved day;
- `/activities/[activityId]` ends with a reviewed alternative panel that turns
  the quiet dossier tail into an explicit comparison decision.

The updated candidate was rebuilt and served at `http://127.0.0.1:3311/`.
Changed-route captures and Axe checks are recorded in the visual audit. No new
redesign plan is needed; this remains the final bounded polish pass.

### Current verification — 2026-07-14

The current production artifact was checked again after isolating the
server-only sign-in action in the page contract test. The rendered surface is
unchanged by that test-only fix.

- 34-route desktop/mobile sweep is green (17 routes at 1440px and 390px).
- The monorepo unit suite is green at 180 files / 904 tests.
- Web typecheck, workspace lint, production build, diff check, asset
  provenance, and motion import gate are green.
- The current planner capture shows all choice groups settled and readable;
  the latest Explore/detail captures retain the compact empty state and
  explicit comparison close.

Plan pruning is complete: the two completed implementation histories are in
`docs/superpowers/archive/plans/`, the map packet remains explicitly deferred,
and this file is the only active frontend queue. Do not create another broad
redesign plan for the same surface. Any further change must be a bounded owner
decision recorded here with a capture and regression check.

### Bounded visual closure pass — 2026-07-14 (owner reopened polish)

The owner reported that the settled artifact still felt under-polished. A
fresh visual review confirmed a specific issue rather than a broad redesign
need: short result sets on Explore, a one-stop Workspace, and How it works
resolved into long low-information sage fields before the footer. The content
was correct, but the composition did not give those chapters an intentional
ending.

Implemented inside this same plan:

- added the reusable `EditorialChapterClose` primitive with a dark judgement
  surface, compass mark, authored kicker, supporting copy, action hierarchy,
  and optional summary facts;
- added an Explore close that changes with the state (no forced fill, first
  decision, or saved day), with anchors back to the intent lens and judged
  results;
- added a Workspace close with selected-count, attention-time, and remaining
  space facts plus a distinct practical-planning action, so the activity list
  no longer dissolves into an empty field before the day tray;
- replaced the How-it-works trailing standalone button with a dark trial
  chapter that makes the product promise and next action feel like a designed
  conclusion;
- kept the change list-first, map/3D-neutral, media-free on quiet pages, and
  reduced-motion safe. No new visual plan was created.

Fresh captures are stored in:

- `output/playwright/visual-audit-2026-07-14/reopen-polish/explore-desktop.png`
- `output/playwright/visual-audit-2026-07-14/reopen-polish/explore-mobile.png`
- `output/playwright/visual-audit-2026-07-14/reopen-polish/workspace-desktop.png`
- `output/playwright/visual-audit-2026-07-14/reopen-polish/workspace-mobile.png`
- `output/playwright/visual-audit-2026-07-14/reopen-polish/how-desktop.png`
- `output/playwright/visual-audit-2026-07-14/reopen-polish/how-mobile.png`

The closure pass is an implementation checkpoint, not owner aesthetic
approval. The owner should judge the exact served artifact after this update;
any further request must remain a bounded surface adjustment in this plan.

## Owner closeout checklist

Review the exact artifact at `http://127.0.0.1:3311/` at 1440 px and 390 px:

- **Art direction:** the hero, Portugal atlas, Explore media, and activity
  detail use image, contrast, and texture to orient the traveller rather than
  decorate the route.
- **Hierarchy:** the activity judgement, trade-off, time cost, and save action
  remain stronger than scenery, generic copy, or planning mechanics.
- **Depth:** linen/sage fields, dark judgement bands, media overlays, borders,
  and shadows read as intentional surface roles rather than one flat beige
  template.
- **Continuity:** composer → result → detail → saved day keeps context and
  visibly communicates selected, loading, removed, and recovery states.
- **Responsive polish:** mobile keeps the same editorial order, has no clipped
  controls or horizontal scroll, and reaches the next action before the footer
  becomes the dominant object.
- **Motion restraint:** hover, save, route, and chapter transitions feel
  tactile at normal motion settings and remain equally understandable with
  reduced motion.
- **Chapter closure:** short result sets and quiet explanatory routes end in a
  purposeful, high-contrast decision surface rather than an unexplained pale
  field; actions remain distinct in the accessibility tree.

If the only disagreement is the amount of quiet breathing space after a
settled result/detail chapter, record it as a measured spacing adjustment in
this plan; do not reopen the archived redesign checklist.

### Evidence added — 2026-07-14

- `output/playwright/visual-audit-2026-07-14/final-matrix-*.png` — 36 final
  desktop/mobile route captures, including public, planner, utility, legal,
  vault, and console pipeline surfaces;
- `output/playwright/visual-audit-2026-07-14/final-selected-explore-1440.png`
  — saved-activity feedback state with the live day tray;
- `output/playwright/visual-audit-2026-07-14/followup-home-1440-v2.png`
  — post-fix home capture showing distinct regional bento media and the lazy
  image fallback rendered in the exact 3311 artifact;
- `output/playwright/visual-audit-2026-07-14/closeout/explore-empty-mobile-v2.png`,
  `explore-saved-mobile-v2.png`, `detail-desktop-polish-v2.png`, and
  `detail-mobile-polish-v2.png` — post-spacing and chapter-closure captures;
- `output/recheck-_nonexistent.png` and `output/recheck-_offline.png` — fresh
  post-restart 404 and offline recovery captures with the shared Rumia shell;
- 72 Axe route/viewport runs — zero serious/critical violations and zero
  horizontal overflow;
- performance sample — non-map JavaScript remained below 330 KB and the
  Portugal media-heavy route remained below the 2.5 MB total budget;
- production build, web typecheck, focused web tests, UI suite (213 tests),
  API route tests, and `git diff --check` are green.

## Product boundary

Rumia answers:

> I am already going there. What is genuinely worth doing with the time I have?

The public journey remains:

```text
activity situation → judged results → detail → save → chosen day → shape day
```

Non-negotiable constraints:

- Portugal-wide coverage remains the product promise.
- Activity judgement, trade-offs, and practical context outrank itinerary
  mechanics or scenery.
- No booking, accommodation search, travel-agency positioning, or chatbot UI.
- AI remains backstage.
- Maps and 3D remain optional, user-triggered, list-first enhancements after
  the core decision flow is stable.
- Console/operator routes remain calm and information-dense, not cinematic.

## Assumptions and risks

- The current dirty worktree is intentional. Implementation must not reset,
  clean, or overwrite unrelated changes.
- Current functional behavior and route contracts are the baseline to preserve.
- Local media already has provenance metadata; new media requires the same
  source, creator, licence, crop, alt, focal point, and local-file record.
- A visual-regression pass cannot declare aesthetic completion. Owner review is
  a separate gate.
- Heavy media, reveal effects, and future maps can harm LCP, battery, and data
  use; every enhancement needs a poster/static fallback and budget.

## Visual north star

Rumia should feel like a contemporary Portuguese field guide: confident
editorial judgement, cinematic place when it helps orientation, precise
cartographic annotation, and quiet tactile controls.

Use four composition roles rather than four universal page colors:

1. **Place:** full-bleed or wide media only when atmosphere helps a decision.
2. **Judgement:** dark or high-contrast band binding verdict, caveat, and action.
3. **Dossier:** light paper-like surface for evidence and practical facts.
4. **Utility:** restrained neutral shell for forms, account, and operations.

The contour motif becomes a supporting texture, not the default full-page
background. No route may rely on one flat pale field from header to footer.

## Component and token work

### A. Typography

- Define named responsive tokens for hero display, page display, section title,
  verdict, lead, body, label, metadata, and action.
- Keep 45–75 character reading measures for prose.
- Reduce mobile display sizes before they force awkward two-word lines.
- Keep mono metadata short and increase legibility where all-caps tracking is
  currently too faint.

### B. Spacing and layout

- Keep a 4/8 base rhythm with route-level chapter gaps at 48, 64, 96, and 128.
- Define `content`, `reading`, `dossier`, and `wide-media` max-widths.
- Replace arbitrary page min-heights with content-driven chapter spacing.
- Create compact and full footer variants; mobile uses the compact hierarchy.

### C. Color, surface, and depth

- Tune sage away from a near-uniform mint wash and linen away from a universal
  beige fallback.
- Add named judgement, dossier, media-overlay, and operator surfaces.
- Use one shadow family and one border family; do not stack blur, glass, border,
  and shadow on the same object without a documented reason.
- Verify contrast in normal, hover, focus, disabled, and over-media states.

### D. Media and graphics

- Use one media system for photographs, illustrations, captions, credit, focal
  point, poster, and fallback behavior.
- Replace the homepage's placeholder-like gradient card and mismatched feature
  media.
- Add media only where it changes understanding; quiet service/legal pages do
  not need scenic backgrounds.
- Keep all media local and provenance-backed. No hotlinks.

### E. Interaction and motion

- Define control response at 160–220 ms and chapter/route continuity at
  300–450 ms.
- Add a shared activity-card-to-detail continuity pattern where supported.
- Make save, remove, undo, replace, selected, and progress states visibly clear.
- Pause offscreen media; disable non-essential motion for reduced motion/data.
- Never hide information behind hover or animation.

## Phased implementation

### Phase 0 — Baseline lock and visual contract

**Purpose:** make implementation reviewable before changing visuals.

1. Record the exact commit/worktree, server command, URL, viewport set, fonts,
   and media manifest used for the baseline.
2. Keep the 13-route desktop/mobile screenshot set from the audit.
3. Add a one-page design contract or Storybook/preview route showing typography,
   surfaces, buttons, cards, chips, form controls, feedback, and motion states.
4. Define visual budgets: no horizontal overflow, 44 px targets, 200% zoom,
   LCP below 2.5 s on the agreed profile, CLS below 0.1, and no autoplay bytes on
   routes that do not use cinematic media.

**Exit:** implementation has an agreed before-state and shared visual grammar.

### Phase 1 — Shared shell, typography, surfaces, and primitives

**Purpose:** remove the repeated flat-template feeling at the system level.

1. Refactor global tokens and chapter roles in `packages/ui/src/styles.css` and
   `apps/web/app/globals.css`.
2. Update header/nav rhythm, responsive menu, focus treatment, and active state.
3. Create full and compact footer compositions; shorten the mobile footer.
4. Refine button, text-link, choice-card, dossier-card, chapter-heading,
   editorial-media, status, and empty-state variants.
5. Add a reusable `JudgementPanel`, `DossierGrid`, `ChapterBand`, and
   `EditorialAction` only if the route work proves those abstractions repeat.
6. Verify all primitives in default, hover, focus, active, selected, loading,
   success, error, disabled, and reduced-motion states.

**Exit:** shared primitives demonstrate hierarchy without relying on route copy.

### Phase 2 — Homepage and Portugal discovery

**Purpose:** establish the strongest public art direction and acquisition flow.

#### Homepage

1. Recompose the hero around one headline, one short explanation, and one
   unmistakable primary action.
2. Keep phrase-led intent entry, but subordinate its editing controls until the
   user engages.
3. Reduce or reposition the field note so it does not compete with the CTA.
4. Remove the oversized empty gap after the three-step explanation.
5. Rebuild the feature collection as a consistent media-led editorial chapter;
   remove the blank gradient treatment.
6. Give save/explore feedback a visible transition and reduced-motion fallback.

#### Portugal

1. Preserve the atlas strength while varying card composition and density.
2. Use the Douro image as a real chapter transition, not an isolated banner.
3. Make region/activity choice and time trade-off more prominent than the map
   motif.
4. Add a clear closing decision back into Explore.

**Exit:** the first two public routes feel related, distinctive, and complete at
desktop and mobile without a decorative map dependency.

### Phase 3 — Explore, activity detail, and chosen day

**Purpose:** make judgement and save continuity the product's strongest flow.

#### Explore

1. Bind the intent composer, result count, active filters, and day summary into
   one responsive decision layout.
2. Make cards visibly distinguish verdict, fit, trade-off, time, and save state.
3. Use animation only to preserve selection/filter context.

#### Activity detail

1. Combine title, verdict, disqualifying trade-off, time cost, and save/replace
   control in one coherent decision zone.
2. Recompose practical facts into a scannable dossier on mobile and desktop.
3. Add nearby alternatives/pairings before any optional map preview.
4. Keep editorial evidence legible but visually secondary.

#### Workspace

1. Replace empty desktop dead space with a compact visual explanation or one
   recommended starting action, not filler.
2. Give saved activities clear order, time cost, conflict, remove, undo, and
   shape-day states.
3. Make the day summary sticky only when it helps and non-dominant on mobile.

**Exit:** users can move from result to detail to saved day without losing
context or wondering what changed.

### Phase 4 — Planner and saved-plan editing

**Purpose:** make planning feel like curating a day, not completing a generic
multi-step form.

1. Remove duplicated trip summaries from `/planner`.
2. Make the current activity/day decision the focal object; progressive-disclose
   secondary settings.
3. Replace undifferentiated gray choice cards with Rumia-owned choice variants
   showing selected state and consequence.
4. Reduce repeated editable rows in `/trip/new` through grouped sections,
   summary/edit modes, and clearer change feedback.
5. Preserve all current URL, persistence, auth, and fallback behavior.

**Exit:** one next action and one context summary are obvious at every planner
step on desktop and mobile.

### Phase 5 — Quiet public routes and authentication

**Purpose:** prevent support/content routes from looking like unfinished
templates.

1. Rebuild how-it-works as an annotated decision sequence.
2. Rebuild pricing as a compact comparison ledger with free-first hierarchy and
   honest unavailable/future states.
3. Turn feedback into a direct outcome flow with selected-day context when
   available and a concise empty state when not.
4. Turn support into a task index with clear recovery and boundary sections.
5. Refine sign-in into a clear labelled form inside the daybook composition;
   shorten the mobile trust panel and add strong error/loading/success states.
6. Apply the same quality bar to offline, error, not-found, privacy, terms, and
   sustainability without adding unnecessary cinematic media.

**Exit:** every quiet route has a recognizable purpose, visible action, and
intentional composition; none is merely a title over a contour field.

### Phase 6 — Operator and secondary product surfaces

**Purpose:** improve scanability without importing marketing spectacle.

1. Tighten console layout density, lane navigation, status semantics, counts,
   filters, empty states, and mobile overflow cues.
2. Review admin, reviewer, account, vault, itineraries, checkout, guide, B2B,
   and beta routes for token drift and shared-state coverage.
3. Remove obsolete glass/pill/card variants where they conflict with the new
   utility grammar.
4. Keep short legal/promise pages inside the shared document frame and give
   empty saved-plan states an authored explanation plus one next action.

**Checkpoint:** public secondary routes, console surfaces, legal pages, and the
empty vault now share tokens and accessibility behavior while retaining
purpose-appropriate density. A seeded authenticated reviewer/admin session is
still required for the final operator visual proof.

### Phase 7 — Motion, accessibility, performance, and final acceptance

**Purpose:** finish the product as an exact artifact, not a source-code claim.

1. Test keyboard order, focus visibility, screen-reader names/statuses, 200%
   zoom, touch targets, and error recovery on the complete core flow.
2. Verify reduced-motion and reduced-data variants for every reveal/media
   component.
3. Run unit, lint, typecheck, production build, accessibility, performance,
   viewport, console, and visual suites.
4. Capture the same 13 routes at 1440 x 900 and 390 x 844 plus key selected,
   loading, error, saved, and sheet states.
5. Conduct a user-level visual review in order: homepage → explore → activity →
   save → workspace → planner → sign-in → feedback.
6. Keep the plan open until explicit aesthetic approval. Do not use screenshot
   count or test count as a substitute for that approval.

**Exit:** all quality gates are green and the owner explicitly accepts desktop
and mobile aesthetics on the exact candidate artifact.

## Explicitly deferred

- Ambient video expansion beyond the existing bounded media tranche.
- Homepage 3D, automatic map tours, or map-first navigation.
- Map Phase 2 camera storytelling and Phase 3 building/terrain exploration
  until the provider, licence, attribution, privacy, quota, fallback, and
  performance gates are approved.
- New booking, accommodation, chat, marketplace, or concierge functionality.
- Backend, auth, database, deployment, or public-ingress changes not required
  to render the approved frontend.

## Likely files to modify

### Shared system

- `packages/ui/src/styles.css`
- `packages/ui/src/components/{button,card,choice-card,chapter-heading}.tsx`
- `packages/ui/src/components/{shell,app-layout,empty-state}.tsx`
- `packages/ui/src/components/{editorial-media,cinematic-media,reveal-section}.tsx`
- `packages/ui/src/components/{navigation-sheet,option-sheet,side-sheet}.tsx`
- `packages/ui/src/index.ts`
- `apps/web/app/globals.css`
- `apps/web/app/_components/{top-nav,site-footer,public-route-layout}.tsx`

### Public decision journey

- `apps/web/app/(marketing)/page.tsx`
- `apps/web/app/(marketing)/_components/*`
- `apps/web/app/(marketing)/portugal/{page,portugal-atlas}.tsx`
- `apps/web/app/(marketing)/explore/{page,activity-explorer}.tsx`
- `apps/web/app/(marketing)/explore/workspace/*`
- `apps/web/app/(marketing)/activities/[activityId]/*`

### Planning and saved work

- `apps/web/app/planner/_components/planner-single-screen.tsx`
- `apps/web/app/(app)/trip/new/*`
- `apps/web/app/(app)/trip/[tripId]/*`

### Quiet and utility routes

- `apps/web/app/(marketing)/{how-it-works,pricing,feedback}/*`
- `apps/web/app/{support,sign-in,offline,error,not-found}.tsx`
- `apps/web/app/{privacy,terms,sustainability}/page.tsx`

### Operator surfaces

- `apps/web/app/console/_components/*`
- `apps/web/app/console/pipeline/_components/*`
- `apps/web/app/_components/operator-loading.tsx`
- affected admin/reviewer/account utility components after a drift audit

### Evidence and tests

- adjacent unit tests for every changed component/route
- `apps/web/playwright/tests/{visual,accessibility,perf}.spec.ts`
- visual snapshots only after intentional review
- `apps/web/content/asset-manifest.json`
- `scripts/check-assets.mjs`
- `docs/reviews/` and `docs/superpowers/PLAN-INDEX.md`

## Quality gates

At the end of each phase:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run focused browser gates for the changed routes before the full final matrix.
The final candidate must also pass:

- no browser console errors or unexpected warnings;
- no horizontal overflow at 390, 768, 1024, and 1440 widths;
- 44 px pointer targets and visible keyboard focus;
- reduced-motion and reduced-data checks;
- accessibility scans plus manual keyboard checks;
- LCP, CLS, and media-byte budgets;
- explicit desktop/mobile visual approval.

## Rollback

- Implement by bounded route/system phases with separate commits or worktree
  checkpoints.
- Preserve the current screenshot set and exact artifact as the visual baseline.
- Keep media additions manifest-backed and removable without breaking content.
- Gate new motion and spatial enhancement so they can be disabled independently.
- If a phase fails behavior, accessibility, or performance gates, revert only
  that phase; do not roll back unrelated dirty work or the VPS/Lumes boundary.

## Completion definition

The frontend is complete only when:

1. the activity-first Portugal promise is obvious within five seconds;
2. the full core flow retains context and clear feedback;
3. public routes have distinct but coherent chapter compositions;
4. quiet, planner, and operator routes no longer look like unfinished variants;
5. motion improves continuity and has equal non-motion alternatives;
6. all functional and technical gates are green; and
7. the exact desktop/mobile candidate receives explicit aesthetic approval.
