# Rumia Visual Hardening and Release-Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the three visible defects left in the approved Rumia frontend family, make those defects mechanically detectable, and produce a new exact-artifact candidate without broadening product or launch scope.

**Architecture:** Keep the existing route catalogue, activity-first journeys, and four scene grammars. Repair the Planner by restoring the declared midnight field, repair Home by removing unintended implicit grid placement and making the mobile activity cards one-up, and repair Console Workspace by removing the nested viewport-height canvas. Extend the existing exact-artifact gate with focused composition checks and review only the six desktop/mobile baselines touched by these changes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS 4, Vitest 3, Playwright 1.57, Axe, PostgreSQL-backed Better Auth fixtures, pnpm 10, Node 24.

## Global Constraints

- Preserve the Portugal-wide, activity-first thesis: judged activities first; planning, saving, review, and export later.
- Home must not become a destination chooser, booking marketplace, generic itinerary generator, map hero, or AI-chat acquisition surface.
- Preserve the olive/ochre editorial language, self-hosted typography, existing local media, reduced-motion/data behavior, and English-only release copy.
- Do not add dependencies, database migrations, API behavior, feature flags, environment files, map/3D work, payments, email, uploads, B2B enablement, or public ingress.
- Do not reset, clean, stage, or delete the existing untracked screenshots, Playwright output, scripts, or `TODO.md` in `/Users/cheng/rota`.
- Execute from an isolated `codex/rumia-visual-hardening` worktree created from `origin/main` at or after `dfbc31c`; use `superpowers:using-git-worktrees` before implementation.
- Use TDD: establish each focused red assertion, implement only the bounded fix, and rerun the focused gate before the task commit.
- Browser acceptance sizes remain exactly 1440×1000, 1024×768, 768×1024, and 390×844.
- The release gate must use one production build, one standalone server on `127.0.0.1:3105`, one Playwright worker, one recorded build ID/digest, and a verified closed port afterward.
- Do not refresh snapshots until the owner explicitly approves every changed candidate. The existing 102-row approval remains historical evidence; this pass owns a six-row delta only.
- This plan ends at a locally committed, push-ready, deploy-ready candidate. Pushing, private VPS deployment, and public ingress require separate explicit user authorization.

## Canonical Inputs

- Product philosophy: `docs/superpowers/plans/2026-07-10-rumia-activity-first-master.md`
- Completed frontend baseline: `docs/superpowers/plans/2026-07-15-rumia-frontend-finish.md`
- Durable execution ledger: `.superpowers/sdd/progress.md`
- Current route/state approval: `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- Existing exact-artifact runner: `scripts/run-exact-artifact-gate.mjs`
- Release boundary: `docs/ops/launch.md` and `docs/ops/cutover-evidence.md`

## File and Responsibility Map

| File | Responsibility in this pass |
| --- | --- |
| `apps/web/app/globals.css` | Planner field/ink pairing and route-specific visual composition |
| `packages/ui/src/styles.css` | Shared `RouteScene` normal-flow versus overlay geometry |
| `apps/web/app/(marketing)/page.tsx` | Home chapter tone and stable scene markers |
| `apps/web/app/(marketing)/page.test.tsx` | Home semantic scene contract |
| `apps/web/app/_components/destination-bento.tsx` | One-up mobile activity-card grid and clipping-safe content |
| `apps/web/app/_components/destination-bento.test.tsx` | Responsive card-class contract and activity-first copy/links |
| `apps/web/app/planner/_components/planner-single-screen.tsx` | Existing Planner decision surface; no flow rewrite |
| `apps/web/playwright/tests/accessibility.spec.ts` | Full Axe audit for `/planner` |
| `apps/web/playwright/tests/visual-quality.spec.ts` | Focused computed-style and geometry contracts for Planner and Home |
| `apps/web/app/console/workspace/page.tsx` | Truthful Console empty composition without nested viewport height |
| `apps/web/playwright/tests/console-workspace-responsive.spec.ts` | Mobile pane reachability and no-blank-tail contract |
| `scripts/run-exact-artifact-gate.mjs` | Inclusion of the two focused composition specs in the canonical gate |
| `docs/reviews/2026-07-16-rumia-snapshot-approval.md` | Six-row hardening delta and owner decisions |
| `docs/superpowers/PLAN-INDEX.md` | Active/completed authority and next checkpoint |
| `.superpowers/sdd/progress.md` | Task-level execution receipt |
| `docs/ops/cutover-evidence.md` | Honest local-candidate/not-deployed boundary |

---

### Task 1: Restore the Planner Midnight Field and Enforce Contrast

**Files:**

- Create: `apps/web/playwright/tests/visual-quality.spec.ts`
- Modify: `apps/web/app/globals.css:910-915`
- Modify: `apps/web/playwright/tests/accessibility.spec.ts:329-341`
- Modify: `scripts/run-exact-artifact-gate.mjs:13-23`
- Test: `apps/web/playwright/tests/visual-quality.spec.ts`

**Interfaces:**

- Consumes: `data-testid="planner-single-screen"`, the `rumia-planner-page` class, and the stable `--color-midnight` / `--color-linen` tokens.
- Produces: `withMobilePage(browser, path, options, assertion)`, reused by Task 2, plus a Planner contract that requires a midnight root and linen H1 at 390×844.

- [ ] **Step 1: Write the focused Planner browser contract**

Create `apps/web/playwright/tests/visual-quality.spec.ts` with this complete initial content:

```ts
import { expect, test, type Browser, type Page } from "@playwright/test";

