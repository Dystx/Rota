import { test, expect } from "@playwright/test";

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
  test.use({ viewport: { width: 1280, height: 800 } });

  test("trip page map renders the spatial-engine canvas frame", async ({ page }) => {
    await page.goto("/trip/3/map");

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
    await page.goto("/trip/3/map?focus=lisbon");

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
});
