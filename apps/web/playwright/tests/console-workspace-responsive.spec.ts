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