import { assertExactArtifactReceipt } from "../visual-state-matrix";

type RouteOptions = {
  storageState?: string;
};

export async function withMobilePage(
  browser: Browser,
  path: string,
  options: RouteOptions,
  assertion: (page: Page) => Promise<void>
): Promise<void> {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:3105",
    viewport: { width: 390, height: 844 },
    ...(options.storageState ? { storageState: options.storageState } : {})
  });
  const page = await context.newPage();
  try {
    await page.goto(path, { waitUntil: "load" });
    await assertion(page);
  } finally {
    await context.close();
  }
}

test.describe("@smoke @visual-quality bounded visual hardening", () => {
  test.beforeEach(() => {
    assertExactArtifactReceipt();
  });

  test("planner--ready uses the midnight decision field with linen ink", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "one canonical mobile composition run");

    await withMobilePage(browser, "/planner", {}, async (page) => {
      const surface = page.getByTestId("planner-single-screen");
      await expect(surface).toBeVisible();
      const styles = await surface.evaluate((element) => {
        const heading = element.querySelector("h1");
        if (!(heading instanceof HTMLElement)) throw new Error("Planner H1 is missing");
        return {
          backgroundColor: window.getComputedStyle(element).backgroundColor,
          headingColor: window.getComputedStyle(heading).color
        };
      });

      expect(styles.backgroundColor).toBe("rgb(22, 40, 31)");
      expect(styles.headingColor).toBe("rgb(239, 236, 230)");
    });
  });
});
```

- [ ] **Step 2: Run the Planner contract and verify the current artifact is red**

Run:

```bash
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' pnpm --dir apps/web exec playwright test playwright/tests/visual-quality.spec.ts --config playwright.config.ts --project desktop-1440 --grep 'planner--ready' --workers=1
```

Expected: FAIL because the Planner root computes to a transparent/light field instead of `rgb(22, 40, 31)`.

- [ ] **Step 3: Make the Planner background declaration preserve its semantic field**

Replace the `background:` shorthand in `.rumia-planner-page` with explicit color and image properties:

```css
.rumia-planner-page {
  background-color: var(--color-midnight);
  background-image:
    radial-gradient(circle at 84% 12%, rgba(234, 184, 117, 0.13), transparent 22rem),
    radial-gradient(circle at 4% 86%, rgba(60, 84, 71, 0.28), transparent 28rem),
    linear-gradient(145deg, #10271d 0%, #162f24 52%, #0d1f16 100%);
}
```

Why this exact change: `.rumia-surface[data-surface-texture="none"]` intentionally removes `background-image`; it must not also expose the beige ancestor by allowing the route-specific shorthand to reset `background-color` to transparent.

- [ ] **Step 4: Put the Planner through the existing full Axe helper**

End the existing `planner is choice-led and input-free` test with:

```ts
  await verifyCustomerBodyMinimum(page, "/planner");
  await runAxe(page, "/planner");
```

This intentionally uses the same `runAxe` helper as public/traveler routes so `color-contrast` remains part of the serious/critical gate.

- [ ] **Step 5: Add the focused quality spec to the exact-artifact runner**

Add this entry to `NON_VISUAL_SPECS` immediately after `preference-accessibility.spec.ts`:

```js
  "playwright/tests/visual-quality.spec.ts",
```

- [ ] **Step 6: Rerun focused Planner proof**

Run the Step 2 command again.

Expected: PASS in the desktop project’s single canonical 390×844 context, with three project skips when the whole four-project gate runs.

Then run:

```bash
pnpm --dir apps/web test:typecheck
pnpm exec vitest run apps/web/app/planner/_components/planner-single-screen.test.tsx
git diff --check
```

Expected: Playwright TypeScript passes, Planner component tests pass, and `git diff --check` prints no errors.

- [ ] **Step 7: Commit the Planner fix and its guard**

```bash
git add apps/web/app/globals.css apps/web/playwright/tests/accessibility.spec.ts apps/web/playwright/tests/visual-quality.spec.ts scripts/run-exact-artifact-gate.mjs
git commit -m "fix(frontend): restore planner decision contrast"
```

---

### Task 2: Repair Home Chapter Flow and One-Up Mobile Activity Cards

**Files:**

- Modify: `packages/ui/src/styles.css:343-357`
- Modify: `apps/web/app/(marketing)/page.tsx:90-184`
- Modify: `apps/web/app/(marketing)/page.test.tsx:43-55`
- Modify: `apps/web/app/_components/destination-bento.tsx:58-86,166-230`
- Modify: `apps/web/app/_components/destination-bento.test.tsx`
- Modify: `apps/web/playwright/tests/visual-quality.spec.ts`
- Test: `apps/web/app/(marketing)/page.test.tsx`
- Test: `apps/web/app/_components/destination-bento.test.tsx`
- Test: `apps/web/playwright/tests/visual-quality.spec.ts`

**Interfaces:**

- Consumes: Task 1’s `withMobilePage`, existing Home scene IDs, existing region URLs, and `RouteScene layout="overlay"` for the cover/activity-detail hero.
- Produces: a normal-flow stacked scene contract, a linen Decision chapter between dark Home chapters, and three full-width 320px mobile activity cards with unchanged activity-first destinations.

- [ ] **Step 1: Write the red Home semantic and geometry assertions**

In `apps/web/app/(marketing)/page.test.tsx`, replace the second test body with:

```ts
  it("alternates cover, decision, field-note, and atlas chapters", async () => {
    const page = await HomePage();
    render(page);

    expect(screen.getByTestId("home-cover").getAttribute("data-tone")).toBe("cover");
    expect(screen.getByTestId("home-editorial-chapter").getAttribute("data-tone")).toBe("decision");
    expect(screen.getByTestId("home-editorial-chapter").getAttribute("data-focal-layer")).toBe("typography");
    expect(screen.getByTestId("home-field-note-chapter").getAttribute("data-tone")).toBe("cover");
    expect(screen.getByTestId("home-atlas-chapter").getAttribute("data-tone")).toBe("atlas");
  });
```

Append this test inside the existing `@visual-quality` describe block:

```ts
  test("home--ready keeps readable chapters and one-up mobile activity cards", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "one canonical mobile composition run");

    await withMobilePage(browser, "/", {}, async (page) => {
      await expect(page.getByTestId("home-editorial-chapter")).toHaveAttribute("data-tone", "decision");
      const geometry = await page.getByTestId("destination-bento-grid").evaluate((grid) => {
        const gridRect = grid.getBoundingClientRect();
        const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-testid^='bento-card-']"));
        return {
          gridHeight: gridRect.height,
          cards: cards.map((card) => {
            const rect = card.getBoundingClientRect();
            const content = card.querySelector<HTMLElement>("[data-bento-content]");
            const contentRect = content?.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              leftOffset: rect.left - gridRect.left,
              rightOverflow: rect.right - gridRect.right,
              contentFits: Boolean(
                contentRect &&
                contentRect.left >= rect.left &&
                contentRect.right <= rect.right &&
                content &&
                content.scrollWidth <= content.clientWidth + 1 &&
                content.scrollHeight <= content.clientHeight + 1
              )
            };
          })
        };
      });

      expect(geometry.cards).toHaveLength(3);
      expect(geometry.gridHeight).toBeLessThanOrEqual(1_040);
      for (const card of geometry.cards) {
        expect(card.width).toBeGreaterThanOrEqual(320);
        expect(card.height).toBeGreaterThanOrEqual(300);
        expect(card.height).toBeLessThanOrEqual(340);
        expect(Math.abs(card.leftOffset)).toBeLessThanOrEqual(1);
        expect(card.rightOverflow).toBeLessThanOrEqual(1);
        expect(card.contentFits).toBe(true);
      }
    });
  });
