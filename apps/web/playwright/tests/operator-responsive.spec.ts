import { expect, test } from "@playwright/test";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";

test.describe("@smoke @operator-responsive reviewer queue", () => {
  test.use({ storageState: createReviewerStorageState() });

  test("reviewer queue retains triage actions on mobile", async ({ page }) => {
    await page.goto("/reviewer/queue");
    await expect(page.getByTestId("reviewer-queue-mobile").getByRole("button")).toHaveCount(2);
    await expect(page.getByTestId("reviewer-queue-mobile")).not.toHaveCSS("overflow-x", "visible");
  });
});

test.describe("@smoke @operator-responsive admin places", () => {
  test.use({ storageState: createAdminStorageState() });

  test("admin places keeps filters and actions above the fold", async ({ page }) => {
    await page.goto("/admin/places");
    await expect(page.getByTestId("admin-filter-bar")).toBeVisible();
    await expect(page.getByRole("button", { name: /add place/i })).toBeVisible();
  });
});

test.describe("@smoke @operator-responsive admin truth states", () => {
  test.use({ storageState: createAdminStorageState() });

  test("specialists exposes the persisted roster boundary", async ({ page }) => {
    await page.goto("/admin/specialists");
    await expect(page.getByTestId("admin-specialists-header")).toBeVisible();
    await expect(page.getByTestId("admin-specialists-table")).toBeVisible();
  });

  test("analytics exposes metric and unavailable boundaries", async ({ page }) => {
    await page.goto("/admin/analytics");
    await expect(page.getByTestId("admin-analytics-header")).toBeVisible();
    await expect(page.getByTestId("analytics-metrics")).toBeVisible();
    await expect(page.getByTestId("analytics-snapshot")).toBeVisible();
  });
});
