import { test, expect } from "@playwright/test";

test.describe("Map Provider Integration", () => {
  // Set a predictable viewport to ensure the map takes up a good portion of the screen
  test.use({ viewport: { width: 1280, height: 800 } });

  test("Missing map token falls back gracefully", async ({ page }) => {
    // Navigate without setting NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN
    await page.goto("/trip/3/map");
    
    // Assert schematic map fallback is visible
    const schematicMap = page.locator('[data-testid="schematic-map-fallback"]');
    
    // Ensure the map is completely in view
    await schematicMap.scrollIntoViewIfNeeded();
    await expect(schematicMap).toBeVisible({ timeout: 10000 });
    
    await expect(schematicMap).toContainText("Schematic route map shown while interactive map is unavailable");

    // Assert no 500 error is thrown
    const heading = page.locator('h1');
    await expect(heading).not.toContainText('500');

    // Take a viewport screenshot after scrolling to ensure map is visible
    await page.screenshot({ 
      path: "../../.sisyphus/evidence/future-roadmap/task-26-map-fallback.png",
      fullPage: false
    });
  });

  test("Mapbox-enabled route renders provider map", async ({ page }) => {
    // Inject the forceMapboxProvider=1 via query
    await page.goto("/trip/3/map?forceMapboxProvider=1");
    
    const providerMap = page.locator('[data-testid="provider-map"]');
    
    // Ensure the provider map is completely in view
    await providerMap.scrollIntoViewIfNeeded();
    await expect(providerMap).toBeVisible({ timeout: 10000 });
    
    await expect(providerMap).toContainText("Mapbox Provider Mode");
    
    // Take a viewport screenshot after scrolling to ensure map is visible
    await page.screenshot({ 
      path: "../../.sisyphus/evidence/future-roadmap/task-26-mapbox-enabled.png",
      fullPage: false
    });
  });
});
