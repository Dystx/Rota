# Rumia frontend aesthetic rework and interaction plan

> **Status:** Approved frontend workstream. Core UI implementation and
> technical map gating are recorded; production visual/provider gates remain
> explicit and are not silently treated as complete.
>
> This is not a new product roadmap. It is the visual and interaction work
> needed to make the existing activity-first product feel authored, editorial,
> and coherent across every frontend surface.

Implementation documents:

- Full A–H roadmap: `docs/superpowers/archive/plans/2026-07-12-rumia-frontend-aesthetic-rework-implementation.md`
- First slice: `docs/superpowers/archive/plans/2026-07-12-rumia-frontend-foundation-planner-slice.md`
- Approved design: `docs/superpowers/specs/2026-07-12-rumia-frontend-aesthetic-rework-design.md`

## 1. Plan reconciliation

The repository already contains several plans with different authority levels.
This document does not replace them:

| Document | Authority | How this plan uses it |
| --- | --- | --- |
| `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md` | Canonical product/release plan | Owns the activity-first promise, Portugal-wide scope, release order, and non-goals. |
| `docs/superpowers/archive/plans/2026-07-11-rumia-full-redesign-and-ui-plan.md` | Existing UI baseline | Historical UI correctness baseline, superseded by the canonical deep redesign plan. |
| `docs/superpowers/specs/2026-07-10-rumia-activity-curation-design.md` | Activity domain contract | Owns the editorial activity fields, judgement model, and user-facing boundaries. |
| `docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md` | Spatial capability | Owns map phases, route truth, fallback, licensing, and list-first behavior. |
| `docs/superpowers/specs/2026-07-11-rumia-vps-platform-design.md` | Runtime/deployment | Owns the VPS-native stack; this plan must not introduce a frontend hosting or database change. |
| `docs/reviews/2026-07-11-rumia-browser-ui-review.md` | Evidence and findings | Supplies the current visual/a11y findings and the browser evidence to rerun. |
| `docs/roadmap.md`, `docs/master-roadmap.md`, and the 9–10 July phase plans | Historical/operational companions | Retain as history or domain detail; do not use their Supabase, route-first, or itinerary-first copy as current UI authority. |

### Decision: a new plan is justified

The existing redesign plan is strong on correctness and release gates, but the
new request is broader: it asks for an inventory of every frontend component,
design aesthetics, background texture, graphic direction, animation language,
and an innovative but responsible 3D treatment. Those are enough independent
workstreams to deserve one bounded companion plan. Keeping them in a separate
document prevents the canonical product plan from becoming a visual moodboard
and prevents a decorative 3D experiment from reopening the MVP.

The existing plan's UI-2A slice becomes the first integration point for this
document. The activity-first master plan remains the only product/release
authority.

## 2. Product and aesthetic objective

Rumia should feel like a carefully edited Portugal field guide that happens to
be interactive:

> **State the time you have → see a judgement → compare the trade-off → keep a
> day that still feels like yours.**

The interface must feel premium because the decisions are clear, the writing is
specific, the layout has rhythm, and the feedback is trustworthy—not because it
uses the most effects.

The UX intention does not change. Rumia remains:

- a digital-first Portugal activity guide and curation layer;
- independent from booking and accommodation search;
- editorially judged rather than a raw review directory;
- list-first and useful without a map;
- capable of optional specialist context after a chosen day;
- able to use AI behind the scenes without presenting a chatbot.

## 3. Current frontend findings to carry into implementation

### Strengths to preserve

- The public activity journey has a recognisable serif/sans/mono voice.
- The homepage has a clear cover-like hierarchy: question, dek, phrase
  composer, and one primary action.
- `/explore` and activity detail already expose judgement, time, timing,
  pairing, and alternatives instead of behaving like a directory.
- Linen editorial surfaces and midnight-olive planning surfaces create a useful
  contrast chapter.
- The static Portugal context illustration keeps the homepage fast and avoids
  making the first decision depend on WebGL.

### Rework findings

1. **Direct `/planner` is a legacy visual chapter (P1).** The “Advanced day
   planning” eyebrow and itinerary-first context card read like a separate
   trip-generation product. It must become “Shape a day” and explain pacing,
   mobility, buffers, and consequences of already chosen activities.
2. **The shared footer required a structural polish pass (P1).** It rendered
   five groups in a four-column grid and duplicated Support under Legal. The
   source fix is now present; the visual baseline must be regenerated only after
   the design is accepted.
