import { expect, test } from "@playwright/test";

test("@smoke legacy prototype path redirects to the live app", async ({ page }) => {
  await page.goto("/prototype.html");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1:visible")).toHaveCount(1);
});
