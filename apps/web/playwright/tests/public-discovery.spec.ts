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
      await mobilePanel.waitFor({ state: "visible", timeout: 1000 }).catch(() => undefined);
      if (!(await mobilePanel.isVisible())) {
        await mobileToggle.click();
      }
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
    await page.goto("/explore");
    const explorer = page.getByTestId("activity-explorer");
    const save = explorer.getByRole("button", { name: /^Save .* to this day$/ }).first();
    await save.scrollIntoViewIfNeeded();
    await save.focus();
    await expect(save).toBeFocused();
    await page.keyboard.press("Enter");
    const saved = explorer.getByRole("button", { name: /^Remove .* from this day$/ }).first();
    await expect(saved).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/\/explore\?.*saved=porto-ribeira-slow-walk/);
    await expect(page.getByTestId("activity-status")).toContainText(/added to your day/i);

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
});
