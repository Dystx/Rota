import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { travelerTripPath } from "../fixtures/traveler-trip";

// Keep the assertion compatible with both the committed Supabase fixture and
// the current Better Auth fixture while limiting accepted names to known
// session-cookie shapes.
const authSessionCookieName = /^(?:better-auth\.session_token|sb-[a-z0-9]+(?:-[a-z0-9]+)*-auth-token(?:\.\d+)?)$/i;

// The route gate uses semantic viewport project names. Existing committed
// desktop/mobile snapshots retain their filenames, so this compatibility map
// affects only the screenshot argument; viewport selection stays canonical.
function snapshotProjectName(projectName: string): string {
  if (projectName === "desktop-1440") return "desktop-chrome";
  if (projectName === "mobile-390") return "mobile-chromium";
  return projectName;
}

function skipTabletVisualProject(projectName: string): void {
  test.skip(
    projectName === "tablet-landscape" || projectName === "tablet-portrait",
    "Tablet projects run geometry/accessibility coverage; primary visual baselines are desktop/mobile."
  );
}

function hasAuthSessionCookie(cookies: ReadonlyArray<{ name: string }>): boolean {
  return cookies.some((cookie) => authSessionCookieName.test(cookie.name));
}

const marketingRoutes = [
  "/",
  "/portugal",
  "/explore",
  "/activities/porto-ribeira-slow-walk",
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
];
const travelerRoutes = [
  { label: "/trip/new", snapshotName: "trip-new", resolve: () => "/trip/new" },
  { label: "generated trip route", snapshotName: "trip", resolve: () => travelerTripPath() },
  { label: "generated trip route map", snapshotName: "trip-map", resolve: () => travelerTripPath("/map") },
  { label: "generated trip route export", snapshotName: "trip-export", resolve: () => travelerTripPath("/export") },
  "/account",
  "/itineraries",
  "/vault",
  "/planner",
  "/checkout"
] as const;
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
    content: "*,*::before,*::after{animation:none!important;transition:none!important}.rumia-cinematic-media__video{visibility:hidden!important;opacity:0!important}",
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
  await page.locator("h1:visible").first().waitFor({ state: "visible", timeout: 15_000 });
  await expect(page.locator("h1:visible"), `${route} should expose exactly one visible h1`).toHaveCount(1);
  await expect(page.locator("img[src*='placehold'], img[src*='placeholder'], img[src*='unsplash.com']"), `${route} must not use placeholder imagery`).toHaveCount(0);
  if (authenticated) {
    const authCookies = await page.context().cookies();
    expect(hasAuthSessionCookie(authCookies), `${route} requires an authenticated storage-state marker`).toBe(true);
    // A happy-path capture must never silently become an auth redirect.
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator("body")).not.toContainText("Sign in to");
  }
}

test.describe("@smoke @visual Marketing baselines", () => {
  test.setTimeout(60_000);
  for (const route of marketingRoutes) {
    const routeName = route === "/" ? "home" : route.replace(/\//g, "-").replace(/^-/, "");
    test(`marketing route ${route}`, async ({ page }, testInfo) => {
      skipTabletVisualProject(testInfo.project.name);
      const projectName = snapshotProjectName(testInfo.project.name);
      await page.goto(route);
      await assertRouteQuality(page, route);
      // The home page renders the GlobeWorkspace with a ~3.2s intro
      // camera choreography (earth → europe beat). CSS animations are
      // disabled above, but the WebGL camera position is driven by
      // JavaScript and is non-deterministic for the screenshot if we
      // capture mid-flight. Wait for the choreography to settle on the
      // home page before the baseline compare.
      if (route === "/") {
        // DestinationBento is a client island. Wait for its cards before the
        // full-page capture so a slow mobile hydration cannot produce a
        // passing but visually empty lower half of the home page.
        await page.getByTestId("destination-bento").waitFor({ state: "visible", timeout: 15_000 });
        await expect(page.getByTestId("bento-card-lisbon")).toBeVisible();
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

      await expect(page).toHaveScreenshot(`${projectName}-marketing-${routeName}.png`, {
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
  test.setTimeout(60_000);
  test.use({ storageState: createTravelerStorageState() });
  for (const routeEntry of travelerRoutes) {
    const routeLabel = typeof routeEntry === "string" ? routeEntry : routeEntry.label;
    test(`traveler route ${routeLabel}`, async ({ page }, testInfo) => {
      skipTabletVisualProject(testInfo.project.name);
      const projectName = snapshotProjectName(testInfo.project.name);
      const route = typeof routeEntry === "string" ? routeEntry : routeEntry.resolve();
      const routeName = typeof routeEntry === "string"
        ? route.replace(/\//g, "-").replace(/^-/, "")
        : routeEntry.snapshotName;
      await page.goto(route);
      await assertRouteQuality(page, route, true);
      await disableAnimations(page);
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot(`${projectName}-traveler-${routeName}.png`, {
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
  test.setTimeout(60_000);
  test.use({ storageState: createReviewerStorageState() });
  for (const route of reviewerRoutes) {
    const routeName = route.replace(/\//g, "-").replace(/^-/, "");
    test(`reviewer route ${route}`, async ({ page }, testInfo) => {
      skipTabletVisualProject(testInfo.project.name);
      const projectName = snapshotProjectName(testInfo.project.name);
      await page.goto(route);
      await assertRouteQuality(page, route, true);
      await disableAnimations(page);
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot(`${projectName}-reviewer-${routeName}.png`, {
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
  test.setTimeout(60_000);
  test.use({ storageState: createAdminStorageState() });
  for (const route of adminRoutes) {
    const routeName = route.replace(/\//g, "-").replace(/^-/, "");
    test(`admin route ${route}`, async ({ page }, testInfo) => {
      skipTabletVisualProject(testInfo.project.name);
      const projectName = snapshotProjectName(testInfo.project.name);
      await page.goto(route);
      await assertRouteQuality(page, route, true);
      await disableAnimations(page);
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot(`${projectName}-admin-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page),
        timeout: 20_000,
        maxDiffPixelRatio: 0.01
      });
    });
  }
});
