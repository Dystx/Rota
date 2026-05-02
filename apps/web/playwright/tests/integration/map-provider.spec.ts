import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Map Provider Integration", () => {
  test("Missing map token falls back gracefully", async ({ page }) => {
    // Navigate without setting NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN
    await page.goto("/trip/3/map");
    
    // Assert schematic map fallback is visible
    const schematicMap = page.locator('[data-testid="schematic-map-fallback"]');
    await expect(schematicMap).toBeVisible({ timeout: 10000 });
    
    // Assert no 500 error is thrown
    const heading = page.locator('h1');
    await expect(heading).not.toContainText('500');

    // Take screenshot
    await page.screenshot({ path: "../../.sisyphus/evidence/future-roadmap/task-26-map-fallback.png" });
  });

  test("Mapbox-enabled route renders provider map", async ({ page }) => {
    // Inject the forceMapboxProvider=1 via query
    await page.goto("/trip/3/map?forceMapboxProvider=1");
    
    const providerMap = page.locator('[data-testid="provider-map"]');
    await expect(providerMap).toBeVisible({ timeout: 10000 });
    
    // Assert public token appears
    await expect(providerMap).toContainText("Public Token: pk.test...");
    
    // Take screenshot
    await page.screenshot({ path: "../../.sisyphus/evidence/future-roadmap/task-26-mapbox-enabled.png" });
  });
});
