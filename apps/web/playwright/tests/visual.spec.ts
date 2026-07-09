import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { createAdminStorageState } from "../fixtures/admin-auth";

const marketingRoutes = ["/", "/portugal", "/how-it-works", "/pricing", "/human-review"];
const travelerRoutes = [
  "/trip/new",
  "/trip/3",
  "/trip/3/map",
  "/trip/3/export",
  "/account",
  "/itineraries",
  "/planner",
  "/checkout"
];
const reviewerRoutes = ["/reviewer/queue", "/reviewer/profile", "/reviewer/history"];
const adminRoutes = [
  "/admin/places",
  "/admin/analytics",
  "/console/pipeline",
  "/console/workspace",
  "/console/messages"
];

const disableAnimations = async (page: any) => {
  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important}",
  });
};

/**
 * Wait for the page's rendering loop to settle before capturing
 * a screenshot. The 3D map (GlobeWorkspace + WorkspaceCanvas)
 * renders at 60fps via WebGL, which Playwright's screenshot
 * capture races against — if the page is mid-frame when the
 * capture is requested, Chromium returns "Unable to capture
 * screenshot" protocol error. A 2s page-level wait (rather
 * than a requestAnimationFrame loop) is used because the 3D
 * map's render loop can starve the rAF queue under load, which
 * causes the rAF-based wait to deadlock on its own 30s
 * Playwright timeout.
 */
const settleForScreenshot = async (page: any) => {
  await page.waitForTimeout(2000);
};

const maskLocators = (page: any) => [
  page.locator('[data-testid="trip-created-at"]'),
  page.locator(".timestamp"),
  page.locator(".avatar"),
  page.locator('[data-testid="partner-id"]')
];

async function assertRouteQuality(page: any, route: string, authenticated = false) {
  await expect(page.locator("main"), `${route} should expose exactly one main landmark`).toHaveCount(1);
  await expect(page.locator("h1:visible"), `${route} should expose exactly one visible h1`).toHaveCount(1);
  await expect(page.locator("img[src*='placehold'], img[src*='placeholder'], img[src*='unsplash.com']"), `${route} must not use placeholder imagery`).toHaveCount(0);
  if (authenticated) {
    const authCookies = await page.context().cookies();
    expect(authCookies.some((cookie: { name: string }) => cookie.name.includes("auth-token")), `${route} requires an authenticated storage-state marker`).toBe(true);
    // A happy-path capture must never silently become an auth redirect.
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator("body")).not.toContainText("Sign in to");
  }
}

test.describe("@smoke @visual Marketing baselines", () => {
  for (const route of marketingRoutes) {
    const routeName = route === "/" ? "home" : route.replace(/\//g, "-").replace(/^-/, "");
    test(`marketing route ${route}`, async ({ page }, testInfo) => {
      await page.goto(route);
      await assertRouteQuality(page, route);
      // The home page renders the GlobeWorkspace with a ~3.2s intro
      // camera choreography (earth → europe beat). CSS animations are
      // disabled above, but the WebGL camera position is driven by
      // JavaScript and is non-deterministic for the screenshot if we
      // capture mid-flight. Wait for the choreography to settle on the
      // home page before the baseline compare.
      if (route === "/") {
        // Home page renders the GlobeWorkspace with a ~3.2s intro camera
        // choreography (earth → europe beat). The choreography is
        // non-deterministic at the pixel level because the WebGL
        // easing curve is frame-rate dependent. Wait 6s (well past the
        // ~3.2s choreography + a settling buffer) so the camera is
        // firmly on the final europe beat before the baseline compare.
        await page.waitForTimeout(6000);
      }
      await disableAnimations(page);
      await settleForScreenshot(page);

      await expect(page).toHaveScreenshot(`${testInfo.project.name}-marketing-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page),
        timeout: 20_000,
        // The 3D map (GlobeWorkspace) renders WebGL content
        // that's inherently non-deterministic at the pixel
        // level (frame-rate-dependent easing, anti-aliasing
        // variation). 1% pixel diff tolerance covers that
        // noise while still catching real regressions.
        maxDiffPixelRatio: 0.01
      });
    });
  }
});

test.describe("@smoke @visual Traveler baselines", () => {
  test.use({ storageState: createTravelerStorageState() });
  for (const route of travelerRoutes) {
    const routeName = route.replace(/\//g, "-").replace(/^-/, "");
    test(`traveler route ${route}`, async ({ page }, testInfo) => {
      await page.goto(route);
      await assertRouteQuality(page, route, true);
      await disableAnimations(page);
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot(`${testInfo.project.name}-traveler-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page),
        timeout: 20_000,
        maxDiffPixelRatio: 0.01
      });
    });
  }
});

test.describe("@smoke @visual Reviewer baselines", () => {
  test.use({ storageState: createReviewerStorageState() });
  for (const route of reviewerRoutes) {
    const routeName = route.replace(/\//g, "-").replace(/^-/, "");
    test(`reviewer route ${route}`, async ({ page }, testInfo) => {
      await page.goto(route);
      await assertRouteQuality(page, route, true);
      await disableAnimations(page);
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot(`${testInfo.project.name}-reviewer-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page),
        timeout: 20_000,
        maxDiffPixelRatio: 0.01
      });
    });
  }
});

test.describe("@smoke @visual Admin baselines", () => {
  test.use({ storageState: createAdminStorageState() });
  for (const route of adminRoutes) {
    const routeName = route.replace(/\//g, "-").replace(/^-/, "");
    test(`admin route ${route}`, async ({ page }, testInfo) => {
      await page.goto(route);
      await assertRouteQuality(page, route, true);
      await disableAnimations(page);
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot(`${testInfo.project.name}-admin-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page),
        timeout: 20_000,
        maxDiffPixelRatio: 0.01
      });
    });
  }
});
