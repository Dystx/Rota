import { expect, test } from "@playwright/test";

async function assertResolvedRoute(page: import("@playwright/test").Page, route: string): Promise<void> {
  await expect(page.locator("main"), `${route} should expose one main landmark after recovery`).toHaveCount(1);
  await expect(page.locator("h1:visible"), `${route} should expose one resolved heading`).toHaveCount(1);
  await expect(page.locator("[aria-busy='true']"), `${route} should not remain busy after recovery`).toHaveCount(0);
}

test.describe("@recovery deterministic loading and persistence recovery", () => {
  test.setTimeout(60_000);

  test("offline recovery remains actionable when persistence is unreachable", async ({ page }) => {
    await page.route("**/api/**", (route) => route.abort("failed").catch(() => undefined));
    await page.goto("/offline", { waitUntil: "domcontentloaded" });
    await assertResolvedRoute(page, "/offline");
    await expect(page.getByRole("link", { name: /home|back|return/i }).first()).toBeVisible();
  });

  test("missing routes resolve through the shared recovery shell", async ({ page }) => {
    await page.goto("/acceptance-route-that-does-not-exist", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await expect(page.locator("[data-scene='utility']").first()).toBeVisible();
    await expect(page.locator("[data-surface-texture='none']").first()).toBeVisible();
  });

  test("a failed client navigation returns to resolved content", async ({ page }) => {
    await page.goto("/offline", { waitUntil: "domcontentloaded" });
    await assertResolvedRoute(page, "/offline");
    await page.route("**?_rsc=**", (route) => route.abort("failed").catch(() => undefined));
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL(/\/$/u);
    await assertResolvedRoute(page, "/");
  });
});
