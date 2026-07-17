import { test, expect } from "@playwright/test";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import * as fs from "fs";
import * as path from "path";
import { travelerTripPath } from "../fixtures/traveler-trip";
import { assertExactArtifactReceipt } from "../visual-state-matrix";

test.beforeEach(() => {
  assertExactArtifactReceipt();
});

interface RouteBudget {
  maxJsBytes: number;
  maxTotalBytes: number;
  maxTimingMs: number;
  allowMapProviders: boolean;
}

interface ResourceSummary {
  jsBytes: number;
  jsCount: number;
  totalBytes: number;
  totalCount: number;
  hasMapProvider: boolean;
}

interface TimingMeasurement {
  timingMs: number;
  source: string;
}

interface RouteMeasurement {
  route: string;
  budget: RouteBudget;
  resources: ResourceSummary;
  timing: TimingMeasurement;
}

const ROUTES = [
  { path: "/", auth: false, isMap: false },
  { path: "/trip/new", auth: false, isMap: false },
  { path: "/admin/analytics", auth: true, isMap: false }
];

const getBudgetForRoute = (isMap: boolean): RouteBudget => ({
  maxJsBytes: isMap ? 1600 * 1024 : 700 * 1024,
  maxTotalBytes: 2500 * 1024,
  maxTimingMs: 6000,
  allowMapProviders: isMap
});

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const measurements: RouteMeasurement[] = [];