3. **Long editorial pages can underuse the first desktop viewport (P2).**
   `/how-it-works`, `/local-expertise`, and `/human-review` need one useful
   evidence block, decision index, sourced visual, or tighter rhythm—not
   ornamental filler.
4. **The empty chosen-day workspace is too quiet when no activity is selected
   (P2).** Keep the calm tone but make “Keep exploring” unmistakable and show a
   small preview of what a selected day contains.
5. **Visual snapshots are currently a stale contract after copy/layout
   changes.** The interrupted visual run showed expected-vs-actual page-height
   mismatches, not a reason to blindly accept new screenshots. Baselines must be
   reviewed route by route and regenerated as an explicit design decision.
6. **There is no approved 3D hero yet.** The current homepage is intentionally a
   static fallback; the existing MapLibre 3D surface belongs to the trip map and
   the optional activity-map capability. A hero experiment is a later phase,
   not a reason to load WebGL on the initial page.

## 4. Editorial visual system

### 4.1 Composition grammar

Every authored page follows a predictable editorial sequence:

1. **Kicker** — short context or category, never a paragraph in all caps.
2. **Headline** — one decisive question or judgement.
3. **Dek** — one concise explanation of why the page matters.
4. **Decision/evidence** — verdict, fact rail, collection index, or consequence.
5. **Action** — one clear next step, with secondary actions visually quieter.
6. **Colophon/context** — source, review date, attribution, or boundary note
   where trust depends on it.

Use a strong reading column (roughly 45–75 characters), a measured fact rail,
thin rules, and asymmetric-but-stable grids. The asymmetry must be a layout
relationship, not accidental misalignment.

### 4.2 Type and spacing

- Keep one display serif, one body/UI sans, and mono only for short metadata.
- Define named tokens for kicker, display, lead, body, label, metadata, and
  action text; remove page-level one-off type values where a token exists.
- Headings use tight line-height and body copy uses relaxed line-height; neither
  is allowed to collapse at 390px or 200% zoom.
- Use a 4/8-based spacing rhythm (`4, 8, 12, 16, 24, 32, 48, 64, 96`) and
  distinguish component padding from section spacing.
- Keep body text left-aligned by default. Center only short hero/empty-state
  compositions where it improves hierarchy.

### 4.3 Surface, texture, and depth

Use four semantic chapters rather than many visual effects:

- **Linen:** reading, collections, activity detail, utility pages.
- **Sage:** discovery, comparison, empty and feedback states.
- **Midnight olive:** chosen-day composition and deliberate planning focus.
- **Ochre:** judgement, selected state, or next-action emphasis.

Background texture should be quiet and deterministic:

- sparse CSS radial/linear gradients or a small inline SVG contour/grid;
- opacity low enough that body text and cards remain the contrast foreground;
- no animated noise, blinking grain, or random canvas repaint;
- no texture behind dense operator tables or forms;
- respect `prefers-reduced-motion` and data/battery constraints.

Depth comes from borders, tonal shifts, and one restrained shadow level. Avoid
mixing glass, heavy shadows, pills, round cards, and editorial rules on the same
component without a named variant.

### 4.4 Imagery and graphic language

- Use owned or licensed Portugal photography/illustration only; every asset has
  source, licence, crop, alt text, and expiry/refresh metadata.
- Prefer one strong crop with a caption or editorial note over a grid of stock
  thumbnails.
- Activity imagery is evidence of place/atmosphere, not a replacement for a
  verdict. The judgement stays visible when images fail or are disabled.
- Use simple line drawings, topographic contours, azulejo-like geometry, and
  cartographic annotation as brand-owned graphic language; do not imitate a
  specific award site or reuse its composition/assets.
- Create reusable `ImageFrame`, `EditorialFigure`, `PullQuote`, `FactRail`, and
  `CollectionCover` variants rather than styling every page independently.

## 5. Awwwards-informed interaction direction

The inspiration is the craft of storytelling sites, not their portfolio
spectacle. The useful translations are:

- **Timeline selection:** a morning/afternoon/evening rail can make the
  available time tangible in `/explore` and the workspace. It remains a native
  vertical list on mobile.
- **Chapter navigation:** long pages may expose a small section index or “you
  are here” marker; scrolling remains native and reversible.
- **Reveal interactions:** desktop hover/focus can reveal a supporting image,
  nearby pairing, or alternative. The title, verdict, facts, and action never
  depend on hover and are always available to touch, keyboard, and screen
  readers.
- **Editorial transitions:** short opacity/position changes can show which
  phrase, activity, or day section changed. State text and focus behavior are
  authoritative; motion is not.
