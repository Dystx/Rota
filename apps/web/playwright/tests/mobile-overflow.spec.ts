import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { travelerTripPath } from "../fixtures/traveler-trip";

const routes = {
  marketing: ["/", "/portugal", "/explore", "/explore/workspace", "/how-it-works", "/pricing", "/human-review", "/privacy", "/terms", "/sustainability", "/support", "/offline"],
  traveler: ["/planner", "/trip/new", "/checkout", "/itineraries", "/account"],
  reviewer: ["/reviewer/queue", "/reviewer/profile", "/reviewer/history"],
  admin: ["/admin/places", "/admin/analytics"],
};

test.describe("@smoke @visual mobile-overflow sweep", () => {
  // Keep the overflow contract tied to the brief's 390px mobile width,
  // independent of the device preset's default viewport.
  test.use({ viewport: { width: 390, height: 844 } });
  const results: Array<{ path: string; scrollWidth: number; viewportWidth: number; ok: boolean }> = [];

  test.afterAll(() => {
    // If run from root, process.cwd() is project root, so we just use .sisyphus/evidence
    const dir = path.join(process.cwd(), ".sisyphus/evidence/future-roadmap");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "task-36-mobile-overflow.json"),
      JSON.stringify(results, null, 2)
    );
  });

  const allRoutes = Object.values(routes).flat();

  for (const route of allRoutes) {
    test(`route ${route} should not overflow horizontally on mobile`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "Overflow sweep is only for mobile");

      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(250);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      const ok = scrollWidth <= viewportWidth + 1;

      results.push({
        path: route,
        scrollWidth,
        viewportWidth,
        ok,
      });

      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  }

  for (const routeSuffix of ["", "/map", "/export"]) {
    test(`route traveler trip${routeSuffix} should not overflow horizontally on mobile`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "Overflow sweep is only for mobile");
      const route = travelerTripPath(routeSuffix);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(250);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      const ok = scrollWidth <= viewportWidth + 1;
      results.push({ path: route, scrollWidth, viewportWidth, ok });
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  }
});