```

- [ ] **Step 2: Run the Home tests and verify they fail for the current composition**

Run:

```bash
pnpm exec vitest run apps/web/app/'(marketing)'/page.test.tsx apps/web/app/_components/destination-bento.test.tsx
```

Expected: FAIL because `home-editorial-chapter` is still `utility` and `home-field-note-chapter` is absent.

Run:

```bash
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' pnpm --dir apps/web exec playwright test playwright/tests/visual-quality.spec.ts --config playwright.config.ts --project desktop-1440 --grep 'home--ready' --workers=1
```

Expected: FAIL on the Decision tone and/or the 320px one-up card geometry.

- [ ] **Step 3: Remove unintended named-grid placement from stacked scenes only**

Keep the four existing slot declarations for explicit overlay composition. Immediately after them, add this normal-flow override:

```css
.rumia-route-scene--stacked > .rumia-route-scene__media,
.rumia-route-scene--stacked > .rumia-route-scene__foreground,
.rumia-route-scene--stacked > .rumia-route-scene__aside,
.rumia-route-scene--stacked > .rumia-route-scene__actions {
  grid-area: auto;
  min-width: 0;
}
```

Do not add a grid-area template. Stacked scenes should auto-place their optional slots in source order; overlay scenes retain the existing named slots and explicit absolute media/action positioning. This scope keeps the approved Home cover and activity-detail hero out of the geometry fix.

- [ ] **Step 4: Give Home an intentional light Decision chapter and stable field-note marker**

Change the second and third Home scenes to:

```tsx
        <RouteScene
          tone="decision"
          bleed="contained"
          focalLayer="typography"
          data-testid="home-editorial-chapter"
          foreground={<HomeJudgementChapter />}
        />

        <RouteScene
          tone="cover"
          bleed="contained"
          focalLayer="media"
          data-testid="home-field-note-chapter"
          media={<PortugalEditorialChapter />}
          foreground={<HomeFieldNoteCopy />}
        />
