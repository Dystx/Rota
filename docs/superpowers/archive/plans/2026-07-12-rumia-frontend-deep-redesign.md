# Rumia frontend deep redesign and polish plan (archived implementation history)

> **Canonical frontend plan.** This document consolidates the former UI
> correctness plan, aesthetic companion, foundation slice, and implementation
> checklist. It is subordinate to the activity-first product plan and does not
> change Rumia's product boundary, backend, or release order.
>
> **Status (2026-07-13):** the approved frontend redesign and cinematic tranche
> is implemented, built, and verified locally and on the private VPS loopback
> release. **Private release acceptance is green; public ingress remains
> deferred** by owner decision. Shared public and
> operator foundations are implemented:
> semantic page fields, deterministic editorial texture,
> offline/recovery/loading surfaces, a useful empty desktop day rail, and a
> texture-free linen operator field. The first art-direction slice is present:
> the homepage has a small owned editorial image anchor, Portugal activity-edition
> kicker, and trust rail; the explorer uses numbered dossier cards with an
> explicit trade-off column; the planner uses one responsive brief/context/
> action composition; and the console uses a dense linen operator shell. These
> are implementation milestones, not proof that the site meets the intended
> premium visual bar.
> The cinematic-media tranche is now implemented in the private release: the
> home cover and Portugal chapter use local poster-backed motion derivatives,
> while Explore, activity detail, workspace, and planner use poster-only
> contextual media.
> A follow-up art-direction correction is now implemented locally as well:
> `/portugal` has an authored full-width Douro field-note
> chapter, `/sign-in` has a responsive private-daybook composition instead of
> a flat centered form, and the mobile navigation affordance has a visible
> 44px target, transition, and complete sign-in action. These are composition
> changes, not only token or snapshot updates, so they are tracked in
> checkpoint 13.2.
> The merged implementation commit `2a8c39464390a2bfda0a62edfffc33b9af3ab920`
> is pushed to `Dystx/Rota` main and deployed privately on the VPS as release
> `20260713T042000Z-main-2a8c394`; the local and remote standalone server
> entrypoints share SHA-256 `6c3fa489c72e7f8f160af78b2831b83bfea5a7eba8cbd62a209d811a0ea51608`.
> The latest private refresh is release `20260713T204125Z-cinematic-fix`,
> built from the approved current worktree and verified through the loopback
> tunnel; it restarts only `rumia-web.service`.
> The proof-rail, pricing hierarchy, chosen-day editor, saved-traveler surface,
> and utility recovery slices are included in that release. The
> saved surface pass covers `/account`, `/trip/[tripId]`, `/trip/[tripId]/map`,
> and `/trip/[tripId]/export`: activity-first labels, reduced hero dominance,
> explicit spatial/export language, removal of booking-source cards, and a
> keyboard-discoverable map details panel. Remaining external work is the map provider/legal gate
> and owner-controlled public ingress; the activity-map browser boundary now
> accepts a reviewed style endpoint and attribution configuration without
> enabling any provider. A private standalone canary also rendered the
> self-hosted Protomaps preflight with visible attribution and zero browser
> console errors; route-level frontend gates are fresh.

**Current checkpoint (2026-07-13):** the approved redesign and cinematic
tranche is implemented, fully tested, and reviewed against a fresh exact
artifact at `http://127.0.0.1:3309/` and the private VPS tunnel at
`http://127.0.0.1:33302/`. It was built from the intentional dirty worktree on
`main @ 4b394905` with explicit local PostgreSQL/Better Auth environment
values. It includes the activity-detail save action, chosen-day empty/shape
actions, activity-first homepage collection copy, direct-planner context
language, editorial console vocabulary, feedback/support proof rails, the
responsive console data-source banner, shared contour/page-entry styling, a
single-main feedback landmark, concise mobile-safe result-card actions, and
the Base UI-backed navigation, choice-sheet, and utility side-sheet wrappers.
The cinematic artifact review passed 26 desktop/mobile route/viewport pairs;
the fresh behavior-wrapper artifact was then smoke-tested across representative
public, planner, workspace, and activity mobile routes with one H1, one main,
no overflow, and no console/page errors.
The current dedicated gates are 179 unit files/900 tests, 63 accessibility
passes with one documented mobile skip, 72 visual passes, 14/14 performance,
the asset/motion/diff checks, and a production build emitting 64 routes. The
cinematic live autoplay, reduced-motion poster, console-error, and media-byte
smokes are green. Private release `20260713T204125Z-cinematic-fix` is active on
Rumia loopback `127.0.0.1:3002`; remote route/flow smoke is green and the Lumes
listener on port 3001 remains unchanged. Public `rumia.pt` ingress and
map/provider/legal enablement remain deferred; no Caddy or public-DNS change
was made.

## 1. Authority and plan reconciliation

| Authority | Owns | Relationship to this plan |
| --- | --- | --- |
| `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md` | Product promise, Portugal-wide activity scope, non-goals, release order | Non-negotiable parent plan |
| `docs/superpowers/specs/2026-07-10-rumia-activity-curation-design.md` | Activity fields, editorial judgement, review eligibility, user-facing boundaries | Domain contract |
| `docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md` | Map phases, list fallback, route truth, attribution, licensing | Spatial contract consumed by Phase 7 |
| `docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md` | VPS-native runtime, Better Auth, PostgreSQL/Drizzle, deployment boundaries | Runtime contract; no frontend plan may replace it |
| `docs/superpowers/archive/plans/2026-07-11-rumia-vps-self-hosted-migration.md` | Migration and deployment implementation | Archived infrastructure workstream |
| `docs/superpowers/plans/2026-07-12-rumia-map-phase2-3-unblock.md` | Technical map preparation and open owner/legal gate | Supporting spatial release packet |
| `docs/superpowers/specs/2026-07-12-rumia-frontend-aesthetic-rework-design.md` | Approved visual language and interaction principles | Design source for this execution plan |
| `docs/reviews/2026-07-11-rumia-browser-ui-review.md` | Browser findings and visual evidence | Evidence source to rerun, not an authority by itself |

The superseded route-first, itinerary-first, Supabase, and duplicate frontend
plans are preserved under `docs/superpowers/archive/`. They are historical
context only and must not be used to reopen product or stack decisions.

## 2. Product boundary that must survive the redesign

Rumia is a digital-first Portugal activity guide and curation layer:

> **I am already going there. What is genuinely worth doing with the time I
> have?**

The core journey is:

```text
activity situation → judged results → compare → save → chosen day → shape the day → optional spatial view
```

The activity list, editorial verdict, practical facts, and explicit user
choices remain authoritative. Rumia is not a booking platform, hotel finder,
destination chooser, travel agency, global directory, generic itinerary
generator, or chatbot. The map and 3D work are progressive enhancements and
must never become the homepage's first decision.

Portugal-wide coverage remains the launch scope. A deeper Porto/Northern
Portugal corpus is acceptable as an editorial starting point, but the UI must
not imply that Rumia is Porto-only.

## 3. Evidence-led diagnosis

### 3.1 Historical P0 — source and browser artifact were not the same thing

The earlier visual review used `http://127.0.0.1:3302/` through the SSH tunnel
to the VPS's HTTP-only Rumia listener. The visible artifact still showed:

- an old globe-first homepage with world labels and public-3D/map controls;
- an old `/planner` chapter with “Advanced day planning” language;
- mobile versions of the same stale composition.

The current source contract instead requires a quiet Portugal context, a
phrase-led activity decision, and a secondary chosen-day planner. This was a
stale-artifact finding, not the current source baseline. Therefore:

1. Do not accept screenshots from 3302 as current-source evidence until the
   release artifact is rebuilt and deployed from the active worktree.
2. Record the build commit, service path, port, and browser URL with every
   visual run.
3. Keep the Rumia/Lumes boundary intact: Rumia remains loopback `127.0.0.1:3002`;
   Lumes remains unchanged on `0.0.0.0:3001`.
4. Use HTTP for the current loopback service unless TLS is explicitly added;
   `https://127.0.0.1:3002` is not a valid visual target today.

**Exit:** the browser-rendered homepage and planner copy match the checked-out
source, and a stale-build check can identify the served commit. This exit is
proven on the rebuilt standalone artifact and on the private VPS release
through the temporary `127.0.0.1:33302` tunnel.

### 3.2 P1 — the visual system is not yet expressed as a shared background system

The repository has semantic colors and a grid-pattern token, but most page
roots still render flat `linen`/`sage` fills. The result is technically clean
but visually unfinished: long pages lack chapter pacing, quiet states feel
empty, and the homepage/source/remote artifact can disagree about atmosphere.

The fix is not random decoration. Implement named, deterministic surface
variants (`linen`, `sage`, `midnight`, `ochre`) with a restrained texture
utility, then apply them by semantic chapter. Texture is CSS or small inline
SVG only, static, low-opacity, and disabled for dense operator tables and
reduced-motion/data-saver contexts.

**Exit:** representative routes have deliberate surface treatment in source,
texture does not reduce contrast, and no page invents a one-off background.

