import { expect, test } from "@playwright/test";
import { createTravelerStorageState } from "../fixtures/traveler-auth";
import { getTravelerTripId } from "../fixtures/traveler-trip";

// T21 Core Trip Lifecycle E2E Suite
// Covers the traveler persona walking the read-only lifecycle surfaces:
//   /trip/[id]           -> overview
//   /trip/[id]/map       -> route validation map
//   /trip/[id]/export    -> export center
// Plus a negative API check for unauthenticated trip creation.
//
// We use trip id "3" because it is a stable demo route handled by the trip
// pages even when Supabase env is not configured (the pages render an info
// message rather than throwing, which keeps E2E coverage deterministic in
// CI without live Supabase credentials).
//
// Selectors are stable data-testid hooks confirmed in:
//   apps/web/app/(app)/trip/[tripId]/page.tsx          -> trip-overview-header
//   apps/web/app/(app)/trip/[tripId]/map/page.tsx      -> trip-map-header
//   apps/web/app/(app)/trip/[tripId]/export/page.tsx   -> trip-export-header
//
// Grep tag: @traveler-lifecycle (matches `--grep traveler-lifecycle`).

const tripId = () => getTravelerTripId();

test.describe("@smoke @traveler-lifecycle traveler trip lifecycle", () => {
  test.use({ storageState: createTravelerStorageState() });

  test("traveler can load overview, map, and export surfaces for a trip", async ({ page }) => {
    await page.goto(`/trip/${tripId()}`);
    await expect(page.getByTestId("trip-overview-header")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/trip/${tripId()}$`));

    await page.goto(`/trip/${tripId()}/map`);
    await expect(page.getByTestId("trip-map-header")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/trip/${tripId()}/map$`));

    await page.goto(`/trip/${tripId()}/export`);
    await expect(page.getByTestId("trip-export-header")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/trip/${tripId()}/export$`));
  });

  test("export center exposes share, access, and included-list surfaces", async ({ page }) => {
    await page.goto(`/trip/${tripId()}/export`);

    await expect(page.getByTestId("trip-export-header")).toBeVisible();
    await expect(page.getByTestId("export-options")).toBeVisible();
    await expect(page.getByTestId("share-card")).toBeVisible();
    await expect(page.getByTestId("access-card")).toBeVisible();
    await expect(page.getByTestId("included-list")).toBeVisible();
  });

  test("export print view renders the print-only marker", async ({ page }) => {
    await page.goto(`/trip/${tripId()}/export?view=print`);

    await expect(page.locator('[data-testid="print-view"]')).toBeAttached();
  });
});

test.describe("@smoke @traveler-lifecycle unauthenticated trip API", () => {
  test("anonymous trip creation is rejected with the standard 401 shape", async ({ request }) => {
    const response = await request.post("/api/trips", {
      data: {
        owner_user_id: "client-controlled-owner",
        rawBrief:
          "Lifecycle E2E negative check: unauthenticated POST /api/trips must be rejected before persistence."
      }
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "unauthenticated",
        message: "Authentication required."
      }
    });
  });
});
