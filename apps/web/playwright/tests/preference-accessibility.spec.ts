import { expect, test, type Page } from "@playwright/test";

import { primaryBaselineRows, resolveScenarioUrl, storageStateForPersona, viewportForMatrix } from "../visual-state-matrix";

const representativeRows = primaryBaselineRows().filter((row, index, rows) => {
  if (row.viewport !== "desktop-1440") return false;
  const firstScene = rows.find((candidate) => candidate.viewport === "desktop-1440" && candidate.scene === row.scene);
  const fixedControlRoute = /privacy|terms|sustainability|sign-in|checkout|reviewer|admin|console|api\/v1\/docs/iu.test(row.route);
  return row === firstScene || fixedControlRoute;
});

async function assertPreferenceContract(page: Page, route: string): Promise<void> {
  await expect(page.locator("main"), `${route} should expose one main landmark`).toHaveCount(1);
  await expect(page.locator("h1:visible"), `${route} should expose one visible heading`).toHaveCount(1);
  await expect(page.locator("video[autoplay]"), `${route} must not autoplay media under reduced motion/data`).toHaveCount(0);
  const hiddenMotionContent = await page.locator("[aria-hidden='true']").evaluateAll((elements) =>
    elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }).length
  );
  expect(hiddenMotionContent, `${route} should not hide visible content from assistive technology`).toBe(0);
}

test.describe("@preference accessibility preferences and keyboard contracts", () => {
  test.setTimeout(60_000);

  for (const row of representativeRows) {
    test(`${row.id} honors reduced motion, reduced data, and low power`, async ({ browser }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop-1440", "preference representatives run once on the canonical desktop project");
      const context = await browser.newContext({
        baseURL: "http://127.0.0.1:3105",
        viewport: viewportForMatrix(row),
        ...(storageStateForPersona(row.persona) ? { storageState: storageStateForPersona(row.persona) } : {})
      });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, "connection", {
          configurable: true,
          value: { saveData: true, effectiveType: "2g", addEventListener() {}, removeEventListener() {} }
        });
        Object.defineProperty(window, "__RUMIA_LOW_POWER__", { configurable: true, value: true });
      });
      const page = await context.newPage();
      try {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(resolveScenarioUrl(row), { waitUntil: "domcontentloaded" });
        await assertPreferenceContract(page, row.route);
      } finally {
        await context.close();
      }
    });
  }

  test("keyboard and 200 percent zoom retain a usable public recovery route", async ({ page }) => {
    await page.goto("/offline", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus-visible").first()).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    const geometry = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(geometry.scrollWidth).toBeGreaterThanOrEqual(geometry.clientWidth);
  });
});