### 3.3 P1 — public and chosen-day hierarchy needs one art direction

Preserve the strong serif/sans/mono voice, but enforce this grammar:

```text
kicker → headline → dek → judgement/evidence → action → source/context
```

The first viewport must answer what Rumia wants the traveller to decide, why it
matters, and what to do next. `/explore` and activity details should expose the
verdict before secondary facts. `/explore/workspace` should make a selected day
feel composed rather than a blank utility panel. `/planner` should read as
“Shape a day” and explain pacing, mobility, buffers, and consequences.

### 3.4 P2 — quiet routes need useful editorial pacing

Support, how-it-works, local expertise, human review, pricing, offline, sign-in,
and empty workspace states should not be padded with decorative cards. Each
must have one useful evidence or recovery block, a clear next action, and a
visible colophon/boundary note when trust depends on it.

### 3.5 P2 — state feedback and mobile composition must be first-class

Save, remove, restore, replace, share, loading, error, conflict, map fallback,
and reduced-motion states need visible text and live-region semantics. Fixed
mobile trays must reserve safe-area space and never cover the primary action.
Hover can add context but can never be the only way to discover a verdict,
fact, or action.

## 4. Design system contract

### 4.1 Semantic surfaces

- **Linen:** reading, collections, activity dossiers, support/legal.
- **Sage:** discovery, comparison, empty, feedback, and recovery.
- **Midnight olive:** chosen-day composition and focused planning.
- **Ochre:** selected judgement, consequence, and next-action emphasis.

Depth uses borders, tonal shifts, and at most one restrained shadow level per
variant. Do not combine glass, heavy shadows, pills, and editorial rules
without naming the component variant.

### 4.2 Typography and spacing

