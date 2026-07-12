# Rumia frontend deep redesign and polish plan

> **Canonical frontend plan.** This document consolidates the former UI
> correctness plan, aesthetic companion, foundation slice, and implementation
> checklist. It is subordinate to the activity-first product plan and does not
> change Rumia's product boundary, backend, or release order.
>
> **Status:** redesign is approved for implementation planning. Shared
> component work and map-gating infrastructure exist in source, but the visual
> release is not accepted until a fresh artifact is served and reviewed at the
> required viewports. The currently visible 3302 browser tunnel has shown a
> stale homepage globe and stale planner chapter; those are deployment/evidence
> defects until proven against the current source build.

## 1. Authority and plan reconciliation

| Authority | Owns | Relationship to this plan |
| --- | --- | --- |
| `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md` | Product promise, Portugal-wide activity scope, non-goals, release order | Non-negotiable parent plan |
| `docs/superpowers/specs/2026-07-10-rumia-activity-curation-design.md` | Activity fields, editorial judgement, review eligibility, user-facing boundaries | Domain contract |
| `docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md` | Map phases, list fallback, route truth, attribution, licensing | Spatial contract consumed by Phase 7 |
| `docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md` | VPS-native runtime, Better Auth, PostgreSQL/Drizzle, deployment boundaries | Runtime contract; no frontend plan may replace it |
| `docs/superpowers/plans/2026-07-11-rumia-vps-self-hosted-migration.md` | Migration and deployment implementation | Infrastructure workstream |
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

### 3.1 P0 — source and browser artifact are not the same thing

The current visual review used `http://127.0.0.1:3302/` through the SSH tunnel
to the VPS's HTTP-only Rumia listener. The visible artifact still showed:

- an old globe-first homepage with world labels and public-3D/map controls;
- an old `/planner` chapter with “Advanced day planning” language;
- mobile versions of the same stale composition.

The current source contract instead requires a quiet Portugal context, a
phrase-led activity decision, and a secondary chosen-day planner. Therefore:

1. Do not accept screenshots from 3302 as current-source evidence until the
   release artifact is rebuilt and deployed from the active worktree.
2. Record the build commit, service path, port, and browser URL with every
   visual run.
3. Keep the Rumia/Lumes boundary intact: Rumia remains loopback `127.0.0.1:3002`;
   Lumes remains unchanged on `0.0.0.0:3001`.
4. Use HTTP for the current loopback service unless TLS is explicitly added;
   `https://127.0.0.1:3002` is not a valid visual target today.

**Exit:** the browser-rendered homepage and planner copy match the checked-out
source, and a stale-build check can identify the served commit.

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

### Phase 4 — Motion, feedback, and accessibility polish

**Purpose:** make interaction feel responsive and trustworthy.

**Work:**

1. Define a small vocabulary: fade, lift, underline, rail reveal, and camera
   focus. Tokenize duration/easing; keep state updates immediate.
2. Add live status text for save/remove/restore/replace/share/loading/error and
   preserve focus on the initiating control.
3. Make hover/focus enhancements optional; no essential meaning is hover-only.
4. Honor reduced motion in CSS, React transitions, and map camera options.
5. Validate keyboard, touch, VoiceOver/NVDA-equivalent semantics, 200% text,
   and 390px no-overflow behavior.

**Exit:** every motion has a text/state equivalent and a reduced-motion trace;
   no serious/critical accessibility finding remains.

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

- Fresh Rumia 3002/3302 artifact must be rebuilt from this worktree before any
  visual acceptance claim.
- Final texture treatment and asset manifest still require route-by-route
  review.
- Map owner/legal/provider/quota/GTFS decisions remain open in the launch
  packet; no production Phase 2/3 flag may be enabled.
- External public ingress (`rumia.pt`) remains deferred.

This document is the only active frontend redesign/polish plan. Update its
phase checkboxes and evidence links as implementation proceeds; do not create
another parallel redesign plan.
