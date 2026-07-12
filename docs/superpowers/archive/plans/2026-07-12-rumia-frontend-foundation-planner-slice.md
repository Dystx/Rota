
# Rumia Frontend Foundation + Planner Slice — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Each task ends with an independently verifiable gate.

**Goal:** Make the shared Rumia shell, activity workspace, and planner read as one editorial chosen-day product at desktop and mobile widths without changing the backend or introducing the optional map.

**Architecture:** Add small token-backed editorial primitives in `packages/ui`, use them in the public shell and chosen-day surfaces, preserve the existing `EditorialActivity` and URL contracts, and verify behavior with focused Vitest, Playwright, axe, and reduced-motion checks.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, `packages/ui`, Motion, Vitest, Playwright, and the existing Better Auth/VPS runtime.

## Global Constraints

- The activity list and editorial judgement remain the source of truth.
- `/planner` remains compatible with direct entry and selected activity IDs.
- Do not add a booking, chatbot, destination-search, or automatic itinerary path.
- Do not add MapLibre or 3D in this slice.
- Do not change database schemas, auth, server repositories, or persistence contracts.
- Preserve anonymous URL state and sign-in return links.
- Preserve the existing footer five-column correction and one Support link.
- All primary controls remain keyboard reachable with visible focus.
- Fixed mobile UI must reserve safe-area space and never cover a primary action.
- Reduced motion removes nonessential transitions, transforms, and delayed reveals.
- Run tests from the `rumia-phase0` worktree; do not reuse a stale server for browser evidence.

---

## File map

| File | Slice responsibility |
| --- | --- |
| `packages/ui/src/styles.css` | Shared token aliases and reduced-motion contract |
| `packages/ui/src/components/editorial.tsx` | Kicker, heading, rule, and status primitives |
| `packages/ui/src/components/editorial.test.tsx` | Primitive semantics and tone tests |
| `packages/ui/src/index.ts` | Public primitive exports |
| `apps/web/app/_components/top-nav.tsx` | Public navigation state and focus |
| `apps/web/app/_components/site-footer.tsx` | Five-column footer and link groups |
| `apps/web/app/_components/site-footer.test.tsx` | Footer landmark and duplicate-link regression |
| `apps/web/app/globals.css` | App-level surface and motion rules |
| `apps/web/app/planner/_components/planner-single-screen.tsx` | Direct and selected planner hierarchy |
| `apps/web/app/planner/_components/activity-day-planner.tsx` | Selected-day feasibility surface |
| `apps/web/app/planner/_components/planner-single-screen.test.tsx` | Planner copy, state, and handoff tests |
| `apps/web/app/planner/_components/activity-day-planner.test.ts` | Feasibility and URL contract tests |
| `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx` | Empty/selected/remove/share workspace |
| `apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx` | Workspace state tests |
| `apps/web/app/(marketing)/_components/activity-day-tray.tsx` | Responsive selected-day tray |
| `apps/web/app/(marketing)/_components/activity-day-tray.test.tsx` | Tray semantics and action tests |
| `apps/web/app/(marketing)/explore/activity-explorer.tsx` | Save/remove status handoff |
| `apps/web/app/(marketing)/explore/activity-explorer.test.tsx` | Reversible selection tests |
| `apps/web/playwright/tests/visual.spec.ts` | Reviewed visual coverage |
| `apps/web/playwright/tests/accessibility.spec.ts` | Browser accessibility coverage |
| `apps/web/playwright/tests/mobile-overflow.spec.ts` | 390px overflow coverage |

---

### Task 1: Add token-backed editorial primitives

**Files:**
- Modify: `packages/ui/src/styles.css`, `apps/web/app/globals.css`, `packages/ui/src/index.ts`
- Create: `packages/ui/src/components/editorial.tsx`, `packages/ui/src/components/editorial.test.tsx`

**Interfaces:**
- `EditorialKicker({ children, tone, className })`
- `EditorialHeading({ eyebrow, title, dek, as, tone, className })`
- `EditorialRule({ className })`
- `StatusRegion({ children, politeness, testId })`

