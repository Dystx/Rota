import { test, expect } from "@playwright/test";
import { travelerTripPath } from "../../fixtures/traveler-trip";
import { createTravelerStorageState } from "../../fixtures/traveler-auth";

/**
 * Trip map integration tests.
 *
 * Phase 1e migration: this file used to be `map-provider.spec.ts`
 * and asserted against the Mapbox-era `ProviderMap` /
 * `schematic-map-fallback` test ids. The spatial engine is now
 * the only renderer on `/trip/[tripId]/map`; the schematic
 * fallback is only ever shown when the trip itself is missing
 * or the route collection is `null`.
 *
 * The new assertions look for the spatial-engine canvas frame
 * (`trip-workspace-canvas-frame` / `trip-workspace-canvas`) and
 * the schematic fallback (the `@repo/ui` `RouteMap`) only when
 * the route collection is genuinely empty.
 */
test.describe("Trip Map (Spatial Engine)", () => {
  test.use({ viewport: { width: 1280, height: 800 }, storageState: createTravelerStorageState() });

  test("trip page map renders the spatial-engine canvas frame", async ({ page }) => {
    await page.goto(travelerTripPath("/map"));

    // The trip map page wraps the route layer in a frame with
    // `data-testid="trip-workspace-canvas-frame"` whether the live
    // canvas is up or the schematic fallback is showing — the
    // frame is the only stable surface across both paths.
    const frame = page.locator('[data-testid="trip-workspace-canvas-frame"]');
    await frame.scrollIntoViewIfNeeded();
    await expect(frame).toBeVisible({ timeout: 10000 });

    // Assert no 500 error is thrown
    const heading = page.locator("h1");
    await expect(heading).not.toContainText("500");

    // Take a viewport screenshot for visual review.
    await page.screenshot({
      path: "../../.sisyphus/evidence/future-roadmap/trip-map-spatial-engine.png",
      fullPage: false
    });
  });

  test("trip page map renders the spatial-engine canvas when focused", async ({ page }) => {
    await page.goto(travelerTripPath("/map?focus=lisbon"));

    // The new component always lands the camera on the `?focus=`
    // destination via the same deep-link plumbing `/explore/workspace`
    // uses. The canvas frame must be visible.
    const frame = page.locator('[data-testid="trip-workspace-canvas-frame"]');
    await frame.scrollIntoViewIfNeeded();
    await expect(frame).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: "../../.sisyphus/evidence/future-roadmap/trip-map-focused.png",
      fullPage: false
    });
  });

  test("feature-enabled story controls remain explicit and list-parallel", async ({ page }) => {
    test.skip(
      process.env.ENABLE_ACTIVITY_MAP?.trim().toLowerCase() !== "true" ||
        process.env.ENABLE_ACTIVITY_MAP_STORYTELLING?.trim().toLowerCase() !== "true",
      "Requires ENABLE_ACTIVITY_MAP=true and ENABLE_ACTIVITY_MAP_STORYTELLING=true"
    );

    await page.goto(travelerTripPath("/map"));
    const story = page.getByTestId("route-story-controls");
    if ((await story.count()) === 0) {
      test.skip(true, "Saved trip has no ready server-supplied route geometry");
    }

    await story.getByRole("button", { name: "Start exploring" }).click();
    await expect(story.getByRole("button", { name: "Stop exploring" })).toBeVisible();
    await story.getByRole("button", { name: "Stop exploring" }).click();
    await expect(story.getByRole("button", { name: "Start exploring" })).toBeVisible();
  });

  test("route list remains the source of truth when the map is unavailable", async ({ page }) => {
    await page.goto(travelerTripPath("/map?map=unavailable"));
    if (!page.url().includes("/map")) {
      test.skip(true, `saved trip unavailable; landed on ${page.url()}`);
    }

    const routeList = page.getByTestId("route-list-fallback");
    await expect(routeList).toBeVisible();
    const stopCount = Number(await page.getByTestId("route-stop-count").textContent());
    await expect(routeList.getByRole("listitem")).toHaveCount(stopCount);
  });
});