```

Do not change the hero question, composer, activity-first proof rail, field-note copy, region URLs, or Explore handoff.

- [ ] **Step 5: Make the activity atlas one card at a time on mobile**

Change the first two `gridClass` values to:

```ts
gridClass: "row-span-1 md:col-span-8 md:row-span-2"
```

and:

```ts
gridClass: "row-span-1 md:col-span-4 md:row-span-2"
```

Change the Azores value to:

```ts
gridClass: "row-span-1 md:col-span-12"
```

Replace the section and grid opening with:

```tsx
    <section
      className="rumia-destination-bento relative z-20 mx-auto mt-0 w-full max-w-7xl px-container-padding-sm py-12 md:-mt-16 md:px-container-padding-lg md:py-section-gap"
      data-testid="destination-bento"
      data-mode={mode}
    >
      <div
        data-testid="destination-bento-grid"
        className="grid grid-cols-1 auto-rows-[20rem] gap-gutter md:grid-cols-12 md:auto-rows-[250px]"
      >
```

Add a clipping marker to the existing absolute content wrapper:

```tsx
              <div
                data-bento-content
                className={`absolute inset-0 z-20 flex min-w-0 flex-col justify-end overflow-hidden p-card-padding ${card.contentClass}`}
              >
```

Add `max-w-full` to both CTA span class lists. Keep each whole card as the single link and keep all controls at least 44px high.

- [ ] **Step 6: Add the responsive class contract to the component test**

Append to `DestinationBento activity mode`:

```ts
  it("uses one full-width activity card per row before the desktop bento breakpoint", () => {
    render(<DestinationBento mode="explore" />);

    expect(screen.getByTestId("destination-bento-grid")).toHaveClass(
      "grid-cols-1",
      "auto-rows-[20rem]",
      "md:grid-cols-12",
      "md:auto-rows-[250px]"
    );
    expect(screen.getByTestId("bento-card-lisbon")).toHaveClass("row-span-1", "md:row-span-2");
    expect(screen.getByTestId("bento-card-douro")).toHaveClass("row-span-1", "md:row-span-2");
    expect(screen.getByTestId("bento-card-azores")).toHaveClass("row-span-1", "md:col-span-12");
  });
```

- [ ] **Step 7: Prove Home green and the shared activity overlay unchanged**

Run:

```bash
pnpm exec vitest run apps/web/app/'(marketing)'/page.test.tsx apps/web/app/_components/destination-bento.test.tsx apps/web/app/_components/route-scene.test.tsx
pnpm --dir apps/web test:typecheck
```

Expected: all focused Vitest tests and Playwright typecheck pass.

Run the Home visual-quality command from Step 2 again.

Expected: PASS with three full-width cards, each 300–340px high, no internal clipping, and a Decision-tone editorial chapter.

Then run the unchanged activity-detail baseline as a shared-primitive guard:

```bash
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' pnpm --dir apps/web exec playwright test playwright/tests/visual.spec.ts --config playwright.config.ts --project desktop-1440 --grep 'activities--activityId---ready' --workers=1
```

Expected: PASS against the existing activity-detail baseline; a diff here means the shared `RouteScene` change is too broad and must be narrowed before commit.

- [ ] **Step 8: Commit the Home composition repair**

```bash
git add packages/ui/src/styles.css apps/web/app/'(marketing)'/page.tsx apps/web/app/'(marketing)'/page.test.tsx apps/web/app/_components/destination-bento.tsx apps/web/app/_components/destination-bento.test.tsx apps/web/playwright/tests/visual-quality.spec.ts
git commit -m "fix(frontend): repair home mobile chapter flow"
```

---

### Task 3: Remove the Console Workspace Blank Mobile Tail

> **Completed-plan authority supersession — 2026-07-18.** The 78% endpoint
> below was a provisional implementation heuristic written before the owner
> explicitly approved the exact Console desktop/mobile compositions later on
> 2026-07-18. That later exact-image approval supersedes 78%; it does not
> authorize changing approved pixels. The enforceable completed-plan contract
> is: after activating each real Anchors, Timeline, and Validation
> `DecisionStatePanel`, panel bottom is at least 70% of the first viewport and
> no greater than `viewportHeight + 1`; document height is no greater than
> `viewportHeight + 1`; document width has no overflow; the panel is contained
> in its active pane; and all three panes remain reachable and truthful. The
> unchanged approved 390x844 composition measured Anchors at 628.78125 px
> (74.50%) and Timeline/Validation at 602.78125 px (71.42%). Approved mobile
> blob `e728dc6df41251a8352d2d51a226de60f206e928` remains immutable.

**Files:**

- Modify: `apps/web/app/console/workspace/page.tsx`
- Modify: `apps/web/playwright/tests/console-workspace-responsive.spec.ts`
- Modify: `scripts/run-exact-artifact-gate.mjs`
- Test: `apps/web/app/console/_components/console-mobile-view-switcher.test.tsx`
- Test: `apps/web/playwright/tests/console-workspace-responsive.spec.ts`

**Interfaces:**

- Consumes: `OperatorShell` as the sole viewport-height and page-padding owner, the existing three mobile tabs, and truthful unavailable `DecisionStatePanel` content.
- Produces: `data-testid="console-workspace-content"`, a single-viewport empty composition, and a canonical responsive test included in the exact gate.

- [ ] **Step 1: Strengthen the responsive spec before changing the page**

Replace `apps/web/playwright/tests/console-workspace-responsive.spec.ts` with:

```ts
import { expect, test } from "@playwright/test";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { assertExactArtifactReceipt } from "../visual-state-matrix";

