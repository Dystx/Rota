import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

const routes = {
  marketing: ["/", "/portugal", "/how-it-works", "/pricing", "/human-review"],
  traveler: ["/trip/new", "/trip/3", "/trip/3/map", "/trip/3/export", "/account"],
  reviewer: ["/reviewer/queue", "/reviewer/profile", "/reviewer/history"],
  admin: ["/admin/places", "/admin/analytics"],
};

test.describe("@smoke @visual mobile-overflow sweep", () => {
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
});
