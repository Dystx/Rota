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
      const geometry = await activePane.evaluate((element) => {
        const renderedPanel = element.querySelector<HTMLElement>("[data-testid='decision-state-panel']");
        if (!renderedPanel) throw new Error("Console workspace DecisionStatePanel is unavailable");
        const activeRect = element.getBoundingClientRect();
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

      expect(geometry.documentWidth, `${pane.tab} must not overflow horizontally`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.documentHeight, `${pane.tab} must not create a blank-page tail`).toBeLessThanOrEqual(geometry.viewportHeight + 1);
      expect(geometry.panelTop, `${pane.tab} panel must stay inside its active pane`).toBeGreaterThanOrEqual(geometry.activeTop - 1);
      expect(geometry.panelBottom, `${pane.tab} panel must stay inside its active pane`).toBeLessThanOrEqual(geometry.activeBottom + 1);
      expect(geometry.panelBottom, `${pane.tab} panel must reach 70% of the first viewport`).toBeGreaterThanOrEqual(geometry.viewportHeight * 0.7);
      expect(geometry.panelBottom, `${pane.tab} panel must end inside the first viewport`).toBeLessThanOrEqual(geometry.viewportHeight + 1);
      expect(geometry.panelHeight).toBeGreaterThanOrEqual(220);
    };

    for (const pane of panes) {
      await page.getByRole("tab", { name: pane.tab }).click();
      await assertActivePane(pane);
    }
  });
});