- **Texture as pacing:** changes in surface tone and rule density separate
  chapters without requiring full-screen video or a scroll-controlled movie.

Explicitly exclude autoplay video, scroll hijacking, custom cursors, infinite
parallax-only navigation, hover-only meaning, fake loading theatre, and
ornamental 3D before the user has a useful activity decision.

## 6. Component and state inventory

### Shared primitives (`packages/ui`)

Audit and, where necessary, refactor these into token-backed variants:

- `Button`, `LinkAction`, `Icon`, `BrandMark`
- `SectionHeading`, `Kicker`, `EditorialRule`, `PullQuote`
- `ChoiceChipGroup`, `ChoiceCard`, `OptionSheet`, `Modal`
- `PhraseComposer`, `AcceptedPhrase`, phrase rail/status messages
- `ActivityResultCard`, `ActivityDayTray`, `FactRail`, `CollectionCover`
- `EmptyState`, `Skeleton`, `Toast`, `StatusRegion`, `BackToTop`
- `TopNav`, mobile menu, `SiteFooter`, `PageShell`, `PublicRouteLayout`
- `ImageFrame`, `EditorialFigure`, and map/list fallback primitives

For every interactive primitive, document and test: default, hover, focus,
pressed/selected, disabled, loading, success, error, empty, reduced-motion,
touch, and keyboard behavior. No visual component is complete from the happy
path alone.

### Surface groups

| Group | Routes | Visual job |
| --- | --- | --- |
| Public cover/atlas | `/`, `/portugal`, `/how-it-works` | Establish trust and a decision vocabulary. |
| Decision index | `/explore`, `/activities/[id]` | Make judgement and trade-offs scannable. |
| Chosen-day editor | `/explore/workspace`, `/planner`, `/trip/new` | Turn choices into a practical day without pretending to book. |
| Saved traveler workspace | `/trip/[tripId]`, map, export, account, vault | Keep the chosen day and its state authoritative. |
| Trust/utility | `/local-expertise`, `/human-review`, `/pricing`, `/support`, `/offline`, legal, sign-in | Explain boundaries and recovery without a separate visual language. |
| Operations | `/console/*`, `/admin/*`, `/reviewer/*` | Dense, task-oriented, keyboard-safe; editorial brand accents are secondary. |

## 7. Page-by-page rework sequence

### Phase A — Audit and design contract

1. Freeze the current product intent and record the route/surface matrix.
2. Capture approved first viewport and full-page references at 390×844,
   768×768, 1024×768, 1280/1440 desktop, and 200% zoom.
3. Inventory every component, raw color/spacing/type value, background effect,
   icon, image, map surface, and motion trigger.
4. Mark each component as shared, page-specific, historical, or dead; do not
   refactor by search-and-replace alone.
5. Define token additions and the asset manifest before visual implementation.

**Exit:** a reviewed component inventory, route matrix, token proposal, asset
manifest, and screenshot baseline with explicit owners.

### Phase B — Shared system and shell

1. Consolidate semantic tokens for type, spacing, surfaces, borders, focus,
   shadows, and motion.
2. Make `PageShell`, `PublicRouteLayout`, `TopNav`, `SiteFooter`, and mobile
   menu own one consistent landmark and focus contract.
3. Fix footer grid, active navigation, skip link, route title, and mobile safe
   area before page-level art direction.
4. Add `EditorialRule`, `FactRail`, `ImageFrame`, `StatusRegion`, and named
   surface variants with component tests.

**Exit:** no page invents shell tokens; all shared components pass keyboard,
focus, contrast, and reduced-motion checks.

### Phase C — Public editorial surfaces

1. Recompose `/` as a cover: phrase-led decision first, static map context,
   proof below, no map controls in the first decision layer.
2. Recompose `/portugal` as a Portugal-wide activity atlas with collection
   covers, region depth, weather/time/group indexes, and visible editorial
   status.
3. Recompose `/explore` as an annotated judgement index with time rail,
   result cards, save/remove feedback, and a clear day tray.
4. Recompose activity detail as a dossier with verdict, facts, caveat,
   pairing, alternative, evidence, and next action.
5. Recompose `/how-it-works`, `/local-expertise`, `/human-review`, and pricing
   as evidence-led editorial pages; remove dead space without decorative cards.

**Exit:** a new traveller can understand the product, choose an activity,
save/remove it, and reach a useful workspace without reading a route promise.

### Phase D — Chosen-day and saved-day continuity

1. Refactor direct `/planner` into the same “Shape a day” language as the
   chosen-activity path; keep the dark surface but remove generic itinerary
   framing from the first viewport.
