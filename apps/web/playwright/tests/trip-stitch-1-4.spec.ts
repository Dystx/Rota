import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import { travelerTripPath } from "../fixtures/traveler-trip";

// Stitch 1.4 — Trip workspace affordances
//
// Verifies the three Stitch 1.4 elements added to the trip
// page (which already has the full-bleed map + filmstrip):
//   1. Pace & Tone segmented control in the brief card
//   2. Floating Share + Download action buttons in the brief card
//   3. "Add Stop" card at the end of the filmstrip
//
// We don't assert the pace/tone state in the map store
// directly — that's exercised in the unit-test layer.

test.describe("@smoke @trip-stitch-1-4 trip workspace Stitch 1.4 affordances", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("pace & tone control renders with four options", async ({ page }) => {
    await page.goto(travelerTripPath());

    const control = page.getByTestId("pace-tone-control");
    await expect(control).toBeVisible();
    await expect(page.getByTestId("pace-option-relaxed")).toBeVisible();
    await expect(page.getByTestId("pace-option-active")).toBeVisible();
    await expect(page.getByTestId("tone-option-hidden-gems")).toBeVisible();
    await expect(page.getByTestId("tone-option-classics")).toBeVisible();
  });

  test("clicking pace options toggles radio selection", async ({ page }) => {
    await page.goto(travelerTripPath());
    // The trip page streams its generated itinerary after the initial HTML.
    // Wait for that client work to settle before exercising the hydrated
    // Zustand-backed control; otherwise a click can land in the brief
    // server-rendered / pre-hydration window under a loaded full suite.
    await page.waitForLoadState("networkidle");

    const relaxed = page.getByTestId("pace-option-relaxed");
    const active = page.getByTestId("pace-option-active");

    // Default is "Relaxed" — it uses radio semantics because the control is exclusive.
    await expect(relaxed).toHaveAttribute("aria-checked", "true");
    await expect(active).toHaveAttribute("aria-checked", "false");

    await active.click();
    await expect(active).toHaveAttribute("aria-checked", "true");
    await expect(relaxed).toHaveAttribute("aria-checked", "false");
  });

  test("brief card exposes Share + Download action buttons", async ({ page }) => {
    await page.goto(travelerTripPath());

    const actions = page.getByTestId("trip-brief-actions");
    await expect(actions).toBeVisible();
    await expect(page.getByTestId("trip-brief-share")).toBeVisible();
    await expect(page.getByTestId("trip-brief-download")).toBeVisible();
  });

  test("filmstrip ends with the Add Stop card", async ({ page }) => {
    await page.goto(travelerTripPath());

    const filmstrip = page.locator('[data-testid="filmstrip-section"]');
    await filmstrip.scrollIntoViewIfNeeded();

    const addCard = page.getByTestId("stop-card-add");
    await expect(addCard).toBeVisible();
  });
});
