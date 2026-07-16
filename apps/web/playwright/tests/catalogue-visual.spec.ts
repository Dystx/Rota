import { expect, test, type Page, type TestInfo } from "@playwright/test";
import * as path from "node:path";
import { mkdirSync } from "node:fs";

import { createAdminStorageState } from "../fixtures/admin-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { getTravelerTripId } from "../fixtures/traveler-trip";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

type RouteCase = {
  label: string;
  resolve: () => string;
};

const publicRoutes: RouteCase[] = [
  { label: "/local-expertise", resolve: () => "/local-expertise" },
  { label: "/feedback", resolve: () => "/feedback" },
  {
    label: "/feedback?activity=porto-ribeira-slow-walk",
    resolve: () => "/feedback?activity=porto-ribeira-slow-walk&source=activity-day"
  },
  { label: "/privacy", resolve: () => "/privacy" },
  { label: "/terms", resolve: () => "/terms" },
  { label: "/sustainability", resolve: () => "/sustainability" }
];

const travelerRoutes: RouteCase[] = [
  { label: "/itineraries", resolve: () => "/itineraries" },
  {
    label: "/logistics",
    resolve: () => `/logistics?trip=${encodeURIComponent(getTravelerTripId())}`
  },
  { label: "/expert-chat", resolve: () => "/expert-chat" }
];

const reviewerRoutes: RouteCase[] = [
  { label: "/reviewer/operations", resolve: () => "/reviewer/operations" },
  { label: "/reviewer/profile", resolve: () => "/reviewer/profile" },
  {
    label: "/reviewer/trips/[tripId]",
    resolve: () => `/reviewer/trips/${encodeURIComponent(getTravelerTripId())}`
  }
];

const adminRoutes: RouteCase[] = [
  "/admin/countries",
  "/admin/regions",
  "/admin/partners",
  "/admin/reviewers",
  "/admin/specialists",
  "/admin/quality",
  "/console",
  "/console/graph",
  "/console/metrics",
  "/console/config",
  "/api/v1/docs"
].map((route) => ({ label: route, resolve: () => route }));

function routeSlug(route: string): string {
  return route.replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, "") || "home";
}

function capturePath(testInfo: { project: { name: string } }, route: string): string {
  const directory = path.resolve(
    process.cwd(),
    "../../.sisyphus/evidence/rumia-frontend-finish/catalogue",
    testInfo.project.name
  );
  mkdirSync(directory, { recursive: true });
  return path.join(directory, `${routeSlug(route)}.png`);
}

function isKnownWebGlWarning(type: string, message: string): boolean {
  return type === "warning" && /GL Driver Message.*GPU stall due to ReadPixels/iu.test(message);
}

async function setCatalogueViewport(page: Page, testInfo: TestInfo): Promise<void> {
  const viewportByProject = {
    "desktop-1440": { width: 1440, height: 1000 },
    "tablet-landscape": { width: 1024, height: 768 },
    "tablet-portrait": { width: 768, height: 1024 },
    "mobile-390": { width: 390, height: 844 }
  } as const;
  const viewport = viewportByProject[testInfo.project.name as keyof typeof viewportByProject];
  expect(viewport, `unknown Playwright project ${testInfo.project.name} would use the wrong catalogue viewport`).toBeDefined();
  if (!viewport) throw new Error(`unknown Playwright project ${testInfo.project.name}`);
  await page.setViewportSize(viewport);
}

