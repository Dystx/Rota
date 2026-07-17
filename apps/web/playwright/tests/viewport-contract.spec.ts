import { mkdirSync } from "node:fs";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import { travelerTripPath } from "../fixtures/traveler-trip";
import { assertExactArtifactReceipt } from "../visual-state-matrix";

test.beforeEach(() => {
  assertExactArtifactReceipt();
});

/**
 * UI-5 evidence for the tablet widths called out in the redesign plan.
 *
 * This is deliberately not tagged `@smoke`, `@visual`, or `@a11y`: the
 * canonical release suites remain the 1440/Desktop Chrome and 390x844 mobile
 * projects. The contract is run explicitly with `--grep @viewport-qa` and
 * writes reviewable first-viewport captures for the two intermediate widths;
 * the catalogue visual suite owns the exact 1440×1000 and 390×844 captures.
 */
const publicRoutes = [
  "/",
  "/portugal",
  "/explore",
  "/explore/workspace",
  "/how-it-works",
  "/pricing",
  "/human-review",
  "/privacy",
  "/terms",
  "/sustainability",
  "/support",
  "/offline",
  "/sign-in",
  "/expert-chat",
  "/guide",
  "/b2b",
  "/guide/onboarding",
  "/b2b/unknown-workspace"
] as const;

const travelerRoutes = [
  "/trip/new",
  travelerTripPath,
  () => travelerTripPath("/map"),
  () => travelerTripPath("/export"),
  "/account",
  "/itineraries",
  "/vault",
  "/planner",
  "/checkout"
] as const;

const reviewerRoutes = ["/reviewer/queue", "/reviewer/profile", "/reviewer/history"] as const;
const viewportRows = [
  { name: "1024", width: 1024, height: 768 },
  { name: "768", width: 768, height: 1024 }
] as const;

const evidenceRoot = "../../.sisyphus/evidence/future-roadmap/viewport-contract";
mkdirSync(evidenceRoot, { recursive: true });

function routeName(route: string): string {
  return route.replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, "") || "home";
}

function evidencePath(testInfo: TestInfo, viewportName: string, scope: string, route: string): string {
  const directory = `${evidenceRoot}/${testInfo.project.name}/${viewportName}`;
  mkdirSync(directory, { recursive: true });
  return `${directory}/${scope}-${routeName(route)}.png`;
}

async function waitForRouteReady(page: Page): Promise<void> {
  await page.locator("h1:visible").first().waitFor({ state: "visible", timeout: 15_000 });
  // Wait for the resolved route heading before checking landmarks. Streaming
  // operator loading boundaries briefly coexist with the settled shell; a
  // main-first wait races that handoff and produces a false strict-mode error.
  await page.locator("main").first().waitFor({ state: "visible", timeout: 15_000 });
  // Let hydration and route-level effects emit their diagnostics before the
  // browser-error assertion; this remains short and deterministic.
  await page.waitForTimeout(150);
}

function isKnownChromiumWebGlDiagnostic(message: string): boolean {
  return /GL Driver Message.*GPU stall due to ReadPixels/iu.test(message);
}

function collectBrowserMessage(errors: string[], type: string, text: string): void {
  // Headless Chromium can emit this driver-level performance diagnostic while
  // MapLibre captures a WebGL frame. It is not a page warning or an app error;
  // the performance suite measures the route separately. Keep real warnings
  // and page errors strict.
  if (type === "warning" && isKnownChromiumWebGlDiagnostic(text)) return;
  errors.push(`${type}: ${text}`);
}

async function assertTabletContract(page: Page, route: string) {
  await expect(page.locator("main"), `${route} should expose one main landmark`).toHaveCount(1);
  await expect(page.locator("h1:visible"), `${route} should expose one visible h1`).toHaveCount(1);
  await expect(page.locator("img[src*='placehold'], img[src*='placeholder'], img[src*='unsplash.com']"), `${route} must not use placeholder imagery`).toHaveCount(0);
  await expect(page.locator(".ph, .material-symbols-outlined"), `${route} must not render legacy icon-font elements`).toHaveCount(0);

  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bodyClientWidth: document.body.clientWidth
  }));
  expect(geometry.scrollWidth, `${route} should not overflow the document`).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.bodyScrollWidth, `${route} body should not overflow the viewport`).toBeLessThanOrEqual(geometry.bodyClientWidth + 1);
}

for (const viewport of viewportRows) {
  test.describe(`@viewport-qa public ${viewport.name}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    test.setTimeout(60_000);

    for (const route of publicRoutes) {
      test(`route ${route}`, async ({ page }, testInfo) => {
        const browserErrors: string[] = [];
        page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
        page.on("console", (message) => {
          if (message.type() === "error" || message.type() === "warning") collectBrowserMessage(browserErrors, message.type(), message.text());
        });

        await page.goto(route, { waitUntil: "domcontentloaded" });
        await waitForRouteReady(page);
        await assertTabletContract(page, route);
        await page.screenshot({
          path: evidencePath(testInfo, viewport.name, "public", route),
          fullPage: false
        });
        await page.waitForTimeout(100);
        expect(browserErrors, `${route} should not emit browser errors at ${viewport.name}px`).toEqual([]);
      });
    }
  });

  test.describe(`@viewport-qa traveler ${viewport.name}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height }, storageState: createTravelerStorageState() });
    test.setTimeout(60_000);

    for (const [routeIndex, routeEntry] of travelerRoutes.entries()) {
      test(`route ${typeof routeEntry === "string" ? routeEntry : `generated-trip-${routeIndex + 1}`}`, async ({ page }, testInfo) => {
        const route = typeof routeEntry === "string" ? routeEntry : routeEntry();
        const browserErrors: string[] = [];
        page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
        page.on("console", (message) => {
          if (message.type() === "error" || message.type() === "warning") collectBrowserMessage(browserErrors, message.type(), message.text());
        });

        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page).not.toHaveURL(/\/sign-in/);
        await waitForRouteReady(page);
        await assertTabletContract(page, route);
        await page.screenshot({
          path: evidencePath(testInfo, viewport.name, "traveler", route),
          fullPage: false
        });
        await page.waitForTimeout(100);
        expect(browserErrors, `${route} should not emit browser errors at ${viewport.name}px`).toEqual([]);
      });
    }
  });

  test.describe(`@viewport-qa reviewer ${viewport.name}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height }, storageState: createReviewerStorageState() });
    test.setTimeout(60_000);

    for (const route of reviewerRoutes) {
      test(`route ${route}`, async ({ page }, testInfo) => {
        const browserErrors: string[] = [];
        page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
        page.on("console", (message) => {
          if (message.type() === "error" || message.type() === "warning") collectBrowserMessage(browserErrors, message.type(), message.text());
        });

        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page).not.toHaveURL(/\/sign-in/);
        await waitForRouteReady(page);
        await assertTabletContract(page, route);
        await page.screenshot({
          path: evidencePath(testInfo, viewport.name, "reviewer", route),
          fullPage: false
        });
        await page.waitForTimeout(100);
        expect(browserErrors, `${route} should not emit browser errors at ${viewport.name}px`).toEqual([]);
      });
    }
  });

}
