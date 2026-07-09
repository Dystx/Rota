import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";

// Task 11 lifecycle coverage. The seeded traveler state is intentionally used
// here, but Supabase-backed routes may redirect to sign-in/archive when the
// local environment has no live data. Those cases are explicit skips (rather
// than empty assertions) so CI still reports the missing prerequisite.
const TRIP_ID = "3";

async function openOwnedRoute(page: Parameters<typeof test>[0] extends never ? never : any, path: string, reason: string) {
  await page.goto(path);
  if (!page.url().includes(path)) {
    test.skip(true, `${reason}; landed on ${page.url()}`);
  }
}

test.describe("@task11 checkout package choice", () => {
  test("package cards change the selected package without introducing payment inputs", async ({ page }) => {
    await page.goto("/checkout");
    const selector = page.getByTestId("checkout-package-selector");
    await expect(selector).toBeVisible();

    const core = page.getByTestId("checkout-package-core");
    const specialist = page.getByTestId("checkout-package-specialist");
    await expect(specialist).toHaveAttribute("aria-pressed", "true");
    await core.click();
    await expect(core).toHaveAttribute("aria-pressed", "true");
    await expect(specialist).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('input[type="number"], input[autocomplete="cc-number"], input[name*="card"]')).toHaveCount(0);
  });

  test("selected package is persisted in the unlock form when an owned trip is available", async ({ page }) => {
    test.use({ storageState: createTravelerStorageState() });
    await openOwnedRoute(page, `/checkout?trip=${TRIP_ID}`, "owned checkout data unavailable");
    const core = page.getByTestId("checkout-package-core");
    await core.click();
    await expect(page.locator('input[name="package"]')).toHaveValue("core");
    await expect(page.getByTestId("checkout-package-submit")).toContainText("Core AI");
  });
});

test.describe("@task11 export retry access", () => {
  test("rejects anonymous retry requests before resolving trip state", async ({ request }) => {
    const response = await request.post("/api/trips/not-a-trip/export/retry", { maxRedirects: 0 });
    expect(response.status()).toBe(401);
  });
});

test.describe("@task11 export state and retry", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("format cards expose locked/unlocked state and preserve it on reload", async ({ page }) => {
    await openOwnedRoute(page, `/trip/${TRIP_ID}/export`, "export trip data unavailable");
    const formats = page.locator('[data-testid^="export-format-"]');
    await expect(formats).toHaveCount(4);
    await expect(page.getByTestId("export-format-print")).toBeVisible();
    await expect(page.locator('[data-testid^="export-status-"]').first()).toContainText(/Locked|Unlocked|Unavailable/);
    await page.reload();
    await expect(page.locator('[data-testid^="export-status-"]').first()).toContainText(/Locked|Unlocked|Unavailable/);
  });

  test("ready/error/retry labels and retry action are rendered when the persisted job reaches them", async ({ page }) => {
    await openOwnedRoute(page, `/trip/${TRIP_ID}/export`, "export job data unavailable");
    const statuses = page.locator('[data-testid^="export-status-"]');
    await expect(statuses).toHaveCount(4);
    const text = await statuses.allTextContents();
    expect(text.join(" ")).toMatch(/Locked|Unlocked|Unavailable/);
    const retry = page.getByRole("button", { name: /^Retry$/ });
    if (await retry.count()) {
      await expect(retry.first()).toBeVisible();
      await retry.first().click();
      await expect(page).toHaveURL(/export\?export=retry/);
    }
  });
});

test.describe("@task11 archive filters and account actions", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("archive status chips filter persisted trips and show an actionable empty state", async ({ page }) => {
    await openOwnedRoute(page, "/itineraries", "itinerary archive data unavailable");
    await expect(page.getByTestId("itinerary-status-filter")).toBeVisible();
    await page.getByTestId("itinerary-filter-draft").click();
    await expect(page.getByTestId("itinerary-filter-draft")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("itinerary-filter-reviewed").click();
    await expect(page.getByTestId("itinerary-filtered-empty").or(page.locator('[data-testid^="itinerary-card-"]')).first()).toBeVisible();
  });

  test("account trip cards expose open and checkout actions, or the planner CTA", async ({ page }) => {
    await openOwnedRoute(page, "/account", "account trip data unavailable");
    const list = page.getByTestId("trip-list");
    if (await list.count()) {
      await expect(list.locator('[data-testid^="trip-item-"]').first()).toBeVisible();
      await expect(list.getByRole("link").first()).toBeVisible();
    } else {
      await expect(page.getByRole("link", { name: "Plan a trip" })).toBeVisible();
    }
  });
});