test.describe("@console-workspace-responsive console mobile panes", () => {
  test.use({ storageState: createAdminStorageState() });
  test.beforeEach(() => {
    assertExactArtifactReceipt();
  });

  test("console-workspace--empty exposes every pane without a blank-page tail", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "owned by the canonical mobile project");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/console/workspace", { waitUntil: "load" });

    await page.getByRole("tab", { name: "Timeline" }).click();
    await expect(page.getByTestId("workspace-timeline")).toBeVisible();
    await page.getByRole("tab", { name: "Validation" }).click();
    await expect(page.getByTestId("workspace-validation")).toBeVisible();
    await expect(page.locator("html")).toHaveCSS("overflow-x", "visible");

    const geometry = await page.evaluate(() => {
      const workspace = document.querySelector<HTMLElement>("[data-testid='console-workspace-content']");
      const activePane = Array.from(
        document.querySelectorAll<HTMLElement>("[data-testid^='workspace-']")
      ).find((element) => window.getComputedStyle(element).display !== "none");
      if (!workspace || !activePane) throw new Error("Console workspace geometry is unavailable");
      return {
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        activeBottom: activePane.getBoundingClientRect().bottom,
        workspaceBottom: workspace.getBoundingClientRect().bottom
      };
    });

    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(geometry.documentHeight).toBeLessThanOrEqual(geometry.viewportHeight + 1);
    expect(geometry.workspaceBottom).toBeLessThanOrEqual(geometry.documentHeight + 1);
    expect(geometry.activeBottom).toBeGreaterThanOrEqual(geometry.viewportHeight * 0.78);
  });
});
```

- [ ] **Step 2: Run the Console browser test and verify the current page is red**

Run:

```bash
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' pnpm --dir apps/web exec playwright test playwright/tests/console-workspace-responsive.spec.ts --config playwright.config.ts --project mobile-390 --workers=1
```

Expected: FAIL because the nested `min-h-screen` makes the full mobile document taller than 844px and the new root marker is absent.

- [ ] **Step 3: Let OperatorShell own the viewport and padding**

Replace the page root opening with:

```tsx
    <div
      data-testid="console-workspace-content"
      className="min-w-0 overflow-x-hidden"
    >
```

Remove `min-h-screen`, `bg-background`, and the inner `p-container-padding-sm lg:p-container-padding-lg`; `OperatorShell` already owns all three concerns.

Pass this class to each of the three `DecisionStatePanel` instances:

```tsx
            className="min-h-[20rem] lg:min-h-[22rem]"
```

Keep all unavailable titles/descriptions unchanged. Do not add sample data, fake success metrics, a publish action, or a disabled control that resembles a live operation.

- [ ] **Step 4: Include the Console composition test in the exact runner**

Add immediately after `visual-quality.spec.ts` in `NON_VISUAL_SPECS`:

```js
  "playwright/tests/console-workspace-responsive.spec.ts",
```

- [ ] **Step 5: Prove the mobile Console composition green**

Run:

```bash
pnpm exec vitest run apps/web/app/console/_components/console-mobile-view-switcher.test.tsx packages/ui/src/components/decision-state-panel.test.tsx
pnpm --dir apps/web test:typecheck
```

Expected: focused component tests and Playwright TypeScript pass.

Run the Step 2 browser command again.

Historical provisional expectation: PASS with Timeline and Validation reachable, 390px document width, document height no greater than 845px, and the active panel extending through at least 78% of the first viewport. The dated owner-approval supersession above replaces only that provisional percentage with the measured 70% contract and requires assertions after activating all three panes.

- [ ] **Step 6: Commit the Console composition repair**

```bash
git add apps/web/app/console/workspace/page.tsx apps/web/playwright/tests/console-workspace-responsive.spec.ts scripts/run-exact-artifact-gate.mjs
git commit -m "fix(operator): close console mobile empty tail"
```

---

### Task 4: Build One Candidate and Conduct the Bounded Visual Review

**Files:**

- Modify after inspection: `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- Evidence only: `output/playwright/exact-artifact/build-receipt.json`
- Evidence only: `apps/web/playwright/test-results/`