- One display serif, one sans for body/UI, and mono only for short metadata.
- Named tokens for kicker, display, lead, body, label, metadata, and action.
- A 4/8 rhythm: `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- Reading measure roughly 45–75 characters where the layout permits.
- One visible H1 and one `main` per route; sequential H2/H3 hierarchy.
- Practical primary targets are at least 44px; focus remains visible at all
  widths and 200% text resize.

### 4.3 Graphic and asset direction

- Prefer one strong owned/licensed Portugal crop or illustration with caption
  over thumbnail grids.
- Maintain an asset manifest containing source, licence, crop, alt text, and
  refresh/expiry metadata.
- Use contour lines, cartographic annotation, azulejo-like geometry, and simple
  line illustration as Rumia-owned language; do not copy Awwwards layouts or
  the referenced `london-3d` source/composition.
- Never let an image, texture, map, or motion replace the textual judgement.

### 4.4 UI behavior foundation decision (2026-07-13)

Rumia does not need a pre-styled component kit. Its visual problem is art
direction, hierarchy, depth, and composition; replacing the existing custom
`@repo/ui` layer with a generic card library would flatten the editorial
identity. The custom tokens, surfaces, typography, spacing, Motion vocabulary,
and self-hosted Phosphor icons remain the visual source of truth.

Adopt **Base UI** incrementally as an unstyled behavior layer. It supplies
accessible, composable React primitives without imposing a visual theme, so it
can sit beneath Rumia-owned wrappers and CSS. Use it first for the behavior
that is currently easiest to get subtly wrong:

- mobile navigation sheet and focus-trapped drawers;
- activity save/replace/remove sheets;
- planner and trip-new select/combobox/popover controls;
- share/export menus and dismissible status surfaces;
- tooltips, disclosure, and keyboard-safe menu behavior.

The current one-day activity flow intentionally keeps save/remove direct and
reversible. Do not add an action sheet merely to exercise the library; reopen
that item only when a real multi-day target or replacement choice requires it.

Wrap Base UI primitives in `packages/ui` rather than importing them directly
from route files. The wrappers must preserve Rumia's 44px target contract,
semantic labels, visible focus, live status regions, safe-area spacing, and
reduced-motion behavior. Keep `motion` for the small, purposeful transitions
already defined in this plan; do not add a second animation system.

#### Library comparison and decision

| Library | Decision | Reason |
| --- | --- | --- |
| **Base UI** | **Adopt incrementally** | Unstyled, accessible, composable, and compatible with React 19, Tailwind 4, plain CSS, and Motion; adds behavior without replacing Rumia's visual language. |
| Radix Primitives | Do not add now | Strong and proven, but it would create a second primitive vocabulary beside the existing custom layer and overlaps the chosen Base UI role. Reconsider only if Base UI cannot support a required interaction. |
| React Aria Components | Targeted fallback | Keep as an option for date/combobox/drag-and-drop or internationalization-heavy controls if Base UI does not meet a concrete requirement; do not install pre-emptively. |
| shadcn/ui | Do not migrate wholesale | It is a source generator/style convention rather than a runtime behavior layer. Borrow an individual pattern only after adapting it to Rumia tokens; never run an `add --all` replacement pass. |
| Motion | Keep | Already used for controlled route, drawer, reveal, and feedback motion; no new animation dependency. |
| Phosphor | Keep | Existing self-hosted icon contract and visual consistency; no second icon set. |

#### Adoption gate

Do not add `@base-ui/react` as an unused dependency. Add it only when the
first behavior slice is implemented (recommended order: mobile navigation
sheet, then activity action sheet). Before merging that slice, verify:

1. no route imports Base UI directly;
2. wrappers retain the same tokens and editorial geometry in default,
   hover, focus, pressed, disabled, loading, error, and reduced-motion states;
3. keyboard focus/escape/portal behavior passes accessibility checks;
4. desktop and 390px captures show no hierarchy or spacing regression;
5. the bundle and route performance budget do not regress materially; and
6. the dependency is removed if the slice does not reduce custom behavior
   complexity or improve its tested accessibility contract.

This is a behavior foundation, not permission to restyle every route with kit
defaults. The visual redesign and cinematic closeout remain the active work;
the library migration follows the stable core journey rather than preceding
it.

#### First adoption slice (implemented checkpoint — 2026-07-13)

The first high-risk interaction slice is now implemented for mobile
navigation. `@base-ui/react` is installed only in `packages/ui`; the
Rumia-owned `NavigationSheet` wrapper owns the panel geometry, header, close
affordance, tokens, and motion while Base UI owns the dialog portal, focus
containment, Escape/backdrop dismissal, and return focus. `TopNav` consumes the
wrapper and preserves the existing contract of focusing the first destination
link on open. The application root now creates an isolated stacking context so
body-portal surfaces cannot be covered by local transforms or filters.

Evidence for this slice:

- focused navigation, wrapper, modal, and option-sheet tests: **7 passed**;
- full `@repo/ui` suite: **47 files / 211 tests passed**;
- `@repo/ui` and `apps/web` TypeScript checks: **passed**;
- production build with local-only runtime values: **64 routes generated**;
- fresh 390×844 browser smoke: dialog opens below the 65px header, first link
  receives focus, Escape closes, trigger focus is restored, and no console/page
  errors were emitted;
- fresh visual capture: `/tmp/rumia-base-ui-nav-open-v2.png`.

The activity save/replace action sheet remains the next adoption slice. Do not
combine it with a broad route redesign or dependency cleanup; preserve
before/after behavior and bundle attribution.

#### Choice-sheet adoption slice (implemented checkpoint — 2026-07-13)

The next bounded slice now moves the existing controlled `OptionSheet` used by
`/planner` and `/trip/new` behind the same Base UI behavior layer. The wrapper
keeps Rumia's linen surface, editorial heading, 44px close target, mobile
bottom-sheet geometry, desktop centered geometry, backdrop treatment, and
reduced-motion path. Base UI supplies the portal, inert background, focus
containment, Escape/backdrop dismissal, and dialog semantics. Because these
flows are controlled by parent state rather than a colocated
`Dialog.Trigger`, the wrapper captures the opening element and restores focus
explicitly on dismissal; this preserves the existing route contract without
reintroducing the old hand-written focus trap.

Evidence for this slice:

- focused navigation, choice-sheet, planner, and top-nav tests: **16 passed**;
- full `@repo/ui` suite: **47 files / 211 tests passed**;
- `@repo/ui` and `apps/web` TypeScript checks: **passed**;
- fresh production build with local-only runtime values: **64 routes generated**;
- fresh 390×844 browser smoke: the planner and trip-new choice sheets are
  bottom-anchored, opaque, scrollable, first choice receives focus, Escape
  closes, opener focus returns, and no console/page errors were emitted;
- fresh 1440×900 browser smoke: the same sheet is centered with stable
  editorial hierarchy and no overflow;
- visual captures: `/tmp/rumia-option-sheet-mobile-3308.png` and
  `/tmp/rumia-option-sheet-desktop-3308.png`, plus the trip-new capture
  `/tmp/rumia-trip-new-sheet-3309.png`.

The activity save/replace action sheet is deliberately deferred for the
current one-day MVP. Direct save/remove controls are already reversible,
visible, and lower-friction than inserting an extra choice surface. Reopen
that sheet only when a real multi-day target, replacement destination, or
additional action choice exists. Do not claim the Base UI adoption is
wholesale; wrappers remain the only permitted route-facing integration
boundary.

#### Utility side-sheet adoption slice (implemented checkpoint — 2026-07-13)

The shared `SideSheet` wrapper now provides the behavior foundation for the
authenticated `/itineraries` export drawer. The drawer keeps its existing PDF,
calendar, and share actions, summary block, toast/status region, and export
test IDs, while the wrapper replaces the route-local body-scroll lock, Escape
listener, backdrop handling, and focus implementation with Base UI dialog
semantics. The panel remains a right-anchored full-height linen surface with a
420px desktop cap and full-width mobile fallback. The authenticated route
redirects to sign-in in the local smoke environment, so the drawer itself is
evidenced by the focused wrapper tests and the production type/build gates,
not by an unauthenticated route claim.

Evidence for this slice:

- full `@repo/ui` suite after the wrapper: **48 files / 213 tests passed**;
- `@repo/ui` and `apps/web` TypeScript checks: **passed**;
- fresh production build: **64 routes generated**;
- fresh mobile route smoke on the new artifact: public routes returned 200 with
  one H1, one main, no horizontal overflow, and no console/page errors;
- `/itineraries` correctly redirected to `/sign-in?next=%2Fitineraries` because
  no authenticated session is present;
- `SideSheet` focused tests cover dialog naming, first-control focus, Escape,
  close primitive behavior, and opener focus restoration.

The old `Modal` component remains exported for compatibility and is not being
deleted as part of this incremental adoption. The activity save/replace action
sheet is deferred until the product has a real multi-day or replacement-choice
workflow; the current direct save/remove contract remains intentional.

## 5. Route and component inventory

### Shared primitives

Audit and refactor through named token-backed variants:

`PageShell`, `PublicRouteLayout`, `TopNav`, `SiteFooter`, `BrandMark`, `Button`,
`LinkAction`, `Icon`, `EditorialHeading`, `EditorialRule`, `FactRail`,
`PhraseComposer`, `ChoiceChipGroup`, `ChoiceCard`, `OptionSheet`, `Modal`,
`ActivityResultCard`, `ActivityDayTray`, `EmptyState`, `Skeleton`, `Toast`,
`StatusRegion`, `BackToTop`, `ImageFrame`, `EditorialFigure`, `MapPanel`, and
`MapListFallback`.

Every interactive primitive must define default, hover, focus, pressed,
selected, disabled, loading, success, error, empty, touch, keyboard, and
reduced-motion behavior.

### Route groups

| Group | Routes | Primary redesign job |
| --- | --- | --- |
| Public cover/atlas | `/`, `/portugal`, `/how-it-works` | Establish activity judgement, Portugal context, and trust |
| Decision index | `/explore`, `/activities/[activityId]` | Make verdicts and trade-offs scannable |
| Chosen-day editor | `/explore/workspace`, `/planner`, `/trip/new` | Preserve choices and shape a practical day |
| Saved traveler | `/trip/[tripId]`, map, export, account, vault | Keep saved state authoritative and recoverable |
| Trust/utility | `/local-expertise`, `/human-review`, `/pricing`, `/support`, `/offline`, legal, sign-in | Explain boundaries and next actions |
| Operations | `/console/*`, `/admin/*`, `/reviewer/*` | Dense, task-oriented, keyboard-safe surfaces |

## 6. Phased implementation plan

Each phase is a vertical slice. Do not begin the next phase until its exit
criteria and the relevant focused tests are green.

### Phase 0 — Artifact truth and visual baseline

**Purpose:** remove stale-build ambiguity before judging aesthetics.

**Work:**

1. Build from the active worktree with the documented production command.
2. Restart only the Rumia service/tunnel; leave Lumes untouched.
3. Verify homepage, `/explore`, `/explore/workspace`, `/planner`, `/support`,
   `/sign-in`, and one activity detail route at 1440×900 and 390×844.
4. Capture the served commit, HTTP URL, response headers, and browser console.
5. Mark every route `source-match`, `source-mismatch`, or `blocked`; do not
   refresh visual snapshots on a mismatch.

**Likely files:** deployment/runbook evidence, browser scripts, route matrix.

**Exit:** source and browser agree; old globe/planner copy is either removed
from the served artifact or recorded as a deployment blocker.

**Current evidence:** rebuilt standalone artifact on `127.0.0.1:3003` from this
worktree shows the activity-first Portugal homepage, judged explore surface,
chosen-day workspace, and secondary planner. Representative desktop/mobile
screens were checked after static/public assets were copied beside the
standalone server; browser console error scan was empty and support measured one
`main` landmark with zero horizontal overflow.

### Phase 1 — Shared visual foundations and backgrounds

**Purpose:** make the redesign visible everywhere without changing product
behavior.

**Work:**

1. Add named typography, spacing, border, focus, surface, texture, and motion
   tokens in `packages/ui/src/styles.css` and `apps/web/app/globals.css`.
2. Add reusable `Surface`, `EditorialHeading`, `EditorialRule`, `FactRail`,
   `ImageFrame`, and `StatusRegion` variants where missing.
3. Add a deterministic texture utility (contour/grid/radial, low-opacity) and
   apply it only to semantic page roots; keep operator density flat.
4. Normalize `PageShell`, public shell, nav, footer, skip link, route title, and
   mobile safe-area behavior.
5. Replace literal icon-font output with SVG `Icon` paths and accessible names.

**Focused verification:** primitive tests, shell tests, contrast checks,
`qa:motion-gate`, 390px overflow, and fresh route captures.

**Exit:** no public page relies on an unexplained flat fill or one-off token;
texture is subtle, deterministic, contrast-safe, and removable by one class.

**Implementation status:** semantic surfaces now live in `AppLayout` and
`PageShell`, with explicit `data-surface` and `data-surface-texture` fields.
Marketing discovery defaults to sage, reading pages to linen, focused planning
to midnight, and dense operator screens disable texture. Root, route-group,
offline, legal, sign-in, not-found, and error/loading states use the same
surface contract. The desktop empty activity rail now explains how to start a
day and stays hidden from the mobile fixed-tray path.

Operator cohesion is now explicit as well: `OperatorShell` and admin/reviewer
`PageShell` variants use a dense, texture-free linen field. Midnight remains
reserved for planning chapters that opt into inverse editorial typography.

### Phase 2 — Public editorial journey

**Purpose:** make the product proposition visually decisive.

**Work:**

1. Homepage: activity situation first, quiet Portugal context second, no
   globe controls/3D dependency in the first decision layer.
2. Portugal: activity collections and region/weather/time/group indexes, not
   route archetype cards.
3. Explore: annotated judgement index with time rail, save/remove feedback,
   and a transparent day tray.
4. Activity detail: verdict, best-for, time, timing/crowd trade-off, pairings,
   alternative, evidence, and one next action.
5. Long public pages: tighten the first viewport with one useful evidence or
   decision block rather than ornamental filler.

**Exit:** a new traveller can state a situation, understand a judgement, save
   an activity, and reach the workspace at desktop/mobile without map use.

**Implementation status:** the first art-direction slice is now in the active
worktree. The cover uses a restrained owned Portugal illustration as an
atmospheric anchor while keeping the phrase composer as the only task; its
proof rail states Portugal-wide, activity-first, and no-paid-ranking
boundaries. Explorer results now read as editorial dossiers with sequence
markers, a visible trade-off column, a composed save action, and a fact rail.
Activity detail now follows the same grammar: region kicker, oversized title,
verdict-first judgement, a fact rail, explicit trade-offs, and a source
colophon. Portugal collections now use an atlas intro/proof rail, coverage
facts, and numbered collection covers rather than an undifferentiated grid.
The chosen-day workspace selected state also uses numbered choice cards with a
practical-shape aside, explicit removal control, and a fact rail; its empty
state remains the recovery path.

The next editorial pass adds a reusable proof rail to the long-form
`/how-it-works` and `/local-expertise` surfaces. It puts the product boundary,
selection standard, and control promise in the first reading sequence, reducing
desktop dead space without adding decorative content or changing the activity
journey. The rail is a semantic definition list and stacks cleanly on mobile.

Pricing now uses the same rail and labels each tier as Included, Optional, or
Future access. This keeps the current free-first boundary visible before the
price rows and prevents the waitlisted concierge idea from reading like a live
product.

### Phase 3 — Chosen-day continuity and planner polish

**Purpose:** make the selected day feel like the same product.

**Work:**

1. `/explore/workspace`: composed empty, selected, loading, error, conflict,
   saved, share, feedback, remove, and undo states.
2. `/planner`: direct entry remains truthful and secondary; selected mode says
   “Shape your chosen day,” shows selected activities before timing/transport,
   and explains practical consequences.
3. `/trip/new` and saved-trip surfaces preserve activity IDs/order and visible
   version state through sign-in/claim.
4. Ensure fixed mobile tray safe-area padding and no obscured primary action.

**Exit:** no selected activity disappears between explore → workspace →
planner → sign-in → saved trip; list/agenda remains complete without motion or
map interaction.

**Implementation status:** `/trip/new` now reads as a secondary saved-plan
editor rather than a route or concierge wizard. Its hero leads with activity
selection and a clear Explore hand-off; the review card uses activity-first
labels, explicit edit affordances, a truthful no-booking boundary, and a
mobile-safe layout; the supporting rail explains pace, local context, and user
control without promising an audit or automated concierge. Its current-source
desktop/mobile captures report one H1, zero horizontal overflow, zero serious/
critical axe findings, and zero browser console errors. The underlying
`/api/trips` contract is unchanged.

The saved-traveler surface slice is now implemented in the current worktree.
The account shelf speaks in saved plans and activities, the trip workspace
reduces the cinematic hero's empty dominance and uses plan/agenda/spatial
language, the spatial view removes booking-source cards and keeps the list
authoritative, and export uses carry/share language with explicit
locked/unlocked states. The map details panel is a keyboard-discoverable
labelled region, and an unsourced/partial route now uses an intentional
schematic map with its geometry status inside the details panel instead of an
empty renderer canvas. The source artifact is locally verified at 1440×900 and
393×852 with one H1, zero horizontal overflow, zero browser console errors,
and zero serious/critical axe findings. This slice is included in the merged
main private release.

### Phase 4 — Motion, feedback, and accessibility polish

**Purpose:** make interaction feel responsive and trustworthy.

**Work:**

1. After the core visual states are accepted, introduce the Base UI behavior
   slice described in section 4.4 for the mobile navigation and activity
   action sheets; keep route files on Rumia-owned wrappers.
2. Define a small vocabulary: fade, lift, underline, rail reveal, and camera
   focus. Tokenize duration/easing; keep state updates immediate.
3. Add live status text for save/remove/restore/replace/share/loading/error and
   preserve focus on the initiating control.
4. Make hover/focus enhancements optional; no essential meaning is hover-only.
5. Honor reduced motion in CSS, React transitions, and map camera options.
6. Validate keyboard, touch, VoiceOver/NVDA-equivalent semantics, 200% text,
   and 390px no-overflow behavior.

**Exit:** every motion has a text/state equivalent and a reduced-motion trace;
   no serious/critical accessibility finding remains.

**Current evidence (2026-07-13):** shared status regions, focus-safe state
transitions, and reduced-motion behavior are covered by focused UI/web tests
and the motion gate (448 files scanned). Dedicated accessibility is green at
61 passed with one expected mobile h1-sweep skip. The latest authenticated
smoke run is green at 303 passed with 33 expected skips after the activity-detail
route was added.

### Phase 5 — Utility, account, and operator cohesion

**Purpose:** remove the feeling of separate products.

**Work:**

1. Bring support, offline, legal, sign-in, feedback, pricing, and local
   expertise into the same quiet colophon layout.
2. Keep console/admin/reviewer surfaces denser and task-oriented while reusing
   tokens, focus rings, status primitives, and iconography.
3. Remove historical itinerary, concierge, booking, and unsupported promise
   language from all first viewports.

**Exit:** every route group has one purpose, one primary action, one H1/main,
   intentional density, and recovery links.

**Current evidence:** support, offline, legal, sign-in, recovery/loading, and
feedback surfaces share the semantic field contract; admin/reviewer shells now
share the dense linen/no-texture operator treatment. Planner and console now
have the same route-scoped art direction, with refreshed desktop/mobile
captures. The full authenticated browser matrix is green at 303 passed/33
expected skips, visual at 104 passed/32 expected skips, dedicated accessibility
at 61 passed/1 expected skip, performance at 14/14, and the explicit tablet
viewport contract at 120/120.

The utility recovery slice is now refreshed in the current worktree. Offline
has a real recovery composition with connection state, cached-day truth, and
next-step guidance; feedback uses the same rounded editorial surface and
explicit selected/disabled control states; sign-in now carries a dark
private-daybook panel that explains the privacy and editorial boundaries
without adding social login or chatbot language. Auth and anonymous feedback
contracts remain
unchanged. Current-source desktop/mobile checks for `/offline`, `/feedback`,
`/sign-in`, and `/support` report one H1, one main, zero overflow, zero console
errors, and zero serious/critical axe findings.

### Phase 6 — Optional spatial enhancement

**Purpose:** add spatial understanding only when it improves an existing
   activity decision.

**Work:** consume the dedicated map spec and map unblock packet:

1. Phase 1 practical 2D map in workspace, list-first with explicit intent.
2. Phase 2 explicit itinerary camera/story controls with validated geometry.
3. Phase 3 optional terrain/building context behind separate flags, measured
   device policy, licence/attribution records, and 2D/list fallback.

No homepage WebGL, automatic tour, scroll hijack, or decorative globe is in
   scope. Production flags remain off until owner/legal/provider decisions are
   recorded in `docs/ops/rumia-map-launch-decision.md`.

**Exit:** map/list parity, attribution, licences, reduced motion, WebGL/tile
   fallback, and device/performance evidence are all green.

### Phase 7 — Release verification and visual acceptance

**Purpose:** prove the current artifact, not the intention.

**Commands:**

```bash
pnpm exec vitest run
pnpm typecheck
pnpm lint:eslint
pnpm build
pnpm qa:motion-gate
pnpm --dir apps/web test:e2e
pnpm --dir apps/web test:a11y
pnpm --dir apps/web test:visual
pnpm --dir apps/web test:perf
```

**Current evidence (2026-07-13):** the current standalone artifact builds with
the explicit local PostgreSQL/Better Auth environment; unit tests pass at
**173 files / 890 tests**, typecheck and ESLint pass, the motion/assets/
migration/safety gates pass, the production build emits **64 routes**, and the
browser gates are green at **303/336 smoke (33 expected skips), 61/62
accessibility (1 expected skip), 104/136 visual (32 expected skips), 14/14
performance, and 120/120 viewport checks**. The changed-slice suite is
**13/13**. The current exact artifact is served at
`http://127.0.0.1:3304/`; representative desktop/mobile review found no
horizontal overflow or browser console errors. The local tranche is not
deployed to the VPS.

The saved-traveler surface slice is also green on the current local
standalone: `/account`, `/trip/[tripId]`, `/trip/[tripId]/map`, and
`/trip/[tripId]/export` return 200 at desktop and mobile, each has one H1,
zero horizontal overflow, zero console errors, and no serious/critical axe
violations. The focused map-panel test and existing chosen-day tests pass.

The proof-rail slice was checked at
1440×900 and 393×852: both routes render the labelled definition list with no
horizontal overflow, zero serious/critical axe findings, and zero browser
console errors.

The previously merged artifact remains privately deployed as VPS release
`20260713T042000Z-main-2a8c394` on `127.0.0.1:3002`; the temporary Mac tunnel at
`127.0.0.1:33302` is historical and is not evidence for the current dirty
worktree. The local 3304 artifact is the current visual review target. Lumes
remains unchanged on port 3001.

**Manual evidence:** 1440×900, 1024×768, 768×768, and 390×844 captures for
`/`, `/portugal`, `/explore`, `/explore/workspace`, `/planner`, `/support`,
`/sign-in`, `/pricing`, one activity detail, one traveler route, and one
operator route; keyboard path; reduced motion; image/map/WebGL failure; browser
console; and map-free homepage network trace.

**Exit:** no source/browser mismatch, no unresolved P0/P1 UI finding, no
serious/critical accessibility issue, no unbounded overflow, truthful enabled
features, and all visual changes are explicitly accepted route by route.

## 7. Explicit exclusions

- Do not add booking, affiliate checkout, hotel/accommodation search, or
  travel-agency workflow.
- Do not add chatbot UI or open-ended itinerary conversation.
- Do not turn Portugal coverage into a single-city product.
- Do not make 3D, WebGL, terrain, video, or a large image library a homepage
  dependency.
- Do not use random/animated noise, scrolljacking, autoplay, custom cursors,
  hover-only meaning, or fake loading theatre.
- Do not change the VPS-native stack, database, auth, or persistence contract
  as part of visual polish.
- Do not blindly refresh screenshots or mark a stale deployment as a design
  regression.

## 8. Acceptance criteria

The redesign is complete only when all of the following are true:

1. The served browser artifact matches the checked-out source commit.
2. The homepage asks for an activity situation and does not load a map/3D
   dependency before explicit intent.
3. All public and chosen-day routes use the shared editorial grammar and
   semantic surface tokens; background treatment is deliberate, restrained,
   and contrast-safe.
4. `/explore` and activity detail show judgement before secondary facts.
5. Workspace/planner/saved-day continuity preserves selection, order, status,
   and recovery actions at 390px and desktop.
6. Every meaningful interaction has visible and announced success/error/
   loading/empty behavior and a reduced-motion equivalent.
7. Shared shell, icons, footer, skip link, landmarks, focus, target sizes,
   and keyboard behavior pass WCAG 2.2 AA checks.
8. Map/3D remains optional, feature-gated, attributed, licensed, measurable,
   and fully replaceable by list/2D content.
9. The quality commands and manual evidence in Phase 7 are fresh for the
   accepted artifact.

## 9. Rollback and decision policy

- Keep each phase in a route-scoped commit and preserve the prior token or
  component variant until the new baseline is accepted.
- If a visual change harms comprehension, revert the variant or surface class;
  do not alter activity data contracts or reintroduce the old route-first UI.
- If a deployment is stale, rebuild/restart the Rumia artifact; do not rewrite
  the design plan to fit stale screenshots.
- If map/provider/legal approval is missing, keep all map/3D flags disabled and
  ship the list/2D experience.
- If a background texture harms contrast or performance, remove the utility
  from the affected semantic surface without removing editorial content.

## 10. Current open decisions

- The approved dirty-worktree artifact is privately deployed on Rumia `3002`
  as release `20260713T204125Z-cinematic-fix` and was reviewed through the
  temporary `33302` tunnel. The local exact artifact remains available at
  `127.0.0.1:3304`; the remote route/flow smoke confirms parity for the
  deployed release. No public-ingress change was made.
- The baseline texture utility and owned asset manifest exist, and the current
  local artifact shows the intended semantic surfaces/contour treatment on the
  representative route sample. Automated route/viewport evidence is current;
  any release must repeat the same manifest and artifact-provenance capture gate.
- Local Playwright gates use an explicit PostgreSQL/Better Auth environment;
  production deploy evidence must still record the equivalent VPS secrets
  without committing them.
- Map owner/legal/provider/quota/GTFS decisions remain open in the launch
  packet; no production Phase 2/3 flag may be enabled.
- External public ingress (`rumia.pt`) remains deferred.

## 11. Actual visual direction for the closeout

The next implementation pass must follow this art direction. “More polish”
means applying these decisions consistently; it does not mean adding random
gradients, more cards, or a decorative 3D scene.

### North star

Rumia should feel like a **Portugal field guide that became an instrument**:
quietly confident editorial judgement, tactile paper/ink contrast, cartographic
annotation, and visible control over a day. The traveller should feel guided,
not processed by a generic SaaS wizard.

### Surface choreography

Use one named surface per chapter and one authored anchor per first viewport:

| Surface | Use | Visual treatment |
| --- | --- | --- |
| **Midnight** | Home cover and chosen-day focus | Deep olive field, warm ochre rule, faint coast/contour line, light type, one high-contrast action |
| **Sage** | Discovery and comparison | Cool green field, dark ink type, numbered dossier stack, soft warm radial at the chapter edge |
| **Linen** | Activity detail, collections, trust, utility | Warm paper field, dark editorial type, thin rules, one image/illustration crop, no empty beige void |
| **Ochre** | Judgement callout and selected state | Small deliberate accent panel or rule, never a full-page wash or decorative wallpaper |

Each chapter gets: a base color, one low-opacity texture or contour layer, one
strong foreground shape/image, and one clear next action. Do not stack the grid,
glass, heavy shadow, pill, and rule treatments on the same component.

### Typography and hierarchy

- Display serif for the claim and verdict; sans for interface/body; mono only
  for short metadata, sequence numbers, and timestamps.
- First viewport hierarchy is always:
  `kicker → headline → one-sentence reason → judgement/evidence → primary action`.
- Desktop display type is fluid and capped; mobile headings wrap to a maximum of
  three lines. Body copy stays at a readable 45–75 character measure.
- Kicker/metadata is 10–12px with generous tracking; body is 16–18px with
  1.55–1.7 leading; primary action is 14–16px semibold. Do not use uppercase
  tracking as a substitute for hierarchy.
- Use a 12-column desktop composition (reading column + fact rail + action
  rail) and a single-column mobile composition with the action immediately
  after the judgement.

### Components as visual objects

- **Primary button:** solid midnight on light surfaces or ochre on midnight;
  44–52px high, clear label, one directional icon, visible pressed/loading
  state. Never render a core action as a bare underlined sentence.
- **Editorial link:** underlined text is reserved for secondary reading,
  source, or comparison links and must not compete with the primary action.
- **Activity dossier:** sequence number, title, verdict, trade-off, fact rail,
  and one save control. Use a top rule and an ochre selection bar rather than
  a generic rounded card grid.
- **Day tray:** a compact composition summary with count, total time, next
  action, and reversible remove controls. Empty state includes an illustration
  or contour anchor plus a concrete “Start with an activity” action.
- **Fact rail:** a restrained definition list with visible labels and enough
  contrast; it should scan as evidence, not decorative microtype.
- **Forms:** conventional labels, field grouping, inline error text, and a
  single submit button. Sentence-style copy may introduce a form but must not
  replace its affordances.
- **Operator tables:** flat linen, high density, no texture, strong row focus,
  clear status chips, and no marketing hero treatment.

### Graphic language

Use Rumia-owned, licence-recorded assets only: Portugal coast/contour lines,
small route annotations, field-note numbering, editorial crops, and restrained
azulejo-like geometry. The homepage may use a slow, static-to-subtle-pan
editorial figure, but the phrase composer remains the task. Maps and 3D are
progressive workspace enhancements, not cover art.

Avoid generic SaaS blobs, stock-photo mosaics, random animated grain, cursor
tricks, autoplay, scrolljacking, and copied Awwwards or `london-3d` layouts.

### 11.1 Research-reconciled full-bleed media direction — 2026-07-13

The current artifact has the right semantic surfaces and a clear activity-first
flow, but its sense of place is still carried mostly by contour graphics and
small Rumia-owned SVG illustrations. The next visual pass needs stronger
Portugal atmosphere without turning the product into a cinematic microsite.

The research evidence and route matrix live in
[`docs/reviews/2026-07-13-rumia-full-bleed-media-research.md`](../../reviews/2026-07-13-rumia-full-bleed-media-research.md).
The decision is selective full-bleed media, not a global video background:

- **Home:** one 60–75vh Portugal image as the cover's authored place anchor;
  only after the still baseline is accepted may one silent 6–10 second loop be
  tested. The phrase composer remains the first task and its text must survive
  a missing or delayed asset.
- **Explore:** one chapter-break image or selected-filter media band between
  decision groups. Do not put a photograph behind every result card.
- **Activity detail:** a 55–65vh activity-specific hero crop with verdict,
  caption, focal point, and text-safe scrim. The image should show atmosphere
  and practical context, not merely a famous landmark.
- **Workspace:** a compact chosen-day route/atmosphere strip or per-stop
  thumbnails only after activities are saved. Empty state remains fast and
  illustrated; no autoplay.
- **Portugal/editorial pages:** region and season chapter breaks with a field
  note, giving Portugal-wide coverage a readable narrative rhythm.
- **Planner and utility routes:** an optional still poster or proof crop only;
  sign-in, feedback, support, offline, and console remain quiet and fast.

Extend the existing asset manifest rather than creating an untracked media
collection. Each public asset must record route/activity/chapter references,
responsive variants, dimensions/bytes, alt text, caption, source, licence and
URL, attribution, owner, review/expiry dates, focal point, text-safe zone,
dominant color, fallback/poster, and motion policy. Factual place imagery must
be commissioned, owned, or explicitly licensed; AI-generated depictions must
not stand in for real places.

Delivery rules are part of the design: use responsive AVIF/WebP with
`srcset`/`sizes`, reserve aspect ratio, preload only the actual first-viewport
hero, lazy-load below-fold media, and keep a solid-color/poster fallback. Any
video is silent, inline, poster-first, deferred near the viewport, and has an
MP4 fallback; the proposed 1–2 MB mobile initial budget is a product target to
validate against the existing performance gate, not a universal browser rule.
`prefers-reduced-motion` and reduced-data/low-power paths disable autoplay,
pan, and parallax while retaining the same information. No media may obscure a
verdict, practical fact, save action, or chosen-day action.

This media pass is a P1 design enhancement after the existing core flow is
stable. It does not authorize MapLibre Phase 2 camera storytelling or Phase 3
3D; those remain provider/legal/performance gated and list-first.

### Motion language

Use motion to clarify cause and effect:

- page entry: 160–220ms opacity plus 6–10px lift;
- section reveal: 40–60ms stagger, max three items at a time;
- save/remove: 180–240ms title-to-tray cue and selected-bar change;
- drawer/rail: 220ms transform/opacity with focus handoff;
- map focus: explicit `flyTo` only after user selection;
- hover: 2px lift or rule/underline change, never required for meaning.

All motion is interruptible, transform/opacity-only where possible, and has an
immediate text/state equivalent. `prefers-reduced-motion` and reduced-data
remove reveal choreography, pan, and texture without removing content.

### Route recipes

- **Home:** midnight cover, left-aligned activity question, owned Portugal
  figure/contour anchor on the right, strong button, three-item proof rail;
  follow with sage activity decisions rather than destination cards.
- **Explore:** sage discovery field, editorial dossier stack, persistent but
  compact chosen-day tray, visible save action and trade-off column.
- **Activity detail:** linen reading field, verdict first, fact rail second,
  `Save to my day` beside the verdict, comparison/source links below.
- **Workspace:** midnight header plus linen/sage day composition; selected
  activities form the visual spine; empty state has a single illustrated anchor
  and one next action.
- **Planner:** midnight practical chapter; selected activities precede timing
  and transport; “Preview this day” is the primary action and route language is
  explanatory, not product-defining.
- **Trust/utility:** linen editorial essay with a proof/recovery rail in the
  first viewport and one clear next link/action; no giant blank beige field.
- **Console/admin:** texture-free linen operator surface, dense table/queue
  hierarchy, editorial terms for evidence and review, no public marketing
  bento.

### Visual handoff and files

The likely implementation surface is:

- `packages/ui/src/styles.css` and `apps/web/app/globals.css` for semantic
  surfaces, type scale, spacing, focus, and motion tokens;
- `packages/ui/src/components/editorial.tsx`, a new
  `packages/ui/src/components/editorial-media.tsx`, `button.tsx`, `icon.tsx`,
  `packages/ui/src/components/operator-shell.tsx`, and shared page-shell/nav
  components for the primitive states;
- `apps/web/app/(marketing)/page.tsx`, `hero-editorial-figure.tsx`,
  `destination-bento.tsx`, `explore/page.tsx`,
  `explore/workspace/activity-workspace.tsx`, and
  `activities/[activityId]/page.tsx` for the public visual journey;
- `apps/web/app/planner/_components/*`, `trip/new/*`, sign-in, feedback,
  utility routes, and `apps/web/app/console/*` for flow continuity and operator
  styling;
- `apps/web/lib/content/asset-manifest.ts`,
  `apps/web/content/asset-manifest.json`, and a future
  `apps/web/public/media/` or equivalent release-managed asset root for
  responsive images, posters, and licensed video variants;
- asset manifest/provenance checks, visual captures,
  browser/a11y/motion/performance tests, and the route matrix for acceptance
  evidence.

## 12. Reconciled UI/UX closeout tranche — 2026-07-13

This tranche reopens visual acceptance without reopening completed functional
work. It is the only active frontend closeout queue.

### P0 — complete the primary flow

1. **Local complete, exact-artifact reviewed; external release gate open:** `/activities/[activityId]` provides
   a visible `Save to my day` action beside the verdict and retains the
   activity ID through the anonymous workspace handoff.
2. **Local complete, exact-artifact reviewed; external release gate open:** the save/remove state uses
   `StatusRegion`, is reversible, and remains usable without motion.
3. **Local complete, exact-artifact reviewed; external release gate open:** result-card save, workspace start/shape, planner
   context continuation, feedback empty state, and quiet-route next actions
   are now unmistakable controls. Sign-in submit is covered by the browser
   suite; external release sign-off remains in the final gate.

### P1 — align the flow with the activity-first promise

1. **Local complete, exact-artifact reviewed; external release gate open:** keep direct `/planner`
   compatibility, but make the visible path say
   “shape a chosen day” and treat destination/duration choices as practical
   context after activity selection. Remove route-generation language from
   first-viewport actions that still imply a generic itinerary generator.
2. **Local complete, exact-artifact reviewed; external release gate open:** homepage collection cards and
   `DestinationBento` explore mode now answer “what can I do?” rather than
   “where should I go?”.
3. **Local complete, exact-artifact reviewed; external release gate open:** the empty and selected workspace
   states have a clear editorial anchor,
   activity count/time summary, and one next action; avoid a large unstructured
   blank rail.
4. **Local complete, exact-artifact reviewed; external release gate open:** console pipeline labels and
   fixtures now use activity evidence, review status, freshness, and reviewer
   work rather than client itineraries; persistence keys remain unchanged.

### P1 — make the visual system visibly authored

1. **Local implementation complete; representative artifact pass:** apply the four semantic chapter
   surfaces deliberately across route groups:
   linen reading, sage discovery, midnight chosen-day, and ochre judgement.
   The current grid/radial utility is a texture accent, not the page identity;
   add contour/annotation/asset anchors where a long page needs a visual start.
2. **Local implementation complete; representative artifact pass:** shared surfaces now have a visible contour layer and a
   restrained page-entry transition plus clear hover,
   focus, pressed, selected, loading, and completion feedback. Keep every
   transition short and interruptible; reduced motion/data saver removes it.
3. **Local implementation complete; representative artifact pass:** support and feedback now use the public shell/proof rail,
   and how-it-works has a primary action; pricing, offline, and sign-in are
   covered by the current automated and representative artifact gates.
4. **Local exact-artifact pass complete; external release sign-off open:** the
   current served artifact has no remaining stray terminal punctuation in the
   activity-intent composer, no placeholder-like decorative graphics, no
   literal icon text, and the representative rails meet the current contrast
   and hierarchy checks. Confirm the same on the chosen release artifact
   before publishing.
5. **Local implementation complete; automated media gate green; release sign-off open:** the
   research-reconciled media pass in §11.1 now includes one Portugal cover,
   one activity-detail hero, and one full-width Portugal chapter image using
   local WebP/JPEG assets with manifest provenance, captions, fallbacks, and
   responsive crops. Focused tests, the production build, and the full local
   visual/a11y/performance matrix pass (104 visual, 61 a11y, and 14 performance
   checks, with the documented expected skips). Ambient video, a large image
   library, and global media backgrounds remain deferred. Manual route sign-off
   and release-artifact provenance remain open.

### P2 — design-system and responsive acceptance

1. Review the shared shell, typography, spacing, icon, button, card, rail,
   tray, and form primitives across all interaction states.
2. The exact served artifact has passed the automated 1024/768 viewport contract
   (**120/120**), visual gate (**104 passed / 32 expected skips**), a11y gate
   (**61 passed / 1 expected skip**), and representative 1440×900/393×852
   browser review. Manual route-by-route release sign-off remains the boundary;
   checks include no overflow, clipped fixed tray, weak focus, or practical
   controls below 44px.
3. The local visual, a11y, and performance gates have now been rerun and are
   green. Re-run the functional, motion, and release-artifact checks on the
   exact deployment artifact; automated green results still do not close visual
   acceptance without route-by-route manual sign-off.

## 13. Exact-artifact checkpoint — 2026-07-13

The current dirty worktree was built with explicit local-only PostgreSQL/Better
Auth environment values and served on loopback at `127.0.0.1:3304`. The root
build completed and emitted 64 static routes. The browser review used the
current artifact—not the stale VPS tunnel—and checked the homepage, explorer,
workspace, selected activity detail, direct planner, console pipeline,
feedback, support, how-it-works, pricing, offline, and sign-in at desktop and
mobile sizes. A 26-pair route sweep found 200 responses, one H1, one main, no
horizontal overflow, and no console/page errors. The reviewed slice showed the
intended semantic backgrounds, activity-first hierarchy, responsive action
ordering, and the concise `Save to this day`/`Remove from day` action. The
feedback route no longer nests a second `main`; the updated mobile Explore
baseline verifies that the visible save action does not clip. The console
data-source banner was also checked at 393px after its wrapping fix.

This checkpoint closes the local implementation/review gate for the current
slice. It does not authorize a VPS deploy, public ingress, or map Phase 2/3.
The automated route/viewport matrix is green; the remaining acceptance work is
release artifact provenance, any final manual route sign-off required by the
owner, and the explicit owner/provider/legal gates already listed in the plan
index.

### 13.1 Still-media implementation checkpoint — 2026-07-13

The first media slice is implemented locally at `127.0.0.1:3304`:

- the homepage cover uses a full-bleed Carcavelos coast photograph;
- the Porto activity detail uses a full-width cobblestone-street photograph;
- the homepage includes a Douro chapter image between the explanation and
  activity choices;
- all three assets are local WebP/JPEG files with source page, Unsplash
  licence, photographer, caption, focal point, text-safe zone, dimensions, and
  byte metadata in `apps/web/content/asset-manifest.json`;
- `EditorialMedia` provides responsive `<picture>` sources, reserved
  dimensions, priority/lazy loading, captions/credits, and decorative-media
  semantics;
- focused component, manifest, asset, typecheck, and production-build gates
  pass; fresh home/detail desktop/mobile screenshots returned HTTP 200 with no
  browser errors.
- the focused Playwright visual baselines for the home and Porto detail routes
  were intentionally regenerated for desktop and mobile and now pass;
- the full local browser gates were rerun after the media slice: visual `104
  passed / 32 expected skips`, accessibility `61 passed / 1 expected skip`,
  and performance `14/14`;
- the local route/viewport evidence is green, while manual route-by-route
  aesthetic sign-off and exact release-artifact provenance remain open.

The still baseline is not yet declared release-complete until the exact release
artifact receives manual route sign-off and provenance checks. No Unsplash
video, autoplay, map/3D change, VPS deploy, or public ingress change is
included in this checkpoint.

### 13.2 Art-direction correction checkpoint — 2026-07-13

The previous media slice improved the homepage and activity detail, but a
route review still found two surfaces that read like a styled wireframe rather
than a finished editorial product. This correction is now implemented in the
same local artifact:

- `/portugal` adds a full-width Douro terraces editorial figure between the
  coverage proof and activity collections. It supplies place, pacing, caption,
  credit, responsive crops, and a text-safe overlay without turning Portugal
  into a city-only landing page.
- `/sign-in` now uses a responsive two-column composition: a dark private
  daybook panel carries trust and boundary language, while the form remains a
  calm, readable action column. On mobile the form remains first and the trust
  panel follows it.
- The mobile top navigation now has a clear 44px icon target, stronger
  contrast, a short panel-entry transition, reduced-motion behavior, and an
  explicit sign-in action.

The focused route visual baselines for Portugal and sign-in were regenerated
only after manual screenshot inspection, then passed normally at desktop and
mobile (`4/4`). Targeted accessibility and reduced-motion checks also pass
(`6/6`). Typecheck, the production build, motion gate, asset checks, and
`git diff --check` are green for this slice. The broader matrix remains the
previously recorded `104 passed / 32 expected skips` visual result; a full
matrix rerun is not required to validate these four route changes, but release
artifact provenance and owner visual approval remain open.

This checkpoint closes the “flat public surface” defect for these routes; it
does not claim that every route is aesthetically final. The next approval is
for the user to inspect the local artifact at `http://127.0.0.1:3304/`,
`/portugal`, and `/sign-in` and either accept this art direction or identify a
specific remaining surface before another targeted pass.

### 13.3 Cinematic Portugal atlas checkpoint — 2026-07-13

The owner requested more depth, stronger section separation, and a cinematic
editorial feel. This is now implemented only on the Portugal atlas so the
visual language can be judged without destabilising the core activity journey:

- the page root has layered sage depth with contour and atmospheric gradients;
- the opening question is a midnight cinematic chapter with a framed inner
  line, large serif hierarchy, editorial metadata, and a clear activity-first
  lens;
- the coverage proof is a translucent pause between promise and place;
- the Douro field note is framed, captioned, credited, and preloaded so the
  first cinematic image does not render as an empty lazy placeholder;
- the collections are a separate midnight chapter with a lead collection and
  structured region cards containing sequence, reviewed count, mood, trade-off
  description, and explicit activity links;
- hover lift and link transitions are short, compositor-safe, and removed for
  reduced motion.

The direction is grounded in the external research recorded in
[`docs/reviews/2026-07-13-rumia-full-bleed-media-research.md`](../../reviews/2026-07-13-rumia-full-bleed-media-research.md),
including Awwwards' immersive-but-usable case guidance, VisitPortugal's
region/experience taxonomy, and Atlas Obscura's lead-story/editorial-collection
rhythm. No layout or source code was copied.

The Portugal route visual gate passes desktop and mobile (`2/2`), targeted
accessibility/reduced-motion passes (`4/4`), focused Portugal unit tests pass
(`2/2`), and the production build/typechecks are green. A custom local
resource check measured approximately 1.19 MB total transfer on the Portugal
route, including an 883 KB preloaded WebP chapter image; this remains within
the current still-media target and should be rechecked if more imagery is
added. The local artifact is available at `http://127.0.0.1:3304/portugal`.

## 14. Full cinematic frontend expansion — planned before implementation

The Portugal atlas correction is a **vertical slice of the full design**, not
a disposable sample. This is the complete next implementation plan for the
extra cinematic direction requested by the owner. Autoplay and decorative
media are explicitly allowed in this expansion, but they remain progressive
layers around Rumia's activity decision rather than replacements for it.

### 14.1 Experience goal

Rumia should feel like an editorial travel film that became a useful decision
instrument:

```text
atmosphere → editorial judgement → practical choice → saved day
```

The cinematic layer establishes place, mood, and pacing. It must never hide
the activity verdict, facts, controls, or chosen-day state. Every visual beat
has a job: introduce a place, separate a chapter, show a consequence, or make
the next choice feel legible.

### 14.2 Art-direction rules

1. Use contrast as the primary cinematic tool: sage atmosphere, midnight
   chapters, linen reading fields, and ochre judgement accents.
2. Use one dominant media moment per public chapter. Decorative media may fill
   the background, but readable text sits above a controlled scrim and retains
   a solid fallback color.
3. Use full-bleed edges only for cover/chapter moments. Result cards remain
   structured, bounded, and scannable.
4. Use oversized serif headlines, mono metadata, generous negative space, and
   strong section labels. Do not turn every component into a card.
5. Use animation for atmosphere and cause/effect: slow camera drift, light
   movement, hover lift, crossfades, and section reveals. No scrolljacking,
   forced tours, or animation-only information.
6. Autoplay video is silent, muted, inline, looped, poster-backed, and locally
   served. It is decorative unless a visible caption and useful alternative
   make it informative.
7. Reduced-motion users receive the same poster/image and hierarchy with no
   autoplay or parallax. Reduced-data and low-power paths receive the poster
   without waiting for video.
8. The visual reference set is inspiration only. Do not copy Awwwards layouts,
   source code, brand marks, or the `london-3d` composition.

### 14.3 Route-by-route design scope

| Surface | Cinematic treatment | Primary interaction that must remain dominant |
| --- | --- | --- |
| `/` | 60–75vh autoplay Portugal cover loop with poster, light drift, and text-safe scrim; optional chapter transition into activity brief | Phrase/activity situation composer |
| `/portugal` | Existing midnight hero, proof pause, Douro field note, midnight atlas chapter; add optional hero loop only after media foundation passes | Region/activity collection choice |
| `/explore` | Editorial chapter bands between result groups; selected activity gets atmospheric media strip; result cards remain opaque and structured | Compare judgement, save/remove |
| `/activities/[activityId]` | 55–65vh activity-specific hero video/image with caption, verdict, facts, and focal crop; hover/scroll reveals are optional | Verdict, practical facts, save |
| `/explore/workspace` | Chosen-day atmosphere strip and subtle stop-to-stop transition after save; empty state remains fast and illustrated | Shape, reorder, remove, share |
| `/planner`, `/trip/new` | Cinematic still/video poster in the context rail; brief and action panel stay readable and usable | Complete the brief and shape the day |
| `/sign-in`, `/support`, `/feedback`, `/offline` | Quiet still proof crop or background light only; no full marketing video | Trust, recovery, and form actions |
| `/console/*`, `/admin/*`, `/reviewer/*` | No decorative video; use dense linen operator field and status motion only | Operational work |

### 14.4 Shared implementation architecture

#### Files to create

- `packages/ui/src/components/cinematic-media.tsx` — reusable poster/video
  primitive with `src`, `poster`, `fallbackSrc`, `alt`, `caption`, `credit`,
  `sizes`, `priority`, `decorative`, and `motionPolicy` props. It renders a
  `<video muted autoPlay loop playsInline>` only for the motion path, keeps a
  poster layer beneath it, and exposes no controls for decorative media.
- `packages/ui/src/components/cinematic-media.test.tsx` — tests poster
  rendering, source/fallback markup, decorative semantics, and reduced-motion
  class hooks.
- `packages/ui/src/lib/media-preferences.ts` — client-safe shared preference
  helper returning `prefersReducedMotion`, `prefersReducedData`, and
  `isLowPower`; it defaults to the poster path during SSR and hydration so the
  primitive can be reused by every route without an app/package import cycle.
- `packages/ui/src/lib/media-preferences.test.ts` — tests the SSR-safe default
  contract; listener cleanup remains covered by the hook implementation and the
  browser reduced-motion gate.
- `apps/web/content/cinematic-media-manifest.ts` — typed manifest entries for
  video/poster pairs, motion policy, byte budgets, focal point, text-safe zone,
  caption, attribution, licence, review date, and fallback color.
- `apps/web/content/cinematic-media-manifest.test.ts` — validates every video
  has a poster, local source, licence, caption policy, dimensions, duration,
  and mobile byte budget.

#### Files to modify

- `packages/ui/src/index.ts` — export `CinematicMedia` and its prop types.
- `packages/ui/src/styles.css` — add semantic media tokens only; do not add
  page-specific selectors here.
- `apps/web/app/globals.css` — add page-scoped cinematic layers, poster/video
  stacking, scrims, section reveals, hover transitions, and reduced-motion
  overrides. Animate only `transform` and `opacity`.
- `apps/web/app/(marketing)/page.tsx` — mount the home cover loop behind the
  existing activity composer.
- `apps/web/app/(marketing)/_components/hero-editorial-media.tsx` — replace
  the current still-only hero anchor with `CinematicMedia` while preserving
  the phrase-led first action.
- `apps/web/app/(marketing)/portugal/page.tsx` — keep the current cinematic
  atlas structure and add an optional hero loop using the same manifest
  contract.
- `apps/web/app/(marketing)/portugal/portugal-atlas.tsx` — preserve the
  featured lead and structured region cards; add only intentional media hooks.
- `apps/web/app/(marketing)/activities/[activityId]/page.tsx` and its local
  components — add activity media with verdict-safe overlay and poster fallback.
- `apps/web/app/(marketing)/explore/page.tsx` and result-card components — add
  chapter media bands without putting video behind every result.
- `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx` — add a
  saved-only atmosphere strip and preserve the list-first chosen-day editor.
- `apps/web/app/planner/_components/planner-single-screen.tsx` and
  `apps/web/app/trip/new/*` — add the poster/context rail without moving the
  brief or action controls.
- `apps/web/playwright/tests/visual.spec.ts` — add stable media waits and
  poster-path coverage; visual snapshots must freeze video using the poster.
- `apps/web/playwright/tests/accessibility.spec.ts` — assert no serious axe
  findings, one main/H1, visible controls, and reduced-motion poster behavior.
- `apps/web/playwright/tests/perf.spec.ts` — add media-byte and route timing
  assertions for home, Portugal, and activity detail.
- `scripts/check-assets.mjs` — validate local video/poster files and manifest
  provenance.
- `docs/reviews/2026-07-13-rumia-full-bleed-media-research.md` — record asset
  sources, licence evidence, and before/after performance measurements.

### 14.5 Asset and video contract

Every motion asset must have:

```text
id, route/chapter/activity refs, videoSrc, posterSrc, fallbackSrc,
width, height, durationMs, videoBytes, mobileBytes, alt, caption,
source, sourceUrl, licence, licenceUrl, attribution, owner,
reviewedAt, expiresAt, focalPoint, textSafeZone, dominantColor,
motionPolicy, transcript/captions (if informative)
```

Initial media set:

1. `rumia-portugal-cover-loop`: 6–10 seconds, 1600px maximum width, silent
   H.264 MP4, poster from the licensed Carcavelos still, under 1.5 MB mobile.
2. `rumia-douro-field-loop`: 6–10 seconds, silent, poster from the licensed
   Douro still, used only on the Portugal chapter after the cover proves stable.
3. `rumia-porto-activity-loop`: optional later activity-specific loop; do not
   create until the activity-detail still improves comprehension in testing.

If a video is generated by animating a licensed still, record the original
photograph as the source and state that the file is a derivative motion crop.
No remote hotlinks are permitted. The browser must still show the poster if
the video fails, is blocked, or is disabled by user preference.

### 14.6 Motion and interaction behavior

1. Hero video autoplays muted and loops after the poster is painted; it never
   controls the page scroll or delays the primary action.
2. The first 600ms of the video must not contain a bright flash or abrupt cut.
3. Chapter reveals use 160–260ms opacity/translate transitions; card hover uses
   a maximum 4px lift and does not change layout dimensions.
4. Video is hidden and the poster remains visible when
   `prefers-reduced-motion: reduce` or reduced-data is active.
5. Keyboard focus and active states remain visible above all scrims.
6. Captions and credits remain readable over motion; decorative media uses
   `aria-hidden="true"` and is not the only source of meaning.
7. If autoplay is blocked, there is no error state: the poster is the valid
   final state.

### 14.7 Phased execution

#### Phase A — foundation and one cover experiment

- Create `CinematicMedia`, preference handling, manifest schema, and asset
  checks.
- Add one local poster/video pair to the homepage only.
- Keep `/portugal` on the current still implementation during this phase.
- Verify poster-first loading, autoplay when allowed, and reduced-motion fallback.

**Status (2026-07-13): complete.** The home cover uses a local 8-second,
565,629-byte H.264 derivative with the existing Carcavelos poster and fallback.
Focused component/home tests, typechecks, asset checks, build, live autoplay,
and reduced-motion poster review passed. The activity brief is unchanged and
the cover has no layout shift.

#### Phase B — Portugal chapter expansion

- Add the Douro motion loop to the existing Portugal field-note/chapter
  sequence.
- Add decorative light/contour motion behind the midnight atlas using CSS only.
- Keep the featured collection and structured cards unchanged.

**Status (2026-07-13): complete for the first chapter slice.** The Douro
field-note now uses a local 8-second, 1,276,925-byte loop with the same poster
and attribution contract. The midnight atlas remains card-first; no map or
automatic tour was introduced. Reduced-motion and poster-only paths keep the
chapter readable.

#### Phase C — explore and activity detail

- Add one selected-result media band to `/explore`.
- Add one activity-detail hero media treatment with a poster-first fallback.
- Never load a video for every result card.

**Status (2026-07-13): complete for the first media slice.** Explore now has a
single region atmosphere band in poster-only mode, and activity detail uses the
shared cinematic primitive with an activity-specific poster and no per-card
video fan-out. Verdict, facts, and save action remain structurally primary.

#### Phase D — chosen day and planner continuity

- Add a compact saved-only atmosphere strip to workspace.
- Add a poster/context rail to planner and trip-new.
- Keep empty, loading, error, and recovery states lightweight.

**Status (2026-07-13): complete for the first continuity slice.** Workspace
shows a saved-only atmosphere strip and planner exposes a poster-only context
rail. Empty states remain media-free, and the continuity surfaces do not load
autoplay video before a chosen activity.

#### Phase E — utility and release hardening

- Keep sign-in, support, feedback, offline, console, admin, and reviewer
  surfaces quiet; add no autoplay video to them.
- Run the complete desktop/mobile visual, a11y, motion, performance, viewport,
  asset, and build gates.
- Capture final screenshots with video frozen to posters for deterministic
  comparison and a separate live-motion manual review.

**Exit:** user approves the full route set, media provenance is complete, and
the release artifact—not only the local source—matches the approved visuals.

**Status (2026-07-13): complete for the private release.** The exact artifact
is active on Rumia loopback as `20260713T204125Z-cinematic-fix`; route, CSS,
media, reduced-motion, console, and activity-to-chosen-day smoke checks pass.
Public DNS/Caddy ingress and map/provider/legal enablement remain explicitly
deferred.

### 14.8 Approval gates

The owner approves four distinct things, in order:

1. **Art direction:** cinematic contrast, typography, chapter pacing, and card
   structure.
2. **Media set:** the selected Portugal clips, posters, crop/focal treatment,
   captions, and credits.
3. **Motion behavior:** autoplay speed, loop length, hover/reveal transitions,
   reduced-motion fallback, and mobile behavior.
4. **Full route release:** homepage, Portugal, explore, activity detail,
   workspace, planner, sign-in, and utility/operator routes at desktop and
   mobile.

The full cinematic direction is approved. Phases A–D and Phase E private
release hardening are complete as bounded vertical slices; public ingress and
provider/legal gates remain external. Richer activity
loops, route storytelling, and 3D exploration remain later capabilities and
must not displace the activity decision journey.

### 14.9 Implementation checkpoint — 2026-07-13

Completed in the current checkout:

- `CinematicMedia` poster/video primitive with muted, inline, looped autoplay
  and poster-only reduced-motion/data/low-power behavior.
- Typed cinematic manifest plus byte/provenance tests and asset-script checks.
- Home cover loop, Portugal Douro loop, explore atmosphere band, activity
  detail poster treatment, workspace saved-day strip, and planner context rail.
- Local derivatives only; no remote media hotlinks; existing Unsplash source
  and attribution metadata retained.
- Focused UI/web tests, package and app typechecks, motion gate, asset checks,
  production build, live autoplay smoke, reduced-motion smoke, console-error
  smoke, resource-byte inspection, and the complete desktop/mobile visual,
  accessibility, and performance suites.

Local and private-release implementation status: complete for the approved
cinematic tranche.

Still open outside this private frontend release:

- Public DNS/Caddy ingress, which remains deferred by owner decision.
- Preserve the map provider/legal gate and owner-controlled public ingress.

### Closeout acceptance

The frontend plan remains open until the user can complete:

```text
activity situation → judged result → activity detail → save → chosen day
→ shape the day → sign in/save/share → feedback
```

**Private-release result (2026-07-13):** this journey is covered by the full
unit/browser contracts and the deployed public route/flow smoke; the private
release is complete. The remaining open items are intentionally outside this
frontend closeout: public ingress and the separately gated map/provider/legal
decision.

The first viewport of every public route must communicate its purpose and
primary action within five seconds. Every long page must have a deliberate
surface/chapter treatment, not an accidental beige field. The optional map
remains list-first and gated; Phase 2 camera storytelling and Phase 3 3D are
not allowed to substitute for this closeout.

This document is the only active frontend redesign/polish plan. Update its
status, checkboxes, and evidence links as implementation proceeds; do not
create another parallel redesign plan.

### Final local visual closeout — 2026-07-14

The local frontend redesign and polish objective is complete. The final
closeout corrected the shared `CinematicMedia` positioning contract (restoring
true full-bleed homepage media), removed the homepage CTA/proof-rail collision,
and moved the activity-detail save/remove action directly under the activity
title with a responsive crop that keeps the complete control visible at
1440x900 and 390x844. The exact artifact is served at
`http://127.0.0.1:3310/`.

Fresh acceptance evidence: 26 desktop/mobile route pairs pass 200/H1/main/no-
overflow/no-console-error checks; the activity save/remove and homepage handoff
flows pass; reduced-motion poster behavior passes; the full unit suite is
179/900; the 64-route production build, lint/typecheck, motion gate, and asset
gate pass. Public ingress and the independently gated map/provider/legal work
remain outside this local frontend objective.
