import { expect, test, type Browser, type Page } from "@playwright/test";

import { assertExactArtifactReceipt } from "../visual-state-matrix";

type RouteOptions = {
  storageState?: string;
};

export async function withMobilePage(
  browser: Browser,
  path: string,
  options: RouteOptions,
  assertion: (page: Page) => Promise<void>
): Promise<void> {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:3105",
    viewport: { width: 390, height: 844 },
    ...(options.storageState ? { storageState: options.storageState } : {})
  });
  const page = await context.newPage();
  try {
    await page.goto(path, { waitUntil: "load" });
    await assertion(page);
  } finally {
    await context.close();
  }
}

test.describe("@smoke @visual-quality bounded visual hardening", () => {
  test.beforeEach(() => {
    assertExactArtifactReceipt();
  });

  test("planner--ready uses the midnight decision field with linen ink", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "one canonical mobile composition run");

    await withMobilePage(browser, "/planner", {}, async (page) => {
      const surface = page.getByTestId("planner-single-screen");
      await expect(surface).toBeVisible();
      const styles = await surface.evaluate((element) => {
        const heading = element.querySelector("h1");
        if (!(heading instanceof HTMLElement)) throw new Error("Planner H1 is missing");
        return {
          backgroundColor: window.getComputedStyle(element).backgroundColor,
          headingColor: window.getComputedStyle(heading).color
        };
      });

      expect(styles.backgroundColor).toBe("rgb(22, 40, 31)");
      expect(styles.headingColor).toBe("rgb(239, 236, 230)");
    });
  });

  test("home--ready keeps readable chapters and one-up mobile activity cards", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "one canonical mobile composition run");

    await withMobilePage(browser, "/", {}, async (page) => {
      await expect(page.getByTestId("home-editorial-chapter")).toHaveAttribute("data-tone", "decision");
      const geometry = await page.getByTestId("destination-bento-grid").evaluate((grid) => {
        const gridRect = grid.getBoundingClientRect();
        const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-testid^='bento-card-']"));
        return {
          gridHeight: gridRect.height,
          cards: cards.map((card) => {
            const rect = card.getBoundingClientRect();
            const content = card.querySelector<HTMLElement>("[data-bento-content]");
            const contentRect = content?.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              leftOffset: rect.left - gridRect.left,
              rightOverflow: rect.right - gridRect.right,
              contentFits: Boolean(
                contentRect &&
                contentRect.left >= rect.left &&
                contentRect.right <= rect.right &&
                content &&
                content.scrollWidth <= content.clientWidth + 1 &&
                content.scrollHeight <= content.clientHeight + 1
              )
            };
          })
        };
      });

      expect(geometry.cards).toHaveLength(3);
      expect(geometry.gridHeight).toBeLessThanOrEqual(1_040);
      for (const card of geometry.cards) {
        expect(card.width).toBeGreaterThanOrEqual(320);
        expect(card.height).toBeGreaterThanOrEqual(300);
        expect(card.height).toBeLessThanOrEqual(340);
        expect(Math.abs(card.leftOffset)).toBeLessThanOrEqual(1);
        expect(card.rightOverflow).toBeLessThanOrEqual(1);
        expect(card.contentFits).toBe(true);
      }
    });
  });
});