2. Make the empty workspace a composed recovery state with one example and one
   unmistakable “Keep exploring” action.
3. Make workspace/trip agenda, fact rail, reorder controls, share, feedback,
   export, and review states visually consistent and reversible.
4. Keep list/agenda complete if map, WebGL, imagery, or route geometry fails.

**Exit:** selection state, timing consequences, action feedback, and recovery
are clear at mobile and desktop without map interaction.

### Phase E — Motion and feedback

1. Define a small motion vocabulary: fade, lift, underline, rail reveal, and
   camera focus; each has a duration/easing token and a no-motion equivalent.
2. Animate only transform/opacity where possible; never animate layout height
   in a way that moves the focused element under a tray or header.
3. Add explicit status regions for save/remove/share/replace/loading/error and
   preserve focus on the initiating action.
4. Test reduced motion at CSS and MapLibre camera layers. MapLibre animation
   options must set `animate: false` when reduction is requested; no essential
   information can be conveyed only by a camera flight.

**Exit:** every motion trigger has a purpose, a text/state equivalent, and a
reduced-motion trace.

### Phase F — Progressive spatial and 3D capability

This phase consumes the existing activity-map capability spec. It does not
replace it.

1. **Phase 1:** list-equivalent interactive activity map in
   `/explore/workspace`; one-to-five points, selection sync, explicit focus,
   2D fallback, attribution, and no 3D.
2. **Phase 2:** explicit “Explore your plan” mode with step/pause/stop controls,
   morning/afternoon/evening camera chapters, and validated route segments.
3. **Phase 3:** optional “Portugal relief atlas” experiment: a low-contrast
   pitched/terrain view or urban building extrusions that explain the selected
   day. It is loaded only after explicit intent, never blocks LCP, never
   auto-rotates, and may remain 2D on mobile.
4. **Hero experiment (separate opt-in):** only after Phase 2/3 evidence, test a
   small desktop “Explore Portugal in three dimensions” panel below the core
   activity CTA. It must be a progressive enhancement, not the homepage's
   primary task or first-load dependency.

**Exit:** map/list parity, licence approval, reduced-motion behavior, WebGL
failure fallback, device/performance evidence, and no initial map bundle on the
homepage. If the 3D view does not improve an activity decision, do not ship it.

### Phase G — Utility and operator consistency

1. Give support, offline, legal, sign-in, and feedback a shared quiet colophon
   layout with explicit recovery actions.
2. Keep reviewer/admin/console surfaces denser and operational, but reuse the
   same tokens, focus rings, status primitives, and icon system.
3. Remove historical itinerary, concierge, and unsupported commerce language
   from any first viewport still carrying it.

**Exit:** all route groups have deliberate visual density, clear next action,
one main/H1, no overflow, and no accidental shell duplication.

### Phase H — Verification and release baselines

1. Run unit, typecheck, lint, build, route smoke, accessibility, reduced-motion,
   performance, and responsive gates.
2. Review visual diffs manually; regenerate snapshots only after the design
   owner accepts the route-level changes. A page-height change is not a
   failure by itself, but it must be explainable.
3. Validate 390×844, 768×768, 1024×768, 1280/1440 desktop, 200% text resize,
   400% zoom where practical, keyboard-only, VoiceOver, and WebGL-disabled
   paths.
4. Test the homepage without MapLibre, imagery, and optional network sources;
   test the map with slow network, missing tiles, missing geometry, and a
   reduced-motion preference.

## 8. Performance, accessibility, and responsive requirements

Use WCAG 2.2 AA as the minimum. Normal text targets 4.5:1, large text 3:1,
focus is not obscured, text survives 200% resize, and touch targets are at least
44px in the product where practical (never below the applicable WCAG minimum).
Color, texture, camera, and hover cannot be the only way to understand state.

Use Core Web Vitals as release budgets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the
75th percentile, segmented by mobile and desktop. Keep the homepage initial JS
and map-free contract; lazy-load MapLibre, terrain, 3D buildings, images, and
heavy operator charts. Reserve image/map geometry to prevent CLS. Animate
transform/opacity, cap concurrent effects, and use CSS where JavaScript is not
needed.

## 9. MapLibre/3D technical contract

- Use the existing `@repo/spatial-engine` boundary and documented MapLibre APIs;
  do not copy the referenced `london-3d` source or composition.
- Treat terrain, glyphs, sprites, vector tiles, DEM, and route geometry as
  separate licensed dependencies with explicit attribution and expiry/quota
  records.
- Use `fill-extrusion` only for dense areas where building height improves
  orientation; cap feature count and opacity, and provide a 2D mode.
