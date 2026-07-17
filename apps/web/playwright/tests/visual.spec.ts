import { expect, test, type Page } from "@playwright/test";

import {
  baselineSnapshotName,
  primaryBaselineRows,
  assertExactArtifactReceipt,
  type ExecutableRouteScenario,
  viewportForMatrix
} from "../visual-state-matrix";

const primaryRows = primaryBaselineRows();

function shouldRunInProject(row: ExecutableRouteScenario, projectName: string): boolean {
  return row.viewport === projectName;
}

async function disableMotion(page: Page): Promise<void> {
  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important}.rumia-cinematic-media__video{visibility:hidden!important;opacity:0!important}"
  });
}

async function assertVisualContract(page: Page, row: ExecutableRouteScenario): Promise<void> {
  const label = `${row.id} ${row.route} ${row.viewport}`;
  await expect(page.locator("main"), `${label} should expose one main landmark`).toHaveCount(1);
  await expect(page.locator("h1:visible"), `${label} should expose one visible h1`).toHaveCount(1);
  await expect(page.locator("[data-scene]").first(), `${label} should expose its scene contract`).toHaveAttribute("data-scene", row.scene);
  await expect(page.locator("[data-surface-texture]").first(), `${label} should expose its texture contract`).toHaveAttribute("data-surface-texture", row.texture);
  await expect(page.locator("img[src*='placehold'], img[src*='placeholder'], img[src*='unsplash.com']"), `${label} must not use placeholder imagery`).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/Playwright-owned|e2e-fixture|@e2e-/iu);
  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  expect(geometry.documentWidth, `${label} document should not overflow`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.bodyWidth, `${label} body should not overflow`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  if (row.persona !== "public" && row.persona !== "anonymous") {
    await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/u);
  }
}

test.describe("@smoke @visual manifest-driven primary baselines", () => {
  test.setTimeout(60_000);
  test.beforeEach(() => {
    assertExactArtifactReceipt();
  });

  for (const row of primaryRows) {
    test(`${row.id} ${row.route} ${row.viewport}`, async ({ browser }, testInfo) => {
      test.skip(!shouldRunInProject(row, testInfo.project.name), `owned by ${row.viewport}`);
      const context = await browser.newContext({
        baseURL: "http://127.0.0.1:3105",
        viewport: viewportForMatrix(row),
        ...(row.storageState ? { storageState: row.storageState } : {})
      });
      const page = await context.newPage();
      try {
        await page.goto(row.url, { waitUntil: "domcontentloaded" });
        await assertVisualContract(page, row);
        await disableMotion(page);
        await page.waitForTimeout(100);
        await expect(page).toHaveScreenshot(baselineSnapshotName(row), {
          fullPage: true,
          animations: "disabled",
          timeout: 20_000,
          maxDiffPixelRatio: 0.01
        });
      } finally {
        await context.close();
      }
    });
  }
});
