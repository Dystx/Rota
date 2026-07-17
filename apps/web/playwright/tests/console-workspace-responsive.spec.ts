import { expect, test } from "@playwright/test";
import { createAdminStorageState } from "../fixtures/admin-auth";

test.describe("@console-workspace-responsive console mobile panes", () => {
  test.use({ storageState: createAdminStorageState() });

  test("mobile workspace exposes every pane without a blank-page tail", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/console/workspace");

    await page.getByRole("tab", { name: "Timeline" }).click();
    await expect(page.getByTestId("workspace-timeline")).toBeVisible();
    await page.getByRole("tab", { name: "Validation" }).click();
    await expect(page.getByTestId("workspace-validation")).toBeVisible();
    await expect(page.locator("html")).toHaveCSS("overflow-x", "visible");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