- Use `flyTo`/`easeTo` only after user intent or explicit “Explore your plan”;
  respect reduced motion with immediate camera changes.
- Keep map state non-authoritative. The activity list and server-reviewed
  coordinates remain the source of truth.
- Add telemetry for map opened, camera focus, fallback, tile failure, and 3D
  opt-in; never track precise location without a separate consent decision.

## 10. Likely implementation surfaces

### Shared system

- `packages/ui/src/styles.css`
- `packages/ui/src/components/{button,icon,choice-chip-group,accordion,modal,toast,empty-state}.tsx`
- new `packages/ui/src/components/{editorial-rule,fact-rail,image-frame,status-region,pull-quote}.tsx`
- `apps/web/app/_components/{top-nav,site-footer,public-route-layout,maplibre-error-suppressor}.tsx`
- `apps/web/app/layout.tsx`, `apps/web/app/globals.css`

### Public journey

- `apps/web/app/(marketing)/page.tsx`
- `apps/web/app/(marketing)/hero-map.tsx`
- `apps/web/app/(marketing)/portugal/page.tsx`
- `apps/web/app/(marketing)/explore/{page,activity-explorer}.tsx`
- `apps/web/app/(marketing)/explore/workspace/{page,activity-workspace,activity-day-tray}.tsx`
- `apps/web/app/(marketing)/activities/[activityId]/page.tsx`
- `apps/web/app/(marketing)/how-it-works/page.tsx`
- `apps/web/app/(marketing)/local-expertise/page.tsx`
- `apps/web/app/(marketing)/human-review/page.tsx`
- `apps/web/app/(marketing)/pricing/page.tsx`

### Traveler, utility, and operations

- `apps/web/app/planner/**`
- `apps/web/app/(app)/trip/**`
- `apps/web/app/sign-in/**`, `apps/web/app/support/**`, `apps/web/app/offline/**`
- `apps/web/app/console/**`, `apps/web/app/(reviewer)/**`, `apps/web/app/(admin)/**`

### Spatial

- `packages/spatial-engine/**`
- `apps/web/app/(marketing)/explore/workspace/activity-map*`
- `apps/web/app/(app)/trip/[tripId]/map/**`
- `docs/ops/map-provider-licensing.md`, `docs/ops/geographic-route-contract.md`

### Evidence

- `apps/web/playwright/tests/visual.spec.ts`
- `apps/web/playwright/tests/accessibility.spec.ts`
- `apps/web/playwright/tests/perf.spec.ts`
- new visual/a11y/motion/map fallback tests beside each new component
- `docs/reviews/2026-07-11-rumia-browser-ui-review.md`

## 11. Acceptance criteria for the plan

The rework is complete only when:

1. The canonical activity-first journey is unchanged and clearer at every
   route: no booking, accommodation, chatbot, or generic itinerary drift.
2. Every public and traveler page has intentional composition, consistent type,
   semantic spacing, a clear next action, and no unexplained dead zone.
3. Every shared component has explicit visual/state contracts and no raw
   one-off tokens that bypass the design system without a documented reason.
4. Mobile, tablet, desktop, zoom, keyboard, screen-reader, reduced-motion,
   slow-network, and WebGL-failure paths preserve the same decisions and data.
5. The homepage remains map-free in initial JS and useful with all optional
   media/network sources unavailable.
6. The optional map/3D layer improves activity comparison or day understanding;
   otherwise it remains disabled.
7. Current visual snapshots are reviewed and regenerated intentionally, not
   treated as an automatic approval mechanism.
8. The plan's owner/content/licensing/performance gates are accepted before
   any 3D hero or new media source is enabled.

## 12. Recommended next action

Use the linked implementation plan and launch decision record as the single
frontend/aesthetic workstream. The shared system, public/chosen-day surfaces,
utility/operator alignment, and technical map gates are implemented; the next
work is only the remaining evidence and owner/provider decisions. Do not enable
3D or a public map provider until those decisions are recorded.

## References used for the design constraints

- [Awwwards storytelling collection](https://www.awwwards.com/websites/storytelling/)
- [Awwwards — When to Travel](https://www.awwwards.com/sites/when-to-travel)
- [Awwwards — Designed by Women](https://www.awwwards.com/sites/designed-by-women)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
- [web.dev Core Web Vitals](https://web.dev/articles/vitals)
- [MapLibre GL JS documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre camera animation options](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/AnimationOptions/)
- [MapLibre fill-extrusion style properties](https://maplibre.org/maplibre-style-spec/layers/)
