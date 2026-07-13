import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import { getTravelerTripId, travelerCheckoutPath, travelerTripPath } from "../fixtures/traveler-trip";

test.describe("@smoke choice-led traveler journey", () => {
  test.setTimeout(60_000);
  test.use({ storageState: createTravelerStorageState() });

  test("activity choices carry a traveler from discovery to export", async ({ page }) => {
    const authCookies = await page.context().cookies();
    expect(authCookies.some((cookie) => cookie.name === "better-auth.session_token"), "traveler storage state must be loaded before the journey").toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveCount(1);

    // The public product now starts with an activity situation, not a route
    // brief. Make two deliberate choices, then inspect and save one judged
    // activity before opening the day workspace.
    const intentCard = page.getByTestId("hero-intent-card");
    await intentCard.getByRole("button", { name: "Region, Porto" }).click();
    await intentCard.getByRole("button", { name: "Lisbon" }).click();
    await intentCard.getByRole("button", { name: "Mood, good food" }).click();
    await intentCard.getByRole("button", { name: "culture" }).click();
    await intentCard.getByRole("button", { name: /show me what is worth doing/i }).click();
    await expect(page).toHaveURL(/\/explore\?region=lisbon/);
    await expect(page.getByRole("heading", { name: "What deserves this day?" })).toBeVisible();

    await page.getByRole("button", { name: /^Save .* to this day$/ }).first().click();
    await page.getByRole("button", { name: "See this day" }).click();
    await expect(page).toHaveURL(/\/explore\/workspace\?activity=/);
    await expect(page.getByRole("heading", { name: "Your tentative day" })).toBeVisible();

    // Use the seeded traveler trip for the remaining route surfaces.
    await page.goto("/trip/new", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/trip\/new/);
    await expect(page.locator("h1:visible")).toHaveCount(1);

    await page.goto(travelerTripPath(), { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/trip/${getTravelerTripId()}$`));
    const mapLink = page.getByTestId("trip-brief-open-map");
    await expect(mapLink).toBeVisible();
    await expect(mapLink).toHaveAttribute("href", new RegExp(`/trip/${getTravelerTripId()}/map$`));
    await page.waitForTimeout(750);
    await mapLink.click();
    await expect(page).toHaveURL(new RegExp(`/trip/${getTravelerTripId()}/map`));

    await page.goto(travelerCheckoutPath(), { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/checkout\\?trip=${getTravelerTripId()}`));
    await expect(page.locator('[data-testid="checkout-package-selector"]')).toBeVisible();
    await page.getByTestId("checkout-package-core").click();
    await expect(page.getByTestId("checkout-package-core")).toHaveAttribute("aria-pressed", "true");
    await page.goto(travelerTripPath());
    await expect(page).toHaveURL(new RegExp(`/trip/${getTravelerTripId()}$`));
    await page.goto(travelerTripPath("/export"));
    await expect(page).toHaveURL(new RegExp(`/trip/${getTravelerTripId()}/export`));
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await expect(page.getByTestId("export-status-print")).toBeVisible();
  });
});
