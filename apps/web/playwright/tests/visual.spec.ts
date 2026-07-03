import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";
import { createAdminStorageState } from "../fixtures/admin-auth";

const marketingRoutes = ["/", "/portugal", "/how-it-works", "/pricing", "/human-review"];
const travelerRoutes = ["/trip/new", "/trip/3", "/trip/3/map", "/trip/3/export", "/account"];
const reviewerRoutes = ["/reviewer/queue", "/reviewer/profile", "/reviewer/history"];
const adminRoutes = ["/admin/places", "/admin/analytics"];

const disableAnimations = async (page: any) => {
  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important}",
  });
};

const maskLocators = (page: any) => [
  page.locator('[data-testid="trip-created-at"]'),
  page.locator(".timestamp"),
  page.locator(".avatar"),
  page.locator('[data-testid="partner-id"]')
];

test.describe("@smoke @visual Marketing baselines", () => {
  for (const route of marketingRoutes) {
    const routeName = route === "/" ? "home" : route.replace(/\//g, "-").replace(/^-/, "");
    test(`marketing route ${route}`, async ({ page }, testInfo) => {
      await page.goto(route);
      // The home page renders the GlobeWorkspace with a ~3.2s intro
      // camera choreography (earth → europe beat). CSS animations are
      // disabled above, but the WebGL camera position is driven by
      // JavaScript and is non-deterministic for the screenshot if we
      // capture mid-flight. Wait for the choreography to settle on the
      // home page before the baseline compare.
      if (route === "/") {
        await page.waitForTimeout(4000);
      }
      await disableAnimations(page);

      await expect(page).toHaveScreenshot(`${testInfo.project.name}-marketing-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page)
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
      await disableAnimations(page);
      await expect(page).toHaveScreenshot(`${testInfo.project.name}-traveler-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page)
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
      await disableAnimations(page);
      await expect(page).toHaveScreenshot(`${testInfo.project.name}-reviewer-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page)
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
      await disableAnimations(page);
      await expect(page).toHaveScreenshot(`${testInfo.project.name}-admin-${routeName}.png`, {
        fullPage: true,
        animations: "disabled",
        mask: maskLocators(page)
      });
    });
  }
});
