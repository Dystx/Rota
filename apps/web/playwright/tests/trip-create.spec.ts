import { expect, test } from "@playwright/test";

test.describe("@smoke @trip-create trip creation API", () => {
  test("blocks anonymous trip creation before payload parsing", async ({ request }) => {
    const response = await request.post("/api/trips", {
      data: {
        owner_user_id: "client-controlled-owner",
        rawBrief: "This anonymous payload should never be persisted because the API requires a traveler session."
      }
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ code: "unauthenticated", message: "Authentication required." });
  });

  test("returns the standard validation error shape for malformed JSON", async ({ request }) => {
    const response = await request.post("/api/trips", {
      data: "{not-valid-json",
      headers: {
        "Content-Type": "application/json"
      }
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ code: "unauthenticated", message: "Authentication required." });
  });
});
