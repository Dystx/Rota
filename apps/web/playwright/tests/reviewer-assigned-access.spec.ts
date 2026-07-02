import { expect, test } from "@playwright/test";

test.describe("@smoke @reviewer-assigned-access", () => {
  test("anonymous reviewer trip route redirects before private trip data renders", async ({ page }) => {
    await page.goto("/reviewer/trips/42");

    await expect(page).toHaveURL(/\/sign-in\?next=%2Freviewer%2Ftrips%2F42/);
    await expect(page.getByTestId("reviewer-trip-header")).toHaveCount(0);
    await expect(page.getByText("Client brief context")).toHaveCount(0);

    await page.screenshot({
      fullPage: true,
      path: "../../.sisyphus/evidence/future-roadmap/task-29-reviewer-assigned-access.png"
    });
  });
});
