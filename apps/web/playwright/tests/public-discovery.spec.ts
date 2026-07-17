import { expect, test } from "@playwright/test";

test.describe("public discovery and trust routes", () => {
  test("home cover keeps the activity brief useful over the poster", async ({ page }) => {
    await page.goto("/");

    const cover = page.getByTestId("home-cover");
    await expect(cover).toHaveAttribute("data-tone", "cover");
    await expect(page.getByTestId("home-headline")).toBeVisible();
    await expect(page.getByTestId("home-value-prop")).toContainText(/judged Portugal activities/i);
    await expect(page.getByTestId("hero-intent-card")).toBeVisible();
    await expect(page.getByTestId("home-text-contrast-overlay")).toHaveAttribute(
      "data-contrast-treatment",
      "frame-independent"
    );
    await expect(page.locator("video[autoplay]")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Portugal atlas exposes one featured region and every compact region link", async ({ page }) => {
    await page.goto("/portugal");

    const featured = page.getByTestId("portugal-featured-region");
    const compact = page.getByTestId("portugal-compact-region-list");
    await expect(featured).toBeVisible();
    await expect(featured.locator("img")).toBeVisible();
    await expect(featured.getByRole("link", { name: /Explore Porto activities/i })).toBeVisible();
    await expect(compact.getByRole("link")).toHaveCount(4);

    for (const region of ["lisbon", "douro", "algarve", "azores"]) {
      await expect(compact.getByTestId(`portugal-region-link-${region}`)).toHaveAttribute(
        "href",
        new RegExp(`region=${region}`)
      );
    }

    await expect(page.locator("video[autoplay]")).toHaveCount(0);
    const compactHeights = await compact.locator('[data-region-card="compact"]').evaluateAll((cards) =>
      cards.map((card) => Math.round(card.getBoundingClientRect().height))
    );
    expect(compactHeights.every((height) => height >= 120)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

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
      await expect(mobilePanel.getByRole("link", { name: "Portugal", exact: true })).toBeVisible();
      for (const label of ["How it works", "Local expertise", "Pricing", "What is worth doing?"]) {
        await expect(mobilePanel.getByRole("link", { name: label, exact: true })).toBeVisible();
      }
      return;
    }
    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    for (const label of ["Portugal", "How it works", "Local expertise", "Pricing", "What is worth doing?"]) {
      await expect(primaryNav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("reviewed activities activate by keyboard and preserve the chosen-day URL", async ({ page }) => {
    await page.goto("/explore?region=porto&mood=a%20walk");
    const explorer = page.getByTestId("activity-explorer");
    await expect(page.getByTestId("explore-results-column")).toBeVisible();
    await expect(page.getByTestId("explore-day-rail")).toHaveAttribute("aria-label", "Your chosen day");
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
    await expect(explorer.getByTestId("activity-result-card").first()).toHaveAttribute("data-saved", "true");
    await expect(page.getByTestId("activity-day-tray")).toBeVisible();
    await expect(page.getByTestId("activity-day-tray")).toContainText("1 activity");
    await expect(page).toHaveURL(/\/explore\?.*saved=porto-ribeira-slow-walk/);
    await expect(page.getByRole("status")).toContainText(/added to your day/i);

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

  test("activity detail keeps judgement, caveat, and save inside the first viewport", async ({ page }) => {
    await page.goto("/activities/porto-ribeira-slow-walk");

    const viewport = page.viewportSize();
    const hero = page.getByTestId("activity-detail-hero");
    const judgement = hero.getByTestId("activity-detail-judgement");
    const save = hero.getByTestId("activity-detail-save-action");
    await expect(hero).toHaveAttribute("data-tone", "cover");
    await expect(judgement).toContainText("Rumia verdict");
    await expect(judgement).toContainText("Time to allow");
    await expect(judgement).toContainText("Leave room for");
    await expect(save.getByRole("button", { name: /save to my day/i })).toBeVisible();

    const judgementBox = await judgement.boundingBox();
    const evidenceBox = await page.getByRole("link", { name: /Read the editorial evidence/i }).boundingBox();
    const saveBox = await save.boundingBox();
    expect(judgementBox).not.toBeNull();
    expect(evidenceBox).not.toBeNull();
    expect(saveBox).not.toBeNull();
    expect((judgementBox?.y ?? Number.POSITIVE_INFINITY) + (judgementBox?.height ?? 0)).toBeLessThanOrEqual(
      viewport?.height ?? Number.POSITIVE_INFINITY
    );
    expect((saveBox?.y ?? 0) + (saveBox?.height ?? 0)).toBeLessThanOrEqual(evidenceBox?.y ?? Number.POSITIVE_INFINITY);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("empty Workspace stays a bounded decision canvas", async ({ page }) => {
    await page.goto("/explore/workspace");

    await expect(page.getByTestId("activity-workspace")).toHaveAttribute("data-state", "empty");
    await expect(page.getByTestId("workspace-empty-anchor")).toBeVisible();
    await expect(page.getByRole("link", { name: "Start with an activity", exact: true })).toBeVisible();
    expect(await page.getByTestId("workspace-empty-anchor").boundingBox()).not.toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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

    await page.goto("/explore/workspace?activity=porto-ribeira-slow-walk&activity=porto-bombarda-art-walk");
    await expect(page.getByRole("heading", { name: "Your tentative day", exact: true })).toBeVisible();
    await expect(page.getByTestId("activity-workspace")).toHaveAttribute("data-state", "multiple");
    await expect(page.getByTestId("workspace-day-summary")).toContainText(/travel|pauses/i);

    const openMap = page.getByRole("button", { name: "View on map", exact: true });
    await expect(openMap).toHaveAttribute("aria-expanded", "false");
    await openMap.click();

    const panel = page.locator("#activity-map-panel");
    await expect(panel).toHaveAttribute("data-map-intent", "explicit");
    await expect(panel.locator('[data-map-mode="map"], [data-map-mode="fallback"]')).toHaveCount(1, { timeout: 15_000 });
    await expect(panel.getByText("Ribeira and Miragaia at walking pace", { exact: true })).toBeVisible();
    await expect(panel.getByTestId("activity-map-list-item")).toHaveCount(2);
    const mapIds = await panel.getByTestId("activity-map-list-item").evaluateAll((items) =>
      items.map((item) => item.getAttribute("data-activity-id"))
    );
    const listIds = await page.getByTestId("workspace-activity-card").evaluateAll((cards) =>
      cards.map((card) => card.querySelector("h2")?.textContent)
    );
    expect(mapIds).toEqual(["porto-ribeira-slow-walk", "porto-bombarda-art-walk"]);
    expect(listIds).toEqual([
      "Ribeira and Miragaia at walking pace",
      "Miguel Bombarda for contemporary art and design"
    ]);

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

    if (test.info().project.name === "mobile-390") {
      await expect(canvas).toHaveAttribute("data-3d-capability", "fallback");
    }
  });
});