**Interfaces:**

- Consumes: Tasks 1–3, the existing 102 primary baselines, the exact-artifact runner, PostgreSQL fixture data, and the in-app browser.
- Produces: one build receipt, one six-row PENDING/APPROVED delta, candidate/diff images, and an explicit owner decision before any PNG replacement.

- [ ] **Step 1: Run focused static and unit gates before materializing the candidate**

```bash
pnpm exec vitest run apps/web/app/'(marketing)'/page.test.tsx apps/web/app/_components/destination-bento.test.tsx apps/web/app/_components/route-scene.test.tsx apps/web/app/planner/_components/planner-single-screen.test.tsx apps/web/app/console/_components/console-mobile-view-switcher.test.tsx packages/ui/src/components/decision-state-panel.test.tsx
pnpm --dir apps/web test:typecheck
pnpm typecheck
pnpm lint
pnpm qa:motion-gate
pnpm qa:assets
pnpm qa:perf-budget
pnpm check:migrations
pnpm repo:safety
git diff --check
```

Expected: every command exits 0; no source or environment file is generated by these checks.

- [ ] **Step 2: Build exactly once with process-only local values**

```bash
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' pnpm build
```

Expected: production build exits 0 and creates `apps/web/.next/BUILD_ID` plus `apps/web/.next/standalone/apps/web/server.js`.

- [ ] **Step 3: Run pre-approval against that one build**

```bash
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' node scripts/run-exact-artifact-gate.mjs --phase pre-approval
```

Expected: all non-visual checks pass; the command exits non-zero only for the six intentional stale baselines listed below; `output/playwright/exact-artifact/build-receipt.json` records one build ID/digest; port 3105 closes.

Expected changed baselines:

```text
home--ready--desktop-1440-desktop-1440-darwin.png
home--ready--mobile-390-mobile-390-darwin.png
planner--ready--desktop-1440-desktop-1440-darwin.png
planner--ready--mobile-390-mobile-390-darwin.png
console-workspace--empty--desktop-1440-desktop-1440-darwin.png
console-workspace--empty--mobile-390-mobile-390-darwin.png
```

Any seventh changed baseline is a scope failure. Narrow the shared CSS change or add the route to this plan through a reviewed change request before continuing.

- [ ] **Step 4: Inspect the exact public routes in the in-app browser**

Use `browser:control-in-app-browser` with a temporary viewport override. Start the already-built standalone server from `apps/web/.next/standalone/apps/web` on port 3105; do not run another build. Inspect `/` and `/planner` at 390×844, 768×1024, and 1440×1000. Use the exact Playwright admin capture for `/console/workspace` unless the in-app browser already has a valid admin session; do not weaken auth or inject a browser cookie for visual convenience.

Start the exact server in a dedicated terminal from the standalone directory:

```bash
cd apps/web/.next/standalone/apps/web
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' HOSTNAME='127.0.0.1' PORT='3105' NODE_ENV='production' node server.js
```

After inspection, terminate that process, reset the temporary in-app-browser viewport override, finalize the review tabs with no kept intermediates, and verify `lsof -nP -iTCP:3105 -sTCP:LISTEN` prints no listener.

Acceptance checklist:

- Home: first viewport still asks the activity question and exposes the single Explore action; the Decision chapter is visibly light with dark readable copy; the field note remains one coherent image/copy chapter; mobile shows one full-width activity card at a time; no card copy/CTA clips; region links still lead to judged activities.
- Planner: the full field is midnight, H1/body/controls are readable, choices remain finite and input-free, selected state does not rely on color alone, and the primary continuation remains reachable at 390px.
- Console Workspace: unavailable data is stated truthfully, all three panes remain reachable from tabs, no fake operational data appears, and full-page mobile capture ends at the first viewport instead of scrolling into an empty field.
- Shared regression: activity detail’s overlay hero, verdict, caveat, and save action retain the approved composition.

- [ ] **Step 5: Append the six-row delta and stop for owner approval**

Append a section titled `## 2026-07-18 bounded hardening delta` to `docs/reviews/2026-07-16-rumia-snapshot-approval.md`. Add exactly the six rows above with scenario, route, persona/state, viewport, old baseline, candidate, diff, decision, and reason. Mark every row `PENDING` until the owner explicitly approves or rejects it.

Do not run `--update-snapshots` in this task.