async function assertCatalogueRoute(page: Page, route: string, authenticated: boolean) {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" || (message.type() === "warning" && !isKnownWebGlWarning(message.type(), message.text()))) {
      browserErrors.push(`${message.type()}: ${message.text()}`);
    }
  });

  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.locator("main").first().waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("h1:visible").first().waitFor({ state: "visible", timeout: 15_000 });
  // Capture the authored resting composition, not a partially completed
  // chapter/operator entrance animation. The product animation remains
  // covered by the dedicated motion-gate tests; this pass is visual review.
  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important}"
  });
  await page.waitForTimeout(100);
  await expect(page.locator("main"), `${route} should expose exactly one main landmark`).toHaveCount(1);
  await expect(page.locator("h1:visible"), `${route} should expose exactly one visible h1`).toHaveCount(1);
  await expect(page.locator("img[src*='placehold'], img[src*='placeholder'], img[src*='unsplash.com']"), `${route} must not use placeholder imagery`).toHaveCount(0);
  const visibleText = await page.locator("body").innerText();
  expect(
    visibleText,
    `${route} must not expose internal fixture markers in any visible shell content`
  ).not.toMatch(/Playwright-owned|e2e-fixture|e2e-(?:admin|reviewer|traveler)@/iu);

  if (authenticated) {
    await expect(page).not.toHaveURL(/\/sign-in/);
  }

  if (route.startsWith("/reviewer/trips/")) {
    await expect(page.getByRole("link", { name: "Back to review queue" })).toBeVisible();
  }

  if (route.startsWith("/feedback?activity=")) {
    await expect(page.getByRole("button", { name: "Send feedback" })).toBeVisible();
  }

  if (route.startsWith("/logistics")) {
    await expect(page.locator('[data-footer-mode="utility"]'), `${route} should use utility product chrome`).toHaveCount(1);
  }

  if (["/privacy", "/terms", "/sustainability"].includes(route)) {
    await expect(page.locator('[data-footer-mode="compact"]'), `${route} should use compact reading chrome`).toHaveCount(1);
    const legalHeading = await page.locator(".rumia-legal-header h1").evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const intro = element.parentElement?.nextElementSibling?.getBoundingClientRect();
      return {
        headingOverflow: element.scrollWidth > element.clientWidth + 1,
        boxesOverlap: Boolean(
          intro &&
            bounds.right > intro.left &&
            intro.right > bounds.left &&
            bounds.bottom > intro.top &&
            intro.bottom > bounds.top
        )
      };
    });
    expect(legalHeading.headingOverflow, `${route} title should fit its editorial column`).toBe(false);
    expect(legalHeading.boxesOverlap, `${route} title and intro should not overlap`).toBe(false);
  }

  const geometry = await page.evaluate(() => ({
    bodyClientWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(geometry.scrollWidth, `${route} should not overflow the viewport`).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.bodyScrollWidth, `${route} body should not overflow the viewport`).toBeLessThanOrEqual(geometry.bodyClientWidth + 1);

  return browserErrors;
}

test.describe("@catalogue visual coverage — public", () => {
  test.setTimeout(60_000);

  for (const routeCase of publicRoutes) {
    test(`captures ${routeCase.label}`, async ({ page }, testInfo) => {
      const route = routeCase.resolve();
      await setCatalogueViewport(page, testInfo);
      const browserErrors = await assertCatalogueRoute(page, route, false);
      await page.screenshot({ path: capturePath(testInfo, routeCase.label), fullPage: true });
      expect(browserErrors, `${route} should not emit browser errors`).toEqual([]);
    });
  }
});

test.describe("@catalogue visual coverage — traveler", () => {
  test.setTimeout(60_000);
  test.use({ storageState: createTravelerStorageState() });

  for (const routeCase of travelerRoutes) {
    test(`captures ${routeCase.label}`, async ({ page }, testInfo) => {
      const route = routeCase.resolve();
      await setCatalogueViewport(page, testInfo);
      const browserErrors = await assertCatalogueRoute(page, route, true);
      await page.screenshot({ path: capturePath(testInfo, routeCase.label), fullPage: true });
      expect(browserErrors, `${route} should not emit browser errors`).toEqual([]);
    });
  }

  test("captures /itineraries filtered-empty recovery", async ({ page }, testInfo) => {
    await setCatalogueViewport(page, testInfo);
    const browserErrors = await assertCatalogueRoute(page, "/itineraries", true);
    await page.getByRole("searchbox", { name: "Search itineraries" }).fill("Madeira");
    await page.getByRole("button", { name: "Drafts" }).click();
    await expect(page.getByTestId("itinerary-filtered-empty")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible();
    const controlHeights = await page.locator(
      '[data-testid="itinerary-search-input"], [data-testid^="itinerary-filter-"], [data-testid="itinerary-clear-filters"]'
    ).evaluateAll((elements) => elements.map((element) => Math.round(element.getBoundingClientRect().height)));
    expect(Math.min(...controlHeights), "itinerary controls should retain 44px touch targets").toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: capturePath(testInfo, "itineraries-filtered-empty"), fullPage: true });
    expect(browserErrors, "/itineraries filtered-empty should not emit browser errors").toEqual([]);
  });
});

test.describe("@catalogue visual coverage — reviewer", () => {
  test.setTimeout(60_000);
  test.use({ storageState: createReviewerStorageState() });

  for (const routeCase of reviewerRoutes) {
    test(`captures ${routeCase.label}`, async ({ page }, testInfo) => {
      const route = routeCase.resolve();
      await setCatalogueViewport(page, testInfo);
      const browserErrors = await assertCatalogueRoute(page, route, true);
      await page.screenshot({ path: capturePath(testInfo, routeCase.label), fullPage: true });
      expect(browserErrors, `${route} should not emit browser errors`).toEqual([]);
    });
  }
});

test.describe("@catalogue visual coverage — admin and developer", () => {
  test.setTimeout(60_000);
  test.use({ storageState: createAdminStorageState() });

  for (const routeCase of adminRoutes) {
    test(`captures ${routeCase.label}`, async ({ page }, testInfo) => {
      const route = routeCase.resolve();
      await setCatalogueViewport(page, testInfo);
      const browserErrors = await assertCatalogueRoute(page, route, true);
      await page.screenshot({ path: capturePath(testInfo, routeCase.label), fullPage: true });
      expect(browserErrors, `${route} should not emit browser errors`).toEqual([]);
    });
  }
});