- [x] **Step 1: Write failing tests.**
  ```tsx
  it("renders the editorial heading grammar", () => {
    render(
      <EditorialHeading
        eyebrow="Portugal"
        title="Shape a chosen day"
        dek="Test the time before you commit."
      />
    );
    expect(screen.getByText("Portugal")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Shape a chosen day" })).toBeInTheDocument();
    expect(screen.getByText("Test the time before you commit.")).toBeInTheDocument();
  });

  it("renders a live status region with requested politeness", () => {
    render(<StatusRegion politeness="assertive" testId="status">Saved</StatusRegion>);
    expect(screen.getByTestId("status")).toHaveAttribute("aria-live", "assertive");
  });
  ```
- [x] **Step 2: Run the focused test and verify failure.**
  ```bash
  pnpm --dir packages/ui test -- src/components/editorial.test.tsx
  ```
  Expected: FAIL because `editorial.tsx` does not yet export the primitives.
- [x] **Step 3: Implement the minimum primitives.** Keep the heading element selectable through `as`, use the semantic surface tone only for classes, and render `StatusRegion` with `role="status"` and the requested `aria-live` value.
- [x] **Step 4: Add the token aliases.** Add named display/body/metadata aliases, the 4/8 spacing rhythm, linen/sage/midnight/ochre semantic surface aliases, and retain the existing global reduced-motion reset.
- [x] **Step 5: Run tests and typecheck.**
  ```bash
  pnpm --dir packages/ui test -- src/components/editorial.test.tsx
  pnpm --dir packages/ui typecheck
  ```
  Expected: PASS.
- [x] **Step 6: Commit.**
  ```bash
  git add packages/ui/src/styles.css apps/web/app/globals.css packages/ui/src/components/editorial.tsx packages/ui/src/components/editorial.test.tsx packages/ui/src/index.ts
  git commit -m "feat: add rumia editorial primitives"
  ```

---

### Task 2: Normalize the public shell and footer

**Files:**
- Modify: `apps/web/app/_components/top-nav.tsx`, `apps/web/app/_components/site-footer.tsx`, `apps/web/app/(marketing)/layout.tsx`, `apps/web/app/globals.css`
- Modify: `apps/web/app/_components/top-nav.test.tsx`
- Create: `apps/web/app/_components/site-footer.test.tsx`

- [x] **Step 1: Write the footer regression test.**
  ```tsx
  it("renders five groups and only one Support link", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Support" })).toHaveLength(1);
    expect(screen.getByTestId("site-footer-grid")).toHaveClass("md:grid-cols-5");
  });
  ```
- [x] **Step 2: Run the test and verify failure** if the test IDs/grid contract are not present.
  ```bash
  pnpm exec vitest run apps/web/app/_components/site-footer.test.tsx
  ```
- [x] **Step 3: Implement shell semantics.** Keep the public `main` and skip-link target, make the footer grid five columns at `md`, remove duplicate Support from Legal, and retain mobile stacking.
- [x] **Step 4: Normalize navigation focus.** Ensure menu open/close has an accessible name, Escape closes it, focus returns to the trigger, and all icon-only controls use `Icon` with a visible focus ring.
- [x] **Step 5: Run shell tests.**
  ```bash
  pnpm exec vitest run apps/web/app/_components/top-nav.test.tsx apps/web/app/_components/site-footer.test.tsx
  pnpm --dir apps/web test:a11y -- --grep "navigation|footer"
  ```
  Expected: PASS with one Support link and no literal icon-font text.
- [x] **Step 6: Commit.**
  ```bash
  git add apps/web/app/_components/top-nav.tsx apps/web/app/_components/site-footer.tsx 'apps/web/app/(marketing)/layout.tsx' apps/web/app/globals.css apps/web/app/_components/top-nav.test.tsx apps/web/app/_components/site-footer.test.tsx
  git commit -m "feat: align rumia public shell"
  ```

---

### Task 3: Reframe the planner as a chosen-day surface

**Files:**
- Modify: `apps/web/app/planner/_components/planner-single-screen.tsx`
- Modify: `apps/web/app/planner/_components/activity-day-planner.tsx`
- Modify: `apps/web/app/planner/page.tsx` only if metadata or selected-ID parsing needs the existing activity-first copy
- Modify: `apps/web/app/planner/_components/planner-single-screen.test.tsx`
- Modify: `apps/web/app/planner/_components/activity-day-planner.test.ts`