---

### Task 5: Update Only the Approved Six-Image Family and Run the Final Gate

**Files:**

- Modify only after approval: `apps/web/playwright/tests/visual.spec.ts-snapshots/home--ready--desktop-1440-desktop-1440-darwin.png`
- Modify only after approval: `apps/web/playwright/tests/visual.spec.ts-snapshots/home--ready--mobile-390-mobile-390-darwin.png`
- Modify only after approval: `apps/web/playwright/tests/visual.spec.ts-snapshots/planner--ready--desktop-1440-desktop-1440-darwin.png`
- Modify only after approval: `apps/web/playwright/tests/visual.spec.ts-snapshots/planner--ready--mobile-390-mobile-390-darwin.png`
- Modify only after approval: `apps/web/playwright/tests/visual.spec.ts-snapshots/console-workspace--empty--desktop-1440-desktop-1440-darwin.png`
- Modify only after approval: `apps/web/playwright/tests/visual.spec.ts-snapshots/console-workspace--empty--mobile-390-mobile-390-darwin.png`
- Modify: `docs/reviews/2026-07-16-rumia-snapshot-approval.md`

**Interfaces:**

- Consumes: one explicit owner decision per changed row and the unchanged Task 4 build receipt.
- Produces: a six-image baseline commit and a complete green exact-artifact final run against the same build digest.

- [ ] **Step 1: Verify approval is complete before image mutation**

Run:

```bash
rg -n '2026-07-18 bounded hardening delta|PENDING|REJECTED|APPROVED' docs/reviews/2026-07-16-rumia-snapshot-approval.md
```

Expected: the delta contains six `APPROVED` rows and no `PENDING` or `REJECTED` row. If any row is not approved, stop and return to the rejected route task.

- [ ] **Step 2: Refresh only the three changed scenario families**

```bash
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' node scripts/run-exact-artifact-gate.mjs --phase update-family --grep 'home--ready|planner--ready|console-workspace--empty' --update-snapshots
```

Expected: only the six approved PNGs change and the runner closes port 3105.

- [ ] **Step 3: Prove the snapshot diff is exactly scoped**

```bash
git diff --name-only -- apps/web/playwright/tests/visual.spec.ts-snapshots | sort
```

Expected output is exactly the six paths listed in this task’s Files section. No other PNG, test result, HTML report, or output artifact may be staged.

- [ ] **Step 4: Run the complete final gate against the unchanged build**

```bash
DATABASE_URL='postgresql://rumia_app:build@127.0.0.1:5432/rumia' BETTER_AUTH_SECRET='build-only-secret-that-is-at-least-32-characters' STRIPE_SECRET_KEY='sk_test_fake' STRIPE_WEBHOOK_SECRET='whsec_build_only' NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_build_only' NEXT_PUBLIC_APP_URL='http://127.0.0.1:3105' node scripts/run-exact-artifact-gate.mjs --phase final
```

Expected: exit 0; all non-visual suites pass; all 102 primary visual rows pass; only the runner’s intentional project/state exclusions skip; build ID and SHA-256 digest match Task 4; no listener remains.

Verify closure:

```bash
lsof -nP -iTCP:3105 -sTCP:LISTEN
git diff --check
```

Expected: `lsof` prints no listener and `git diff --check` prints no error.

- [ ] **Step 5: Commit approved images separately**

```bash
git add apps/web/playwright/tests/visual.spec.ts-snapshots/home--ready--desktop-1440-desktop-1440-darwin.png apps/web/playwright/tests/visual.spec.ts-snapshots/home--ready--mobile-390-mobile-390-darwin.png apps/web/playwright/tests/visual.spec.ts-snapshots/planner--ready--desktop-1440-desktop-1440-darwin.png apps/web/playwright/tests/visual.spec.ts-snapshots/planner--ready--mobile-390-mobile-390-darwin.png apps/web/playwright/tests/visual.spec.ts-snapshots/console-workspace--empty--desktop-1440-desktop-1440-darwin.png apps/web/playwright/tests/visual.spec.ts-snapshots/console-workspace--empty--mobile-390-mobile-390-darwin.png
git commit -m "test(visual): approve hardening baseline delta"
```

---

### Task 6: Reconcile Authority and Record an Honest Release-Ready Handoff

**Files:**

- Modify: `docs/superpowers/PLAN-INDEX.md`
- Modify: `.superpowers/sdd/progress.md`
- Modify: `docs/reviews/2026-07-16-rumia-snapshot-approval.md`
- Modify: `docs/ops/cutover-evidence.md`
- Test: planning/evidence consistency via `rg`, `git diff --check`, and `git status`

**Interfaces:**

- Consumes: exact Task 5 command output, build receipt, final Playwright report, owner decisions, and final commits.
- Produces: one consistent authority story: July 15 plan complete, July 18 hardening complete, candidate locally release-ready, latest private VPS release unchanged, public ingress still deferred.

