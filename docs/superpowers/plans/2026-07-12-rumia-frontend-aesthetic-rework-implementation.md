
# Rumia Frontend Aesthetic Rework — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Each task ends with an independently verifiable gate.

**Goal:** Make Rumia feel like one coherent, editorial Portugal activity guide from the first situation brief through a saved day and optional spatial explanation.

**Architecture:** Preserve the existing Next.js/React activity-first flow and `packages/ui` primitives. Add a token-backed visual system and explicit state contracts first; then align public and chosen-day surfaces; then add controlled motion and the optional MapLibre capability behind lazy, list-first boundaries.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, `packages/ui`, Motion, Playwright, axe, the existing `@repo/spatial-engine` MapLibre adapter, Better Auth, and the current VPS-native runtime.

## Global Constraints

- Portugal-wide activity coverage remains the product scope; Porto may be the first deep corpus but not the only visible scope.
- Rumia is not a booking platform, hotel finder, destination chooser, travel agency, global directory, generic itinerary generator, or chatbot.
- The activity list, editorial judgement, and practical consequences remain authoritative; maps and motion are progressive enhancements.
- `/planner` must consume selected activity IDs when present and retain a truthful direct-entry path.
- No Supabase, database migration, or persistence redesign is part of this frontend plan.
- No homepage-critical WebGL, automatic map tour, scroll hijacking, autoplay video, custom cursor, or hover-only meaning.
- Every interactive primitive must define keyboard, touch, focus, loading, success, error, empty, and reduced-motion behavior.
- Images, basemap styles, tiles, route geometries, fonts, sprites, and datasets require recorded provenance and licence terms before publication.
- Practical primary controls target 44px; WCAG 2.2 AA remains the release bar.
- Performance targets are LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1 at the 75th percentile.
- Visual snapshots are reviewed route-by-route; stale baselines are never refreshed blindly.

---

## Source contracts

Read these before changing code:

- `docs/superpowers/specs/2026-07-12-rumia-frontend-aesthetic-rework-design.md`
- `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`
- `docs/superpowers/plans/2026-07-11-rumia-full-redesign-and-ui-plan.md`
- `docs/superpowers/specs/2026-07-10-rumia-activity-curation-design.md`
- `docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md`
- `docs/reviews/2026-07-11-rumia-browser-ui-review.md`

The detailed first slice is separately documented in:
`docs/superpowers/plans/2026-07-12-rumia-frontend-foundation-planner-slice.md`

## File map

| Area | Primary files | Responsibility |
| --- | --- | --- |
| Tokens/primitives | `packages/ui/src/styles.css`, `packages/ui/src/components/editorial.tsx` | Shared visual language and semantic primitives |
| Public shell | `apps/web/app/_components/top-nav.tsx`, `site-footer.tsx`, `apps/web/app/globals.css` | Navigation, footer, safe surfaces, motion rules |
| Public journey | `apps/web/app/(marketing)/page.tsx`, `portugal`, `explore`, `activities/[activityId]` | Situation, judged results, dossier, collections |
| Chosen day | `apps/web/app/(marketing)/explore/workspace`, `apps/web/app/planner` | Selection authority and practical feasibility |
| Spatial | `packages/spatial-engine/src`, `apps/web/app/(marketing)/_components/activity-map*` | Optional MapLibre map, route, fallback, camera |
| Verification | `apps/web/playwright/tests`, `docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md` | Browser, a11y, performance, visual evidence |

---

### Task 1: Establish the frontend baseline and design contract

**Files:**
- Create: `docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md`
- Modify: `docs/reviews/2026-07-11-rumia-browser-ui-review.md`
- Test: `apps/web/playwright/tests/visual.spec.ts`, `accessibility.spec.ts`, `mobile-overflow.spec.ts`

**Interfaces:**
- Consumes: current route catalogue, screenshots, browser review findings, and the approved design spec.
- Produces: a route-by-viewport evidence matrix used by every visual task.