test.describe("@perf Performance & Bundle Budgets", () => {
  test.use({ storageState: createAdminStorageState() });
  const travelerRoutes = [
    // The trip overview keeps the map behind the viewport/intent gate. Its
    // initial load is intentionally map-free so the core itinerary remains
    // lightweight; the dedicated map route is the live MapLibre surface.
    { resolve: () => travelerTripPath(), isMap: false, requiresMapSurface: false },
    { resolve: () => travelerTripPath("/map"), isMap: true, requiresMapSurface: true },
    { resolve: () => travelerTripPath("/export"), isMap: false, requiresMapSurface: false }
  ];

  test.afterAll(() => {
    const evidenceDir = path.join(process.cwd(), '../../.sisyphus/evidence/future-roadmap');
    fs.mkdirSync(evidenceDir, { recursive: true });

    // Bundle Report
    const bundleHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Task 38 - Bundle Budget Report</title>
        <style>
          body { font-family: system-ui; max-width: 900px; margin: 2rem auto; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
          th { background: #f5f5f5; }
          .pass { color: green; }
          .fail { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Task 38: Bundle Budget Report</h1>
        <p>Generated at: ${escapeHtml(new Date().toISOString())}</p>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>JS (KB)</th>
              <th>JS Budget (KB)</th>
              <th>Total (KB)</th>
              <th>Total Budget (KB)</th>
              <th>Map Isolation</th>
            </tr>
          </thead>
          <tbody>
            ${measurements.map(m => `
              <tr>
                <td>${escapeHtml(m.route)}</td>
                <td class="${m.resources.jsBytes <= m.budget.maxJsBytes ? 'pass' : 'fail'}">${(m.resources.jsBytes / 1024).toFixed(2)}</td>
                <td>${(m.budget.maxJsBytes / 1024).toFixed(2)}</td>
                <td class="${m.resources.totalBytes <= m.budget.maxTotalBytes ? 'pass' : 'fail'}">${(m.resources.totalBytes / 1024).toFixed(2)}</td>
                <td>${(m.budget.maxTotalBytes / 1024).toFixed(2)}</td>
                <td class="${!m.resources.hasMapProvider || m.budget.allowMapProviders ? 'pass' : 'fail'}">
                  ${m.resources.hasMapProvider ? (m.budget.allowMapProviders ? 'Allowed' : 'Violated') : 'No Map'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Performance Report
    const perfHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Task 38 - Performance Timing Report</title>
        <style>
          body { font-family: system-ui; max-width: 900px; margin: 2rem auto; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
          th { background: #f5f5f5; }
          .pass { color: green; }
          .fail { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Task 38: Performance Timing Report (Playwright Lighthouse-Equivalent)</h1>
        <p>Generated at: ${escapeHtml(new Date().toISOString())}</p>
        <p>Note: This report uses Playwright performance APIs as a Lighthouse equivalent.</p>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Timing (ms)</th>
              <th>Budget (ms)</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            ${measurements.map(m => `
              <tr>
                <td>${escapeHtml(m.route)}</td>
                <td class="${m.timing.timingMs <= m.budget.maxTimingMs ? 'pass' : 'fail'}">${m.timing.timingMs.toFixed(0)}</td>
                <td>${m.budget.maxTimingMs.toFixed(0)}</td>
                <td>${escapeHtml(m.timing.source)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    fs.writeFileSync(path.join(evidenceDir, 'task-38-bundle-report.html'), bundleHtml);
    fs.writeFileSync(path.join(evidenceDir, 'task-38-lighthouse-report.html'), perfHtml);
  });

  for (const { path: routePath, isMap } of ROUTES) {
    test(`Measure ${routePath}`, async ({ page }) => {
      const budget = getBudgetForRoute(isMap);
      
      await page.goto(routePath, { waitUntil: 'networkidle' });

      // Gather resource timings
      const resources: ResourceSummary = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        let jsBytes = 0;
        let jsCount = 0;
        let totalBytes = 0;
        let hasMapProvider = false;

        for (const entry of entries) {
          const size = entry.transferSize || entry.encodedBodySize || entry.decodedBodySize || 0;
          totalBytes += size;
          
          const isScript = entry.initiatorType === 'script' || entry.name.endsWith('.js') || entry.name.includes('/_next/static/chunks/');
          if (isScript) {
            jsBytes += size;
            jsCount++;
          }
          
          const urlLower = entry.name.toLowerCase();
          if (
            urlLower.includes('maplibre') ||
            urlLower.includes('workspace-canvas') ||
            urlLower.includes('trip-workspace-canvas') ||
            urlLower.includes('@repo/spatial-engine')
          ) {
            hasMapProvider = true;
          }
        }

        return { jsBytes, jsCount, totalBytes, totalCount: entries.length, hasMapProvider };
      });

      if (resources.jsCount > 0) {
        expect(resources.jsBytes, `Expected > 0 JS bytes if ${resources.jsCount} scripts are loaded`).toBeGreaterThan(0);
      }

      // Gather performance timing
      const timing: TimingMeasurement = await page.evaluate(() => {
        return new Promise<TimingMeasurement>((resolve) => {
          let resolved = false;
          try {
            const observer = new PerformanceObserver((list) => {
              if (resolved) return;
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                resolved = true;
                observer.disconnect();
                resolve({ timingMs: lastEntry.startTime, source: 'lcp-observer' });
              }
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
          } catch (e) {
            // Observer not supported
          }

          setTimeout(() => {
            if (resolved) return;
            resolved = true;
            
            const lcpEntries = performance.getEntriesByType('paint').filter(e => e.name === 'largest-contentful-paint');
            const lastLcp = lcpEntries[lcpEntries.length - 1];
            if (lastLcp) {
                resolve({ timingMs: lastLcp.startTime, source: 'lcp-paint-entry' });
                return;
            }

            const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
            const nav = navEntries[0];
            if (nav) {
                if (nav.loadEventEnd > 0) {
                    resolve({ timingMs: nav.loadEventEnd - nav.startTime, source: 'loadEventEnd' });
                    return;
                } else if (nav.domContentLoadedEventEnd > 0) {
                    resolve({ timingMs: nav.domContentLoadedEventEnd - nav.startTime, source: 'domContentLoadedEventEnd' });
                    return;
                }
            }
            resolve({ timingMs: performance.now(), source: 'performance.now-fallback' });
          }, 3000);
        });
      });

      expect(timing.timingMs, 'Performance timing must be greater than 0').toBeGreaterThan(0);

      measurements.push({ route: routePath, budget, resources, timing });

      if (!budget.allowMapProviders) {
        expect(resources.hasMapProvider, `Map provider found on non-map route: ${routePath}`).toBe(false);
      }

      expect(resources.jsBytes, `JS bundle size (${Math.round(resources.jsBytes/1024)}KB) exceeds budget (${Math.round(budget.maxJsBytes/1024)}KB)`).toBeLessThanOrEqual(budget.maxJsBytes);
      expect(resources.totalBytes, `Total bundle size (${Math.round(resources.totalBytes/1024)}KB) exceeds budget (${Math.round(budget.maxTotalBytes/1024)}KB)`).toBeLessThanOrEqual(budget.maxTotalBytes);
      expect(timing.timingMs, `Timing (${Math.round(timing.timingMs)}ms) exceeds budget (${budget.maxTimingMs}ms)`).toBeLessThanOrEqual(budget.maxTimingMs);
    });
  }

  test("Measure cinematic media budgets on public chapters", async ({ page }) => {
    for (const route of ["/", "/portugal"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      const media = await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .map((entry) => entry as PerformanceResourceTiming)
          .filter((entry) => /\/media\//.test(entry.name))
          .map((entry) => ({ name: entry.name, bytes: entry.transferSize || entry.encodedBodySize || entry.decodedBodySize || 0 }))
      );
      const videoBytes = media.filter((entry) => entry.name.endsWith(".mp4")).reduce((total, entry) => total + entry.bytes, 0);
      const mediaBytes = media.reduce((total, entry) => total + entry.bytes, 0);
      expect(videoBytes, `${route} cinematic video must stay under 1.5 MB`).toBeLessThanOrEqual(1_500_000);
      expect(mediaBytes, `${route} media payload must stay under 2.5 MB`).toBeLessThanOrEqual(2_500_000);
    }
  });

  test.describe("Traveler route budgets", () => {
    // These routes are owner-protected. Using the admin storage state here
    // silently redirects to /itineraries and makes the map budget test prove
    // the wrong page.
    test.use({ storageState: createTravelerStorageState() });

    for (const [index, { resolve, isMap, requiresMapSurface }] of travelerRoutes.entries()) {
      test(`Measure generated traveler trip route ${index + 1}`, async ({ page }) => {
        const routePath = resolve();
        const budget = getBudgetForRoute(isMap);
        await page.goto(routePath, { waitUntil: "networkidle" });
        if (requiresMapSurface) {
          // The route intentionally keeps a useful schematic when sourced
          // geometry or the live renderer is unavailable. Both are valid map
          // surfaces; requiring a canvas here would reject the documented
          // fallback and make this budget gate depend on WebGL/provider state.
          await expect(
            page.locator(
              '[data-testid="trip-workspace-canvas"], [data-testid="trip-workspace-canvas-frame"], [data-testid="schematic-map-fallback"]'
            ).first()
          ).toBeVisible({ timeout: 15_000 });
        }
        const resources: ResourceSummary = await page.evaluate(() => {
          const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
          let jsBytes = 0;
          let jsCount = 0;
          let totalBytes = 0;
          let hasMapProvider = false;
          for (const entry of entries) {
            const size = entry.transferSize || entry.encodedBodySize || entry.decodedBodySize || 0;
            totalBytes += size;
            const isScript = entry.initiatorType === "script" || entry.name.endsWith(".js") || entry.name.includes("/_next/static/chunks/");
            if (isScript) { jsBytes += size; jsCount++; }
            const urlLower = entry.name.toLowerCase();
            if (urlLower.includes("maplibre") || urlLower.includes("workspace-canvas") || urlLower.includes("trip-workspace-canvas") || urlLower.includes("@repo/spatial-engine")) hasMapProvider = true;
          }
          return { jsBytes, jsCount, totalBytes, totalCount: entries.length, hasMapProvider };
        });
        expect(resources.totalBytes).toBeLessThanOrEqual(budget.maxTotalBytes);
        if (!isMap) expect(resources.hasMapProvider).toBe(false);
      });
    }
  });
});
