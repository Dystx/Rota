import { expect, test } from "@playwright/test";

test.describe("public discovery and trust routes", () => {
  test("renders a public shell with exact navigation", async ({ page }) => {
    await page.goto("/explore");
    const mobileToggle = page.getByTestId("top-nav-mobile-toggle").first();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    if (await mobileToggle.isVisible()) {
      await expect(mobileToggle).toHaveAttribute("aria-expanded", "false");
      const mobilePanel = page.getByTestId("top-nav-mobile-panel");
      await mobileToggle.click();
      await expect(mobilePanel).toBeVisible();
      await expect(mobilePanel.getByRole("link", { name: "What to do", exact: true })).toBeVisible();
      for (const label of ["How it works", "Local expertise", "Pricing", "Explore activities"]) {
        await expect(mobilePanel.getByRole("link", { name: label, exact: true })).toBeVisible();
      }
      return;
    }
    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    for (const label of ["What to do", "How it works", "Local expertise", "Pricing", "Explore activities"]) {
      await expect(primaryNav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("reviewed activities activate by keyboard and preserve the chosen-day URL", async ({ page }) => {
    await page.goto("/explore?region=porto&mood=a%20walk");
    const explorer = page.getByTestId("activity-explorer");
    const activityTitle = "Ribeira and Miragaia at walking pace";
    const save = explorer.getByRole("button", { name: `Save ${activityTitle} to this day` });
    await save.scrollIntoViewIfNeeded();
    await save.focus();
    await expect(save).toBeFocused();
    await page.keyboard.press("Enter");
    const saved = explorer
      .locator('section[aria-label="Judged activities"]')
      .getByRole("button", { name: `Remove ${activityTitle} from this day` });
    await expect(saved).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/\/explore\?.*saved=porto-ribeira-slow-walk/);
    await expect(page.getByTestId("activity-status")).toContainText(/added to your day/i);

    await saved.focus();
    await page.keyboard.press("Enter");
    const restored = explorer
      .locator('section[aria-label="Judged activities"]')
      .getByRole("button", { name: `Save ${activityTitle} to this day` });
    await expect(restored).toHaveAttribute("aria-pressed", "false");
    await expect(page).not.toHaveURL(/saved=/);
    await expect(page.getByTestId("activity-status")).toContainText(/removed from your day/i);

    await restored.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/explore\?.*saved=porto-ribeira-slow-walk/);

    const chosenDay = page.getByRole("button", { name: "See this day", exact: true });
    await chosenDay.focus();
    await expect(chosenDay).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/explore\/workspace\?activity=porto-ribeira-slow-walk/);
    await expect(page.getByRole("heading", { name: "Your tentative day", exact: true })).toBeVisible();
    await expect(page.getByText("Ribeira and Miragaia at walking pace", { exact: true })).toBeVisible();
  });

  test("pricing exposes the three ascension choices", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Free activity-day preview", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Chosen-day export", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Optional local review", exact: true })).toBeVisible();
    await expect(page.getByText("€19", { exact: true })).toBeVisible();
    await expect(page.getByText("€49", { exact: true })).toBeVisible();
  });

  test("offline page offers recovery action", async ({ page }) => {
    await page.goto("/offline");
    const recovery = page.getByRole("link", { name: "Stay on this offline page", exact: true });
    await expect(recovery).toBeVisible();
    await expect(recovery).toHaveAttribute("href", "/offline");
    await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
  });

  test("activity map is explicit and keeps the complete list equivalent", async ({ page }) => {
    test.skip(process.env.ENABLE_ACTIVITY_MAP?.trim().toLowerCase() !== "true", "Requires ENABLE_ACTIVITY_MAP=true");

    await page.goto("/explore/workspace?activity=porto-ribeira-slow-walk");
    await expect(page.getByRole("heading", { name: "Your tentative day", exact: true })).toBeVisible();

    const openMap = page.getByRole("button", { name: "View on map", exact: true });
    await expect(openMap).toHaveAttribute("aria-expanded", "false");
    await openMap.click();

    const panel = page.locator("#activity-map-panel");
    await expect(panel).toHaveAttribute("data-map-intent", "explicit");
    await expect(panel.locator('[data-map-mode="map"], [data-map-mode="fallback"]')).toHaveCount(1, { timeout: 15_000 });
    await expect(panel.getByText("Ribeira and Miragaia at walking pace", { exact: true })).toBeVisible();

    await expect(openMap).toHaveAttribute("aria-expanded", "true");
    await panel.getByRole("button", { name: "View list", exact: true }).click();
    await expect(panel).toHaveCount(0);
    await expect(page.getByText("Ribeira and Miragaia at walking pace", { exact: true })).toBeVisible();
  });

  test("feature-enabled 3D requests keep a device-safe fallback", async ({ page }) => {
    test.skip(
      process.env.ENABLE_ACTIVITY_MAP?.trim().toLowerCase() !== "true" ||
        process.env.ENABLE_ACTIVITY_MAP_3D?.trim().toLowerCase() !== "true",
      "Requires ENABLE_ACTIVITY_MAP=true and ENABLE_ACTIVITY_MAP_3D=true"
    );

    await page.goto("/explore/workspace?activity=porto-ribeira-slow-walk");
    const openMap = page.getByRole("button", { name: "View on map", exact: true });
    await openMap.click();

    const panel = page.locator("#activity-map-panel");
    const canvas = panel.locator('[data-testid="activity-map-canvas"]');
    await expect(canvas).toBeVisible({ timeout: 15_000 });
    await expect(canvas).toHaveAttribute("data-3d-capability", /enabled|fallback|off/);

    if (test.info().project.name === "mobile-chromium") {
      await expect(canvas).toHaveAttribute("data-3d-capability", "fallback");
    }
  });
});
