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

    const panes = [
      {
        tab: "Anchors",
        testId: "workspace-anchors",
        heading: "Client anchors unavailable",
        description: "No persisted trip is selected for this workspace, so client constraints are not shown as if they were real."
      },
      {
        tab: "Timeline",
        testId: "workspace-timeline",
        heading: "Timeline unavailable",
        description: "Select a persisted trip before timeline events or editorial actions can be loaded."
      },
      {
        tab: "Validation",
        testId: "workspace-validation",
        heading: "Validation unavailable",
        description: "Validation checks require persisted itinerary evidence and are not fabricated here."
      }
    ] as const;

    const assertActivePane = async (pane: (typeof panes)[number]) => {
      const tab = page.getByRole("tab", { name: pane.tab });
      const activePane = page.getByTestId(pane.testId);
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(activePane).toBeVisible();
      await expect(activePane.getByRole("heading", { name: pane.heading })).toBeVisible();
      await expect(activePane.getByText(pane.description, { exact: true })).toBeVisible();
    };

    await assertActivePane(panes[0]);
    for (const pane of panes.slice(1)) {
      await page.getByRole("tab", { name: pane.tab }).click();
      await assertActivePane(pane);
    }
    await page.getByRole("tab", { name: panes[0].tab }).click();
    await assertActivePane(panes[0]);

    const geometry = await page.evaluate(() => {
      const activePane = Array.from(
        document.querySelectorAll<HTMLElement>("[data-testid^='workspace-']")
      ).find((element) => window.getComputedStyle(element).display !== "none");
      const renderedPanel = activePane?.querySelector<HTMLElement>("[data-testid='decision-state-panel']");
      if (!activePane || !renderedPanel) throw new Error("Console workspace geometry is unavailable");
      const activeRect = activePane.getBoundingClientRect();
      const panelRect = renderedPanel.getBoundingClientRect();
      return {
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        activeTop: activeRect.top,
        activeBottom: activeRect.bottom,
        panelTop: panelRect.top,
        panelBottom: panelRect.bottom,
        panelHeight: panelRect.height
      };
    });

    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(geometry.documentHeight).toBeLessThanOrEqual(geometry.viewportHeight + 1);
    expect(geometry.panelTop).toBeGreaterThanOrEqual(geometry.activeTop - 1);
    expect(geometry.panelBottom).toBeLessThanOrEqual(geometry.activeBottom + 1);
    expect(geometry.panelHeight).toBeGreaterThanOrEqual(220);
  });
});
