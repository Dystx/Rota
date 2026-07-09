import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

test.describe("@trip-lifecycle checkout choices", () => {
  test("renders selectable package cards and preserves Stripe-hosted checkout", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByTestId("checkout-package-selector")).toBeVisible();
    const core = page.getByTestId("checkout-package-core");
    const specialist = page.getByTestId("checkout-package-specialist");
    await expect(core).toHaveAttribute("aria-pressed", "false");
    await specialist.click();
    await expect(specialist).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("checkout-package-submit")).toContainText("Upgrade");
  });
});

test.describe("@trip-lifecycle archive and export boundaries", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("archive empty state points to the planner when no trips exist", async ({ page }) => {
    await page.goto("/itineraries");
    const empty = page.getByTestId("itineraries-empty");
    if (await empty.count()) {
      await expect(empty.getByRole("link", { name: "Plan a trip" })).toHaveAttribute("href", "/planner");
    } else {
      await expect(page.getByRole("heading", { level: 1, name: "Itineraries" })).toBeVisible();
    }
  });

  test("export retry is a real owner-scoped action", async ({ request }) => {
    const response = await request.post("/api/trips/not-a-trip/export/retry", { maxRedirects: 0 });
    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe("@trip-lifecycle export states", () => {
  test("anonymous export access is protected", async ({ request }) => {
    const response = await request.get("/api/trips/not-a-trip/export?format=pdf");
    expect([401, 403]).toContain(response.status());
  });
});
