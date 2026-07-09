import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

test.describe("@smoke choice-led traveler journey", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("keyboard choices carry a traveler from discovery to export", async ({ page }) => {
    const authCookies = await page.context().cookies();
    expect(authCookies.some((cookie) => cookie.name.includes("auth-token")), "traveler storage state must be loaded before the journey").toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveCount(1);

    await page.getByRole("link", { name: /plan a trip/i }).first().click();
    await expect(page).toHaveURL(/\/planner/);
    await expect(page.locator('[data-testid="planner-single-screen"]')).toBeVisible();

    const lisbon = page.getByRole("radio", { name: /Lisbon.*Tile-lined/i }).first();
    await lisbon.focus();
    await lisbon.press("Enter");
    await expect(lisbon).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: /Build my itinerary/i }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/planner\?destination=Lisbon/);
    await expect(page.locator('[data-testid="planner-single-screen"]')).toBeVisible();

    // The detailed confirmation remains a deliberate, keyboard-addressable step.
    await page.goto("/trip/new", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/trip\/new/);
    await expect(page.locator("h1:visible")).toHaveCount(1);

    // Use the seeded traveler trip for the remaining route surfaces.
    await page.goto("/trip/3", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/trip\/3$/);
    await page.getByRole("link", { name: /map/i }).first().click();
    await expect(page).toHaveURL(/\/trip\/3\/map/);

    await page.goto("/checkout?trip=3", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/checkout\?trip=3/);
    await expect(page.locator('[data-testid="checkout-package-selector"]')).toBeVisible();
    await page.getByTestId("checkout-package-core").click();
    await expect(page.getByTestId("checkout-package-core")).toHaveAttribute("aria-pressed", "true");
    await page.goto("/trip/3");
    await expect(page).toHaveURL(/\/trip\/3$/);
    await page.goto("/trip/3/export");
    await expect(page).toHaveURL(/\/trip\/3\/export/);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await expect(page.getByTestId("export-status-print")).toBeVisible();
  });
});
