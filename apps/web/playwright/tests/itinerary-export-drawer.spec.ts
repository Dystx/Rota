import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

// Stitch 1.7 — sliding export drawer on /itineraries
//
// Verifies the new export drawer pattern. The drawer is the
// primary action surface for a saved trip (PDF / Calendar /
// Share) — opening it from a card is the happy path.
//
// The traveler persona is seeded by global setup and owns the list rendered by
// `/itineraries`. The drawer is portal-mounted only while open, so the tests
// assert the closed/open behavior at the observable dialog boundary.
//
// We don't assert the export actions themselves (window.open,
// clipboard, blob download) — those are exercised manually.

test.describe("@smoke @itinerary-export-drawer itineraries export drawer (traveler list)", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("clicking a card opens the export drawer", async ({ page }) => {
    await page.goto("/itineraries");
    const firstCard = page.locator('[data-testid^="itinerary-card-"]').first();
    await expect(firstCard).toBeVisible();

    await firstCard.click();

    // After click, the drawer is open and the summary is visible.
    const drawer = page.getByTestId("export-drawer");
    await expect(drawer).toBeVisible();
    await expect(page.getByTestId("export-drawer-summary")).toBeVisible();
    await expect(page.getByTestId("export-drawer-execute")).toBeVisible();
  });

  test("drawer exposes the three Stitch 1.7 export options", async ({ page }) => {
    await page.goto("/itineraries");
    await page.locator('[data-testid^="itinerary-card-"]').first().click();

    await expect(page.getByTestId("export-option-pdf")).toBeVisible();
    await expect(page.getByTestId("export-option-calendar")).toBeVisible();
    await expect(page.getByTestId("export-option-share")).toBeVisible();
  });

  test("close button dismisses the drawer", async ({ page }) => {
    await page.goto("/itineraries");
    await page.locator('[data-testid^="itinerary-card-"]').first().click();
    const drawer = page.getByTestId("export-drawer");
    await expect(drawer).toBeVisible();

    await page.getByTestId("export-drawer-close").click();
    await expect(drawer).toBeHidden();
  });

  test("PDF action navigates to the auto-print view (?view=print&print=1)", async ({ page, context }) => {
    await page.goto("/itineraries");
    await page.locator('[data-testid^="itinerary-card-"]').first().click();

    // PDF is the default option, so just clicking Execute opens the print view.
    const popupPromise = context.waitForEvent("page");
    await page.getByTestId("export-drawer-execute").click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");

    expect(popup.url()).toContain("/export?view=print&print=1");

    // The print view renders the print-now button as a manual fallback.
    await expect(popup.getByTestId("print-now-button").first()).toBeVisible();
  });
});

test.describe("@smoke @itinerary-export-drawer itineraries page (traveler persona)", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("itineraries page renders for the traveler persona", async ({ page }) => {
    await page.goto("/itineraries");
    await expect(page.getByRole("heading", { level: 1, name: "Itineraries" })).toBeVisible();
  });
});
