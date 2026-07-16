import { expect, test } from "@playwright/test";

const protectedRoutes = ["/sign-in", "/itineraries", "/vault", "/account"] as const;
const providerDiagnostics = /DATABASE_URL|BETTER_AUTH_SECRET|ECONN|ECONNREFUSED|stack|Next\.js|NEXT_/i;

test.describe("@persistence-unavailable bounded recovery", () => {
  test.setTimeout(20_000);

  for (const route of protectedRoutes) {
    test(`${route} replaces its loading shell with authored recovery`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect(page.getByTestId("decision-state-panel")).toBeVisible({ timeout: 5_000 });
      await expect(page.getByRole("heading", {
        level: 1,
        name: "This part of Rumia is temporarily unavailable"
      })).toBeVisible({ timeout: 5_000 });
      await expect(page.getByRole("link", { name: "Get support" })).toHaveAttribute("href", "/support");
      await expect(page.locator("body")).not.toContainText(providerDiagnostics);
      await expect(page.locator("[data-testid$='-loading'], [data-testid='root-loading']")).toHaveCount(0);

      if (route === "/account") {
        await expect(page.locator("body")).not.toBeEmpty();
      }
    });
  }
});