- [ ] **Step 1: Close the July 18 rows with measured evidence**

In the approval ledger, keep the prior 102-row approval intact and add beneath the six-row delta:

```markdown
Hardening delta result: all six changed rows received explicit owner approval, the scoped update changed only those six PNGs, and the final exact-artifact gate passed against the same recorded build ID/digest. This approval does not authorize deployment or public ingress.
```

- [ ] **Step 2: Reconcile the plan index**

Update `docs/superpowers/PLAN-INDEX.md` so it states:

```markdown
- The 2026-07-15 17-task frontend finish plan is complete and remains the accepted 53-route baseline.
- The 2026-07-18 visual-hardening plan is the only active frontend follow-up and is complete only when its six-row delta and final exact-artifact gate close.
- Planner contrast, Home mobile chapter/card geometry, and Console Workspace mobile blank-tail composition are the bounded defects owned by this follow-up.
- Public ingress, deployment, Map Phase 2/3, and gated product capabilities remain separate.
```

When the pass is complete, mark the July 18 plan `COMPLETED — FRONTEND HARDENING`; do not leave either the old RLS blocker or an open 102-row ledger described as current truth.

- [ ] **Step 3: Append the exact execution receipt to progress**

Add a `## 2026-07-18 visual-hardening ledger` section to `.superpowers/sdd/progress.md` containing:

- Task 1 Planner commit and focused test result.
- Task 2 Home commit, focused unit/browser result, and activity-detail no-regression result.
- Task 3 Console commit and mobile geometry result.
- Task 4 build ID/digest and six candidate decisions.
- Task 5 scoped update result, full final non-visual/visual counts, intentional skips, and port closure.
- Task 6 documentation commit and explicit `not deployed` status.

Copy the measured IDs and counts from `output/playwright/exact-artifact/build-receipt.json` and the final Playwright reports. Do not reuse the July 17 receipt for a newly built artifact.

- [ ] **Step 4: Keep cutover evidence honest**

Add a dated local-candidate note to `docs/ops/cutover-evidence.md` that identifies the final commit and exact build receipt as **not deployed**. Preserve the existing private VPS release identity until a separately authorized deployment actually succeeds. Keep public DNS/Caddy ingress deferred.

- [ ] **Step 5: Scan for contradictory current-state claims**

```bash
rg -n 'ledger is therefore open|no snapshot update has been authorized|current blocker is local .*RLS|finish plan active|exact-artifact convergence is in progress' docs/superpowers/PLAN-INDEX.md .superpowers/sdd/progress.md
git diff --check
git status --short
```

Expected: the stale-current phrases do not appear in current-status sections; historical evidence may retain dated descriptions. `git diff --check` passes. `git status --short` lists only the intended tracked plan/runtime/test/evidence changes plus the pre-existing untracked artifacts.

- [ ] **Step 6: Commit the final evidence separately**

```bash
git add docs/superpowers/PLAN-INDEX.md .superpowers/sdd/progress.md docs/reviews/2026-07-16-rumia-snapshot-approval.md docs/ops/cutover-evidence.md
git commit -m "docs(frontend): close visual hardening pass"
```

Do not push, deploy, reload Caddy, change DNS, or mutate the VPS in this task.

---

## Acceptance Summary

The pass is complete only when all of these statements are true:

1. Planner computes a midnight root and linen headline at 390×844, passes Axe, and retains the choice-led activity flow.
2. Home’s editorial chapter uses the Decision field/ink pairing; all three mobile activity cards are at least 320px wide, 300–340px high, one per row, and unclipped; activity-detail overlay remains unchanged.
3. Console Workspace exposes all three truthful panes, renders no fabricated data, has no horizontal overflow, does not create a document taller than 845px at the 390×844 empty state, contains the real active panel in its pane, and places each activated panel bottom between 70% of the first viewport and `viewportHeight + 1` under the dated owner-approval supersession above.
4. Focused unit/type/browser gates pass before candidate generation.
5. One exact build produces one receipt, six reviewed visual differences, a scoped six-PNG update, and a final green 102-row visual family.
6. The owner explicitly approves all six changed rows.
7. Plan index, progress ledger, snapshot approval, and cutover evidence agree that the local candidate is release-ready but not deployed.
8. No existing untracked artifact is staged or deleted; no schema, environment file, dependency, feature flag, map/3D capability, gated product feature, VPS service, DNS record, or public ingress changes.

## Execution Handoff

Plan execution has two supported modes:

1. **Subagent-Driven (recommended):** use `superpowers:subagent-driven-development`, one fresh worker per task, with spec-compliance and code-quality review before the next dependent task.
2. **Inline Execution:** use `superpowers:executing-plans` in this task, executing serially with a checkpoint after Tasks 3, 4, and 5.

In both modes, begin with `superpowers:using-git-worktrees`; do not implement directly in the current dirty `main` checkout.
