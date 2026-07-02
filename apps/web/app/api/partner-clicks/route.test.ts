import { describe, expect, test } from "vitest";
import { createFakeAnalyticsProvider } from "@repo/analytics";
import type { BookingClick } from "@repo/db";
import { handlePartnerClickRequest } from "./route";

function clickRequest(
  query: Record<string, string>,
  headers: Record<string, string> = {}
) {
  const params = new URLSearchParams(query);
  return new Request(`http://localhost/api/partner-clicks?${params.toString()}`, {
    headers,
    method: "GET"
  });
}

const validQuery = {
  partnerId: "partner-1",
  source: "itinerary",
  target: "https://booking.example.com/hotel/42?utm=email&token=secret",
  tripId: "trip-123"
};

function fakeBookingClick(): BookingClick {
  return {
    createdAt: "2026-05-02T00:00:00.000Z",
    id: "click-1",
    partnerId: "partner-1",
    partnerName: null,
    referer: null,
    source: "itinerary",
    target: "https://booking.example.com/hotel/42",
    tripId: "trip-123",
    userAgent: null
  };
}

describe("handlePartnerClickRequest", () => {
  test("persists click, emits analytics with hostname only, and 307-redirects", async () => {
    const analytics = createFakeAnalyticsProvider();
    let dbCalled = false;

    const response = await handlePartnerClickRequest(
      clickRequest(validQuery, {
        referer: "https://app.rota.example/trip/123",
        "user-agent": "Mozilla/5.0 (sensitive)"
      }),
      {
        analytics,
        createClick: async (input) => {
          dbCalled = true;
          expect(input.partnerId).toBe("partner-1");
          expect(input.tripId).toBe("trip-123");
          return fakeBookingClick();
        }
      }
    );

    expect(dbCalled).toBe(true);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://booking.example.com/hotel/42?utm=email&token=secret"
    );

    expect(analytics.outbox).toHaveLength(1);
    const captured = analytics.outbox[0];
    expect(captured?.name).toBe("partner_clicked");
    expect(captured?.distinctId).toBe("trip:trip-123");
    expect(captured?.properties).toEqual({
      partner_id: "partner-1",
      trip_id: "trip-123",
      source: "itinerary",
      target_host: "booking.example.com"
    });

    const props = captured?.properties as Record<string, unknown>;
    const serialized = JSON.stringify(props);
    expect(serialized).not.toContain("token=secret");
    expect(serialized).not.toContain("utm=email");
    expect(serialized).not.toContain("Mozilla");
    expect(serialized).not.toContain("rota.example");
    expect(props).not.toHaveProperty("referer");
    expect(props).not.toHaveProperty("user_agent");
    expect(props).not.toHaveProperty("target");
  });

  test("redirects even when DB persistence throws, and still emits a single analytics event", async () => {
    const analytics = createFakeAnalyticsProvider();

    const response = await handlePartnerClickRequest(clickRequest(validQuery), {
      analytics,
      createClick: async () => {
        throw new Error("db down");
      }
    });

    expect(response.status).toBe(307);
    expect(analytics.outbox).toHaveLength(1);
    expect(analytics.outbox[0]?.name).toBe("partner_clicked");
  });

  test("redirects even when analytics provider throws", async () => {
    const response = await handlePartnerClickRequest(clickRequest(validQuery), {
      analytics: {
        mode: "fake",
        capture: async () => {
          throw new Error("posthog down");
        }
      },
      createClick: async () => fakeBookingClick()
    });

    expect(response.status).toBe(307);
  });

  test("rejects missing parameters before persisting or emitting analytics", async () => {
    const analytics = createFakeAnalyticsProvider();
    let dbCalled = false;

    const response = await handlePartnerClickRequest(
      clickRequest({ partnerId: "partner-1", source: "itinerary", target: "https://x.example/" }),
      {
        analytics,
        createClick: async () => {
          dbCalled = true;
          return fakeBookingClick();
        }
      }
    );

    expect(response.status).toBe(400);
    expect(dbCalled).toBe(false);
    expect(analytics.outbox).toHaveLength(0);
  });

  test("rejects non-http(s) protocols before persisting or emitting analytics", async () => {
    const analytics = createFakeAnalyticsProvider();
    let dbCalled = false;

    const response = await handlePartnerClickRequest(
      clickRequest({ ...validQuery, target: "javascript:alert(1)" }),
      {
        analytics,
        createClick: async () => {
          dbCalled = true;
          return fakeBookingClick();
        }
      }
    );

    expect(response.status).toBe(400);
    expect(dbCalled).toBe(false);
    expect(analytics.outbox).toHaveLength(0);
  });
});