**Interfaces:**
- Preserve `PlannerInitialState`, `ActivityDayPlanner`, `assessActivityDay`, `activityDayPlannerHref`, and `activityDaySignInHref`.
- Selected mode consumes `initialActivities: readonly EditorialActivity[]`.
- Direct mode continues to consume `TripChoiceDraft` and `draftToPlannerUrl`.

- [x] **Step 1: Add failing copy/continuity assertions.**
  ```tsx
  it("uses chosen-day language for selected activities", () => {
    render(
      <PlannerSingleScreen
        initialActivityIds={["porto-ribeira-slow-walk"]}
        initialActivities={[REVIEWED_ACTIVITY_SEED[0]!]}
      />
    );
    expect(screen.getByRole("heading", { name: /Shape your chosen day/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Build my itinerary" })).toBeNull();
  });
  ```
- [x] **Step 2: Run focused planner tests and verify the new assertion fails** against the legacy selected-mode copy.
  ```bash
  pnpm exec vitest run apps/web/app/planner/_components/planner-single-screen.test.tsx
  ```
- [x] **Step 3: Change selected-mode hierarchy.** Render the selected activities first, use `EditorialHeading` with “Shape your chosen day,” keep timing/transport controls after the selection, and remove “Advanced day planning” and “Build my itinerary” from this branch.
- [x] **Step 4: Preserve the direct path.** Keep destination, duration, travel window, transport, vibe, option sheets, and direct `draftToPlannerUrl` behavior. Use “Start with an activity decision” as the direct-mode explanation.
- [x] **Step 5: Preserve URL state.** Keep `router.replace(activityDayPlannerHref(...), { scroll: false })` when day time or transport changes. Do not introduce a server write.
- [x] **Step 6: Run planner tests.**
  ```bash
  pnpm exec vitest run apps/web/app/planner/_components/planner-single-screen.test.tsx apps/web/app/planner/_components/activity-day-planner.test.ts
  ```
  Expected: PASS for selected mode, direct mode, feasibility states, cross-region refusal, URL persistence, and sign-in return.
- [x] **Step 7: Commit.**
  ```bash
  git add apps/web/app/planner
  git commit -m "feat: reframe rumia planner around chosen days"
  ```

---

### Task 4: Improve workspace and mobile day-tray states

