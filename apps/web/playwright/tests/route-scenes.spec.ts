import { expect, test } from "@playwright/test";

import {
  resolveRouteScenarios,
  type ExecutableRouteScenario,
  viewportForMatrix
} from "../visual-state-matrix";

const scenarios = resolveRouteScenarios();

function shouldRunInProject(scenario: ExecutableRouteScenario, projectName: string): boolean {
  if (scenario.viewport === "redirect") return projectName === "desktop-1440";
  return scenario.viewport === projectName;
}

function expectedRedirect(scenario: ExecutableRouteScenario): string {
  if (scenario.state === "redirect") return scenario.redirectTo ?? "/";
  if (scenario.persona === "anonymous") return "/sign-in";
  if (scenario.expected.noPrivateDisclosure && scenario.fixture.kind === "traveler-trip" && "variant" in scenario.fixture && scenario.fixture.variant === "foreign") {
    return "/itineraries";
  }
  return "/sign-in";
}

async function assertNoHorizontalOverflow(page: import("@playwright/test").Page, label: string): Promise<void> {
  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  expect(geometry.documentWidth, `${label} document should not overflow`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.bodyWidth, `${label} body should not overflow`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
}

async function assertRouteScene(page: import("@playwright/test").Page, scenario: ExecutableRouteScenario): Promise<void> {
  const label = `${scenario.id} ${scenario.route} ${scenario.state}`;
  if (scenario.expected.access === "redirect") {
    await expect(page).toHaveURL(new RegExp(`${expectedRedirect(scenario).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\?|$)`));
    if (scenario.expected.noPrivateDisclosure) {
      await expect(page.locator("body")).not.toContainText(/e2e-fixture|Playwright-owned|@e2e-/iu);
    }
    return;
  }

  await expect(page.locator("main"), `${label} should expose one main landmark`).toHaveCount(1);
  await expect(page.locator("h1:visible"), `${label} should expose one visible h1`).toHaveCount(1);
  await expect(page.locator("[data-scene]").first(), `${label} should expose its scene contract`).toHaveAttribute("data-scene", scenario.scene);
  await expect(page.locator("[data-surface-texture]").first(), `${label} should expose its texture contract`).toHaveAttribute("data-surface-texture", scenario.texture);
  await expect(page.locator("img[src*='placehold'], img[src*='placeholder'], img[src*='unsplash.com']"), `${label} must not use placeholder imagery`).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/Playwright-owned|e2e-fixture|@e2e-/iu);
  await assertNoHorizontalOverflow(page, label);

  if (scenario.persona !== "public" && scenario.persona !== "anonymous") {
    await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/u);
  }
  if (scenario.route === "/reviewer/trips/[tripId]" && !["forbidden", "not-found"].includes(scenario.state)) {
    await expect(page.getByRole("link", { name: "Back to review queue" })).toBeVisible();
  }
  if (["/privacy", "/terms", "/sustainability"].includes(scenario.route)) {
    await expect(page.locator('[data-footer-mode="compact"]')).toHaveCount(1);
    const legalGeometry = await page.locator(".rumia-legal-header h1").evaluate((element) => {
      const heading = element.getBoundingClientRect();
      const intro = element.parentElement?.nextElementSibling?.getBoundingClientRect();
      return {
        headingOverflow: element.scrollWidth > element.clientWidth + 1,
        boxesOverlap: Boolean(
          intro && heading.right > intro.left && intro.right > heading.left && heading.bottom > intro.top && intro.bottom > heading.top
        )
      };
    });
    expect(legalGeometry.headingOverflow, `${scenario.route} title should fit its editorial column`).toBe(false);
    expect(legalGeometry.boxesOverlap, `${scenario.route} title and intro should not overlap`).toBe(false);
  }
}

test.describe("@route-scenes manifest-driven route and state contracts", () => {
  test.setTimeout(60_000);

  for (const scenario of scenarios) {
    test(`${scenario.id} ${scenario.route} ${scenario.state} ${scenario.viewport}`, async ({ browser }, testInfo) => {
      test.skip(!shouldRunInProject(scenario, testInfo.project.name), `owned by ${scenario.viewport}`);
      const context = await browser.newContext({
        baseURL: "http://127.0.0.1:3105",
        viewport: viewportForMatrix(scenario),
        ...(scenario.storageState ? { storageState: scenario.storageState } : {})
      });
      const page = await context.newPage();
      try {
        await page.goto(scenario.url, { waitUntil: "load" });
        await assertRouteScene(page, scenario);
      } finally {
        await context.close();
      }
    });
  }

  for (const projectName of ["desktop-1440", "mobile-390"] as const) {
    test(`itineraries filtered-empty interaction ${projectName}`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name !== projectName, `owned by ${projectName}`);
      const scenario = scenarios.find((candidate) => candidate.route === "/itineraries" && candidate.state === "filtered-empty" && candidate.viewport === projectName);
      expect(scenario, "route catalogue must declare itineraries filtered-empty").toBeDefined();
      if (!scenario) return;
      const context = await browser.newContext({
        baseURL: "http://127.0.0.1:3105",
        viewport: viewportForMatrix(scenario),
        storageState: scenario.storageState
      });
      const page = await context.newPage();
      try {
        await page.goto(scenario.url, { waitUntil: "load" });
        await page.getByRole("searchbox", { name: "Search itineraries" }).fill("Madeira");
        await page.getByRole("button", { name: "Drafts" }).click();
        await expect(page.getByTestId("itinerary-filtered-empty")).toBeVisible();
        await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible();
      } finally {
        await context.close();
      }
    });
  }
});
