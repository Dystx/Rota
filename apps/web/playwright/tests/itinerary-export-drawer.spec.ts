import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

// Stitch 1.7 — sliding export drawer on /itineraries
//
// Verifies the new export drawer pattern. The drawer is the
// primary action surface for a saved trip (PDF / Calendar /
// Share) — opening it from a card is the happy path.
//
// We test the drawer using the unauthenticated public list
// (which renders the dev seed trips via `getTripsForUser(null)`).
// The traveler persona may have no trips in CI, so the
// persona-tagged suite only checks that the page renders.
//
// We don't assert the export actions themselves (window.open,
// clipboard, blob download) — those are exercised manually.

test.describe("@smoke @itinerary-export-drawer itineraries export drawer (public list)", () => {
  test("clicking a card opens the export drawer", async ({ page }) => {
    await page.goto("/itineraries");
    const firstCard = page.locator('[data-testid^="itinerary-card-"]').first();
    await expect(firstCard).toBeVisible();

    // The drawer is mounted but closed by default.
    const drawer = page.getByTestId("export-drawer");
    await expect(drawer).toHaveAttribute("data-state", "closed");

    await firstCard.click();

    // After click, the drawer is open and the summary is visible.
    await expect(drawer).toHaveAttribute("data-state", "open");
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
    await expect(page.getByTestId("export-drawer")).toHaveAttribute("data-state", "open");

    await page.getByTestId("export-drawer-close").click();
    await expect(page.getByTestId("export-drawer")).toHaveAttribute("data-state", "closed");
  });
});

test.describe("@smoke @itinerary-export-drawer itineraries page (traveler persona)", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("itineraries page renders for the traveler persona", async ({ page }) => {
    await page.goto("/itineraries");
    await expect(page.getByRole("heading", { level: 1, name: "Itineraries" })).toBeVisible();
  });
});
