import { expect, test } from "@playwright/test";

test.describe("public discovery and trust routes", () => {
  test("renders a public shell with exact navigation", async ({ page }) => {
    await page.goto("/explore");
    const mobileToggle = page.getByTestId("top-nav-mobile-toggle").first();
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
    }
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    for (const label of ["Discover", "Destinations", "How it works", "Pricing", "Plan a trip"]) {
      await expect(page.getByRole("link", { name: label, exact: true }).first()).toBeVisible();
    }
  });

  test("destination cards activate by keyboard and preserve draft URL", async ({ page }) => {
    await page.goto("/explore");
    const card = page.getByTestId("atlas-card-lisbon");
    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/planner\?destination=lisbon&days=7&transport=transit&vibe=balanced/);
  });

  test("pricing exposes the three ascension choices", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("free preview", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("€19").first()).toBeVisible();
    await expect(page.getByText("€49").first()).toBeVisible();
  });

  test("offline page offers recovery action", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.locator('a[href="/explore"]')).toBeVisible();
  });
});
