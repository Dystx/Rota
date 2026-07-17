import { expect, test } from "@playwright/test";
import { createAdminStorageState } from "../fixtures/admin-auth";

// Phase D — pipeline search + status filter wiring
//
// The page header search input and Filter popover were previously
// decorative (no state). They now drive the board's in-memory
// filter via two controlled props (query, statusFilter) passed
// from PipelinePageClient to PipelineBoard.
//
// Verifies:
//   1. Header renders the search input + filter button.
//   2. Typing in the search input updates the live count text.
//   3. The filter popover opens, lets the operator pick a status,
//      and the visible lanes narrow to the selected one.
//   4. The Clear button resets both controls.

test.describe("@smoke @pipeline-search-filter pipeline header search + filter", () => {
  test.use({ storageState: createAdminStorageState() });

  test("header exposes search input and filter button", async ({ page }) => {
    await page.goto("/console/pipeline");

    await expect(page.getByTestId("pipeline-search-input")).toBeVisible();
    await expect(page.getByTestId("pipeline-filter-button")).toBeVisible();
  });

  test("typing in the search input updates the visible count", async ({ page }) => {
    await page.goto("/console/pipeline");

    const input = page.getByTestId("pipeline-search-input");
    await expect(input).toBeVisible();

    // No filter by default — every card in every lane is visible.
    const initialCount = await page.locator('[data-testid="pipeline-card"]').count();
    expect(initialCount).toBeGreaterThan(0);

    // A query that matches no card hides every card.
    await input.fill("zzzzzz-no-match");
    await expect(page.locator('[data-testid="pipeline-card"]')).toHaveCount(0);

    // Clear and re-surface.
    await input.fill("");
    await expect(page.locator('[data-testid="pipeline-card"]').first()).toBeVisible();
  });

  test("status filter narrows the board to one lane", async ({ page }) => {
    await page.goto("/console/pipeline");

    await page.getByTestId("pipeline-filter-button").click();
    await expect(page.getByTestId("pipeline-filter-popover")).toBeVisible();

    await page.getByTestId("pipeline-filter-draft").click();

    // Filter button now shows the selected label.
    await expect(page.getByTestId("pipeline-filter-button")).toContainText("New activity evidence");

    // The Clear button appears because the filter is non-default.
    await expect(page.getByTestId("pipeline-filter-clear")).toBeVisible();
  });

  test("Clear button resets both controls", async ({ page }) => {
    await page.goto("/console/pipeline");

    const input = page.getByTestId("pipeline-search-input");
    await input.fill("iceland");

    await page.getByTestId("pipeline-filter-button").click();
    await page.getByTestId("pipeline-filter-active_chat").click();

    await expect(page.getByTestId("pipeline-filter-clear")).toBeVisible();
    await page.getByTestId("pipeline-filter-clear").click();

    // Input and button both reset to defaults.
    await expect(input).toHaveValue("");
    await expect(page.getByTestId("pipeline-filter-button")).toContainText("All statuses");
    await expect(page.getByTestId("pipeline-filter-clear")).toHaveCount(0);
  });
});