- [ ] **Step 1: Write the matrix.** Record public, chosen-day, utility, traveler, reviewer, and operator routes at 1440x900 and 390x844. For every route record h1, primary action, semantic surface, overflow status, keyboard status, reduced-motion status, and baseline decision (\`keep\`, \`review\`, or \`replace\`).
- [ ] **Step 2: Run evidence.**
  ```bash
  pnpm --dir apps/web test:visual
  pnpm --dir apps/web test:a11y
  pnpm --dir apps/web test:perf
  pnpm --dir apps/web test:e2e
  ```
  Expected: route-level evidence is recorded. Existing screenshot height drift is marked \`review\`, not blindly accepted or refreshed.
- [ ] **Step 3: Record the design contract.** Add \`kicker -> headline -> dek -> judgement/evidence -> action -> source/context\`, the spacing rhythm \`4,8,12,16,24,32,48,64,96\`, and surfaces \`linen, sage, midnight olive, ochre\`.
- [ ] **Step 4: Check and commit.**
  ```bash
  git diff --check
  git add docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md docs/reviews/2026-07-11-rumia-browser-ui-review.md
  git commit -m "docs: record rumia frontend baseline matrix"
  ```

---

### Task 2: Implement shared editorial tokens and primitives

**Files:**
- Modify: `packages/ui/src/styles.css`, `apps/web/app/globals.css`, `packages/ui/src/index.ts`
- Create: `packages/ui/src/components/editorial.tsx`, `packages/ui/src/components/editorial.test.tsx`

**Interfaces:**
- Produces `EditorialKicker`, `EditorialHeading`, `EditorialRule`, and `StatusRegion`.
- Exact public shape:
  ```tsx
  export type EditorialTone = "linen" | "sage" | "midnight" | "ochre";
  export function EditorialKicker(props: { children: React.ReactNode; tone?: EditorialTone; className?: string }): React.JSX.Element;
  export function EditorialHeading(props: { eyebrow?: string; title: string; dek?: string; as?: "h1" | "h2" | "h3"; tone?: EditorialTone; className?: string }): React.JSX.Element;
  export function EditorialRule(props: { className?: string }): React.JSX.Element;
  export function StatusRegion(props: { children: React.ReactNode; politeness?: "polite" | "assertive"; testId?: string }): React.JSX.Element;
  ```

- [ ] **Step 1: Add named aliases without deleting compatibility variables.** Extend `packages/ui/src/styles.css` for typography, spacing, surfaces, and motion. Keep the existing reduced-motion reset as the single reset.
- [ ] **Step 2: Implement and export primitives.** `EditorialHeading` renders one requested heading, optional eyebrow, and optional dek. `StatusRegion` renders a queryable live region. None hide essential content behind hover.
- [ ] **Step 3: Test rendering and semantics.** Assert one heading, visible dek, tone class, and `aria-live` politeness. Test the package export.
- [ ] **Step 4: Run and commit.**
  ```bash
  pnpm --dir packages/ui test -- src/components/editorial.test.tsx
  pnpm --dir packages/ui typecheck
  git add packages/ui/src/styles.css apps/web/app/globals.css packages/ui/src/components/editorial.tsx packages/ui/src/components/editorial.test.tsx packages/ui/src/index.ts
  git commit -m "feat: add rumia editorial ui primitives"
  ```

---

### Task 3: Align the shared shell, navigation, footer, and icons

**Files:**
- Modify: `apps/web/app/_components/top-nav.tsx`, `site-footer.tsx`, `apps/web/app/(marketing)/layout.tsx`, `apps/web/app/globals.css`, `packages/ui/src/components/icon.tsx`
- Modify: `apps/web/app/_components/top-nav.test.tsx`
- Create: `apps/web/app/_components/site-footer.test.tsx`

- [ ] **Step 1: Normalize shell semantics.** Keep one main/skip target, one labelled public navigation, and the footer after route content. Footer groups are Explore, Rumia, Support, Legal, and Account; Support appears exactly once.
- [ ] **Step 2: Normalize icons.** Replace literal Material Symbols text in the public shell with `<Icon name="...">` and add missing SVG paths in `icon.tsx`. Every icon-only button has an accessible name and visible focus ring.
- [ ] **Step 3: Test menu and footer.** Cover menu open/close, Escape, focus return, navigation landmark, contentinfo landmark, one Support link, and SVG icon rendering.
- [ ] **Step 4: Run and commit.**
  ```bash
  pnpm exec vitest run apps/web/app/_components/top-nav.test.tsx apps/web/app/_components/site-footer.test.tsx packages/ui/src/components/icon.test.tsx
  pnpm --dir apps/web test:a11y -- --grep "navigation|footer"
  git add apps/web/app/_components/top-nav.tsx apps/web/app/_components/site-footer.tsx 'apps/web/app/(marketing)/layout.tsx' apps/web/app/globals.css packages/ui/src/components/icon.tsx apps/web/app/_components/top-nav.test.tsx apps/web/app/_components/site-footer.test.tsx
  git commit -m "feat: align rumia public shell"
  ```

---

### Task 4: Rework public activity surfaces as one editorial chapter

**Files:**
- Modify: `apps/web/app/(marketing)/page.tsx`, `portugal/page.tsx`, `portugal/portugal-atlas.tsx`, `explore/activity-explorer.tsx`, `_components/activity-result-card.tsx`, `activities/[activityId]/page.tsx`, `how-it-works/page.tsx`, `_components/how-it-works.tsx`
- Test: the `*.test.tsx` files beside these surfaces

- [ ] **Step 1: Apply the composition grammar.** Every first viewport contains the activity decision, why it matters, and one clear action. Keep the homepage static Portugal context illustration; do not add a map or 3D hero.
- [ ] **Step 2: Align result cards.** Keep verdict, best-for, duration, best-time, pair-with, alternative, and avoid-when visible without hover. Preserve `aria-pressed` and existing activity IDs.
- [ ] **Step 3: Align empty states.** Uncovered situations say they are under review and provide one phrase-change recovery action; no unrelated fixture substitution.
- [ ] **Step 4: Extend tests.** Assert one h1, judgement before facts, reachable next action, reviewed-only cards, and reversible save/remove.
- [ ] **Step 5: Run and commit.**
  ```bash
  pnpm exec vitest run 'apps/web/app/(marketing)/explore/activity-explorer.test.tsx' 'apps/web/app/(marketing)/_components/activity-result-card.test.tsx' 'apps/web/app/(marketing)/portugal/portugal-atlas.test.tsx'
  pnpm --dir apps/web test:e2e -- --grep "public discovery|choice-led"
  git add 'apps/web/app/(marketing)/page.tsx' 'apps/web/app/(marketing)/portugal' 'apps/web/app/(marketing)/explore' 'apps/web/app/(marketing)/_components/activity-result-card.tsx' 'apps/web/app/(marketing)/activities/[activityId]/page.tsx' 'apps/web/app/(marketing)/how-it-works'
  git commit -m "feat: refine rumia editorial activity surfaces"
  ```

---

### Task 5: Make chosen-day workspace and planner visually continuous

**Files:**
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`, `apps/web/app/(marketing)/_components/activity-day-tray.tsx`
- Modify: `apps/web/app/planner/_components/planner-single-screen.tsx`, `activity-day-planner.tsx`, `apps/web/app/planner/page.tsx`
- Test: the planner, workspace, and day-tray test files

- [ ] **Step 1: Reframe planner copy.** Use “Shape a day” for selected activity mode and “Start with an activity decision” for direct entry. Remove “Advanced day planning” and “Build my itinerary” from the selected-day path.
- [ ] **Step 2: Keep the chosen source visible.** Render selected activities before timing and transport controls. Preserve `activityDayPlannerHref(activities, { dayTime, transport })` and never invent transfers.
- [ ] **Step 3: Improve workspace states.** Empty state includes a preview of the selected-day shape and a prominent “Keep exploring.” Selected state keeps judgement and facts; remove stays reversible.
- [ ] **Step 4: Keep mobile safe.** Fixed tray appears only with selections, reserves safe area, and never covers the main action; the list remains complete without it.
- [ ] **Step 5: Extend tests.** Assert “Shape your chosen day,” absence of “Build my itinerary” in selected mode, preserved activity IDs/order, cross-region refusal, feasibility states, URL persistence, sign-in return, undo, share, and feedback.
- [ ] **Step 6: Run and commit.**
  ```bash
  pnpm exec vitest run apps/web/app/planner/_components/planner-single-screen.test.tsx apps/web/app/planner/_components/activity-day-planner.test.ts 'apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx' 'apps/web/app/(marketing)/_components/activity-day-tray.test.tsx'
  pnpm --dir apps/web test:e2e -- --grep "trip|planner|workspace"
  git add apps/web/app/planner 'apps/web/app/(marketing)/explore/workspace' 'apps/web/app/(marketing)/_components/activity-day-tray.tsx'
  git commit -m "feat: unify rumia chosen-day surfaces"
  ```

---

### Task 6: Add purposeful motion and feedback states

**Files:**
- Modify: `packages/ui/src/components/toast.tsx`, `packages/ui/src/components/page-transition.tsx`, `packages/ui/src/lib/view-transition.ts`, `apps/web/app/globals.css`
- Modify: activity explorer, workspace, and day-tray components
- Test: relevant component tests and `apps/web/scripts/check-motion-imports.mjs`

- [ ] **Step 1: Set motion durations.** Use 120–180ms for phrase/rail changes, 160–220ms for save/remove cues, and opacity-only route transitions. Motion never delays state.
- [ ] **Step 2: Make status text authoritative.** Save, remove, restore, replace, conflict, and error all update a live status region; toast may repeat the message but is never the only signal.
- [ ] **Step 3: Test reduced motion.** Verify zero transition/animation duration and no automatic camera or card-flight behavior under `prefers-reduced-motion: reduce`.
- [ ] **Step 4: Run and commit.**
  ```bash
  pnpm qa:motion-gate
  pnpm --dir apps/web test:a11y
  git add packages/ui/src/components/toast.tsx packages/ui/src/components/page-transition.tsx packages/ui/src/lib/view-transition.ts apps/web/app/globals.css 'apps/web/app/(marketing)/explore' 'apps/web/app/(marketing)/_components/activity-day-tray.tsx'
  git commit -m "feat: add rumia state feedback motion"
  ```

---

### Task 7: Add the progressive activity-map capability

**Files:**
- Create: `apps/web/app/(marketing)/_components/activity-map-model.ts`, `activity-map-model.test.ts`, `activity-map.tsx`, `activity-map.test.tsx`, `activity-map-fallback.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`, workspace page, and `packages/spatial-engine/src/components/workspace-canvas.tsx`
- Create or modify: `packages/spatial-engine/src/adapters/maplibre/layers/activity-points.ts` and its test; export it from `packages/spatial-engine/src/index.ts`
- Test: spatial integration, mobile overflow, accessibility, and performance specs

**Interfaces:**
- `ActivityMapPoint` validates reviewed activity ID, title, `{lng,lat}`, precision/privacy, verdict, duration, best time, and attribution.
- `ActivityMapViewState` is `{ mode: "list" | "map"; selectedActivityId: string | null; center: [number, number]; zoom: number; pitch: number; bearing: number; reducedMotion: boolean }`.
- The map receives controlled selected IDs and emits `onSelectActivity(activityId)`; it never owns itinerary truth.

- [ ] **Step 1: Build the pure map model.** Reject non-reviewed records, validate coordinate ranges, label approximate geometry, preserve stable IDs, and return the complete list fallback for invalid/missing points.
- [ ] **Step 2: Implement Phase 1.** Lazy-load MapLibre through `@repo/spatial-engine`, use mercator/top-down defaults, render one-to-five numbered points, and mount only after explicit “View on map.”
- [ ] **Step 3: Add controls/fallback.** Provide View map, View list, Fit this day, Reset north, zoom, close, attribution, retry, and a semantic list/static fallback. Never draw an invented route line.
- [ ] **Step 4: Add selection.** Card-to-marker and marker-to-card selection update focus and live status. The list remains complete and keyboard-accessible.
- [ ] **Step 5: Add Phase 2 behind an explicit action.** Typed `CameraPreset` data drives “Explore your plan”; reduced motion uses jumps/static stops and never auto-plays.
- [ ] **Step 6: Gate Phase 3.** Terrain, extrusion, and Portugal atlas enhancements require Phase 1/2 performance and accessibility evidence, a feature flag, and provider/licence records. Mobile remains list/2D-first.
- [ ] **Step 7: Run and commit.**
  ```bash
  pnpm exec vitest run 'apps/web/app/(marketing)/_components/activity-map-model.test.ts' packages/spatial-engine/src/adapters/maplibre/layers/activity-points.test.ts
  pnpm --dir apps/web test:e2e -- --grep "map|spatial"
  pnpm --dir apps/web test:a11y
  pnpm --dir apps/web test:perf
  git add 'apps/web/app/(marketing)/_components/activity-map*' 'apps/web/app/(marketing)/explore/workspace' packages/spatial-engine docs/superpowers/specs/2026-07-11-rumia-activity-map-capability.md
  git commit -m "feat: add optional rumia activity map"
  ```

---

### Task 8: Align utility and operator surfaces

**Files:**
- Modify: `apps/web/app/(marketing)/local-expertise/page.tsx`, `human-review/page.tsx`, `pricing/page.tsx`, `apps/web/app/support/page.tsx`, `apps/web/app/offline/page.tsx`, and legal pages
- Modify: `apps/web/app/(app)/account/page.tsx`, reviewer layouts/pages, and console surfaces only where shared shell/state contracts are violated
- Test: `apps/web/playwright/route-matrix.test.ts` and accessibility specs

- [ ] **Step 1: Apply the same hierarchy.** Each utility page has a clear purpose, one useful evidence/action block, and recovery links. Operator surfaces remain dense, keyboard-safe, and task-oriented.
- [ ] **Step 2: Preserve route ownership.** Public, traveler, reviewer, console, and admin boundaries remain unchanged; protected content does not move into marketing layouts.
- [ ] **Step 3: Run and commit.**
  ```bash
  pnpm --dir apps/web test:e2e -- --grep "route matrix|protected|accessibility"
  pnpm --dir apps/web test:a11y
  git add 'apps/web/app/(marketing)/local-expertise' 'apps/web/app/(marketing)/human-review' 'apps/web/app/(marketing)/pricing' apps/web/app/support apps/web/app/offline 'apps/web/app/(app)/account' 'apps/web/app/(reviewer)' apps/web/app/console
  git commit -m "feat: align rumia utility surfaces"
  ```

---

### Task 9: Close release gates and record truthful evidence

**Files:**
- Modify: `apps/web/playwright/tests/visual.spec.ts`, `accessibility.spec.ts`, `mobile-overflow.spec.ts`, `viewport-contract.spec.ts`, `perf.spec.ts`, `web-vitals.spec.ts` only for intentional coverage changes
- Modify: `docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md`
- Modify: `specs/PLAN-AUDIT_LATEST.md` only after evidence is complete

- [ ] **Step 1: Run static gates.**
  ```bash
  pnpm typecheck
  pnpm lint:eslint
  pnpm build
  git diff --check
  ```
  Expected: all pass with the intended environment variables.
- [ ] **Step 2: Run browser gates.**
  ```bash
  pnpm --dir apps/web test:e2e
  pnpm --dir apps/web test:a11y
  pnpm --dir apps/web test:perf
  pnpm --dir apps/web test:visual
  ```
  Review visual changes at 1440px and 390px before updating any snapshot.
- [ ] **Step 3: Run motion and overflow gates.**
  ```bash
  pnpm qa:motion-gate
  pnpm --dir apps/web test:e2e -- --grep "mobile overflow|viewport"
  ```
- [ ] **Step 4: Record command, date, viewport, result, and follow-up for every route group.** Never claim green when a suite is interrupted or has stale mismatches.
- [ ] **Step 5: Commit evidence.**
  ```bash
  git add apps/web/playwright/tests docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md specs/PLAN-AUDIT_LATEST.md
  git commit -m "test: close rumia frontend release gates"
  ```

## Completion definition

The full rework is complete only when Tasks 1–9 have independent gates, the first-slice plan is green, the map capability is separately licensed and feature-gated, and final browser/build evidence is recorded truthfully.
