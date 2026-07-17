import { expect, test } from "@playwright/test";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { reviewerTripPath } from "../fixtures/reviewer-trip";

test.describe("@smoke @reviewer-assigned-access", () => {
  test("anonymous reviewer trip route redirects before private trip data renders", async ({ page }) => {
    await page.goto("/reviewer/trips/42");

    await expect(page).toHaveURL(/\/sign-in\?next=%2Freviewer%2Ftrips%2F42/);
    await expect(page.getByTestId("reviewer-trip-header")).toHaveCount(0);
    await expect(page.getByText("Client brief context")).toHaveCount(0);

    // This is evidence for the redirect contract, not a full-page visual
    // baseline. Keeping the viewport capture bounded avoids Chromium's
    // full-page capture race when both browser projects run the guard. A
    // short retry handles the mobile protocol race that can occur while the
    // redirected sign-in shell is still committing its final paint.
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(100);
    let screenshotError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await page.screenshot({
          fullPage: false,
          path: "../../.sisyphus/evidence/future-roadmap/task-29-reviewer-assigned-access.png"
        });
        screenshotError = undefined;
        break;
      } catch (error) {
        screenshotError = error;
        await page.waitForTimeout(250);
      }
    }
    if (screenshotError) throw screenshotError;
  });
});

test.describe("@reviewer-assigned-access authenticated", () => {
  test.use({ storageState: createReviewerStorageState() });

  test("unassigned reviewer trip stays in the unavailable state", async ({ page }) => {
    await page.goto(reviewerTripPath("unassigned"));

    await expect(page.getByTestId("reviewer-trip-header")).toBeVisible();
    await expect(page.getByText("This reviewer trip is unavailable.", { exact: true })).toHaveCount(1);
    await expect(page.getByText("Client brief context", { exact: true })).toHaveCount(0);
  });
});