**Files:**
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-day-tray.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-day-tray.test.tsx`

**Interfaces:**
- Preserve `initialActivities: readonly EditorialActivity[]`.
- Preserve `onRemove(activityId)` and `onContinue()`.
- Preserve the current status strings and undo semantics unless copy is made more explicit.

- [x] **Step 1: Add failing empty-state assertions.**
  ```tsx
  it("makes an empty day recoverable", () => {
    render(<ActivityWorkspace initialActivities={[]} />);
    expect(screen.getByRole("heading", { name: /choose again/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Keep exploring" })).toBeInTheDocument();
  });
  ```
- [x] **Step 2: Run workspace tests and verify the new expectation fails** if the empty state lacks the action/preview.
  ```bash
  pnpm exec vitest run 'apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx' 'apps/web/app/(marketing)/_components/activity-day-tray.test.tsx'
  ```
- [x] **Step 3: Implement the empty state.** Use a short editorial explanation, show the shape of a selected day (time, judgement, and practical space), and make “Keep exploring” the primary recovery action.
- [x] **Step 4: Implement the selected state.** Keep numbered order, verdict, best-time, planning, avoid-when, evidence link, total time, share, feedback, remove, and undo visible without hover.
- [x] **Step 5: Keep mobile safe.** Preserve the safe-area bottom offset, add enough page bottom padding for the fixed tray, keep the tray action at least 44px, and ensure the tray never covers the main content action.
- [x] **Step 6: Test status and reversal.** Assert remove, undo, share fallback, clipboard success/failure, feedback link, and `aria-live` status text.
- [x] **Step 7: Commit.**
  ```bash
  git add 'apps/web/app/(marketing)/explore/workspace' 'apps/web/app/(marketing)/_components/activity-day-tray.tsx'
  git commit -m "feat: improve rumia workspace states"
  ```

---

### Task 5: Add status-first feedback and reduced-motion-safe transitions

**Files:**
- Modify: `apps/web/app/(marketing)/explore/activity-explorer.tsx`
- Modify: `apps/web/app/(marketing)/explore/workspace/activity-workspace.tsx`
- Modify: `apps/web/app/(marketing)/_components/activity-day-tray.tsx`
- Modify: `packages/ui/src/components/toast.tsx`
- Modify: `apps/web/app/globals.css`
- Test: activity explorer/workspace tests and `apps/web/scripts/check-motion-imports.mjs`

- [x] **Step 1: Add failing status assertions.** Saving, removing, restoring, replacing, and failed sharing must update the live status region with text that identifies the activity or recovery action.
- [x] **Step 2: Implement status-first feedback.** Keep the existing `status` state and expose it through `StatusRegion`. Toasts may mirror the message, but the page status remains authoritative.
- [x] **Step 3: Add short transitions.** Use opacity/position changes only after state updates. Keep phrase/rail changes within 120–180ms and save/remove cues within 160–220ms.
- [x] **Step 4: Preserve reduced motion.** Use `useReducedMotion` and the existing CSS reset so transitions become immediate and no map/card camera work is introduced.
- [x] **Step 5: Run gates.**
  ```bash
  pnpm qa:motion-gate
  pnpm exec vitest run 'apps/web/app/(marketing)/explore/activity-explorer.test.tsx' 'apps/web/app/(marketing)/explore/workspace/activity-workspace.test.tsx'
  pnpm --dir apps/web test:a11y
  ```
  Expected: PASS with no forbidden motion imports and all state changes announced.
- [x] **Step 6: Commit.**
  ```bash
  git add 'apps/web/app/(marketing)/explore' 'apps/web/app/(marketing)/_components/activity-day-tray.tsx' packages/ui/src/components/toast.tsx apps/web/app/globals.css
  git commit -m "feat: add rumia feedback states"
  ```

---

### Task 6: Verify the first slice before any map work

**Files:**
- Modify: `apps/web/playwright/tests/visual.spec.ts` only for intentional route coverage
- Modify: `apps/web/playwright/tests/accessibility.spec.ts`
- Modify: `apps/web/playwright/tests/mobile-overflow.spec.ts`
- Modify: `apps/web/playwright/tests/viewport-contract.spec.ts`
- Modify: `docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md`

- [x] **Step 1: Run static gates.**
  ```bash
  pnpm --dir apps/web typecheck
  pnpm lint:eslint
  pnpm build
  git diff --check
  ```
  Expected: PASS.
- [x] **Step 2: Run focused browser gates.**
  ```bash
  pnpm --dir apps/web test:e2e -- --grep "planner|workspace|public discovery"
  pnpm --dir apps/web test:a11y
  pnpm --dir apps/web test:e2e -- --grep "mobile overflow|viewport"
  ```
  Expected: PASS at 1440x900 and 390x844 with no document-level horizontal overflow.
- [x] **Step 3: Review visual baselines.** Capture homepage, explore, workspace, planner, sign-in, support, and one activity detail route. Compare route-by-route; update only intentional screenshots and record each decision in the baseline matrix.
- [x] **Step 4: Confirm no map dependency entered the critical path.** Inspect the route bundle/build output and verify the homepage remains static and map-free.
- [x] **Step 5: Commit evidence.**
  ```bash
  git add apps/web/playwright/tests docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md
  git commit -m "test: verify rumia foundation planner slice"
  ```

## Handoff to the full roadmap

This slice is complete when Tasks 1–6 pass. Only then should the full roadmap continue to public editorial surfaces, spatial Phase 1, camera storytelling, and optional 3D. The map plan must not be used to reopen the homepage or backend scope.

**Execution status (2026-07-12):** Tasks 1–6 are complete. Static, browser,
accessibility, motion, overflow, viewport, and visual evidence is recorded in
`.superpowers/sdd/task-9-release-gates-report.md` and
`docs/reviews/2026-07-12-rumia-frontend-baseline-matrix.md`. Spatial Phase 1
was implemented only after this slice cleared; camera storytelling and richer
3D remain separate deferred phases.
