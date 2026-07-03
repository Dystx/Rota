import { expect, test } from "@playwright/test";
import { createAdminStorageState } from "../fixtures/admin-auth";
import { createReviewerStorageState } from "../fixtures/reviewer-auth";

test.describe("@smoke public routes", () => {
  test("home page renders on the current project viewport", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Discover");
    await expect(page).toHaveURL("/");
  });
});

test.describe("@smoke seeded auth personas", () => {
  test.use({ storageState: createAdminStorageState() });

  test("admin persona storage state is seeded", async ({ context, page }) => {
    await page.goto("/");

    const cookies = await context.cookies();
    expect(cookies.some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"))).toBe(true);
    const token = await page.evaluate(() => localStorage.getItem("supabase.auth.token"));
    expect(token).toBeNull();
  });
});

test.describe("@smoke reviewer persona", () => {
  test.use({ storageState: createReviewerStorageState() });

  test("reviewer persona storage state is seeded", async ({ context, page }) => {
    await page.goto("/");

    const cookies = await context.cookies();
    expect(cookies.some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"))).toBe(true);
    const token = await page.evaluate(() => localStorage.getItem("supabase.auth.token"));
    expect(token).toBeNull();
  });
});
