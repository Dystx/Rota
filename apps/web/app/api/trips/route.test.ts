import { describe, expect, test } from "vitest";
import { createFakeAnalyticsProvider } from "@repo/analytics";
import { createFakeMonitoringProvider } from "@repo/monitoring";
import { handleTripCreateRequest } from "./route";
import type { AuthorizedApiContext } from "@/lib/auth/api";
import type { TripBrief } from "@repo/types";

const travelerAuth = {
  client: {},
  reviewerId: null,
  role: "traveler",
  userId: "traveler-user-123"
} as AuthorizedApiContext;

const validBrief: TripBrief = {
  accommodationLocation: "Porto historic center",
  avoidances: ["rushed-schedules"],
  budgetLevel: "mid-range",
  destinationCountry: "portugal",
  endDate: "",
  foodPreferences: ["casual-local-meals"],
  interests: ["local-food", "old-streets"],
  pace: "calm",
  rawBrief:
    "We want a calm five-day Portugal trip with local food, old streets, sea views, and enough buffer time to avoid feeling rushed.",
  regions: ["porto", "douro-valley"],
  startDate: "",
  transportMode: "train-and-transfers",
  travelerType: "couple",
  travelersCount: 2,
  tripLengthDays: 5
};

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/trips", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

describe("handleTripCreateRequest", () => {
  test("creates a draft owned by the authenticated traveler, ignoring client owner input", async () => {
    expect.assertions(4);

    const response = await handleTripCreateRequest(
      jsonRequest({
        ...validBrief,
        owner_user_id: "attacker-controlled-owner"
      }),
      {
        createDraft: async (brief, options) => {
          expect(brief).toEqual(validBrief);
          expect(options.ownerUserId).toBe("traveler-user-123");

          return {
            tripBriefId: "987",
            tripId: "654"
          };
        },
        requireTraveler: async () => travelerAuth
      }
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      message: "Trip brief saved.",
      tripBriefId: "987",
      tripId: "654"
    });
  });

  test("returns validation errors without creating rows for invalid authenticated payloads", async () => {
    let createDraftCalled = false;

    const response = await handleTripCreateRequest(
      jsonRequest({
        ...validBrief,
        rawBrief: "Too short."
      }),
      {
        createDraft: async () => {
          createDraftCalled = true;
          throw new Error("createDraft should not run for invalid payloads.");
        },
        requireTraveler: async () => travelerAuth
      }
    );

    expect(response.status).toBe(400);
    expect(createDraftCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      code: "validation_error",
      fieldErrors: {
        rawBrief: ["Add a fuller brief so the route engine has enough context."]
      },
      message: "Trip brief validation failed."
    });
  });

  test("returns validation errors without creating rows for malformed JSON after auth", async () => {
    let createDraftCalled = false;

    const response = await handleTripCreateRequest(
      new Request("http://localhost/api/trips", {
        body: "{not-valid-json",
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      }),
      {
        createDraft: async () => {
          createDraftCalled = true;
          throw new Error("createDraft should not run for malformed JSON.");
        },
        requireTraveler: async () => travelerAuth
      }
    );

    expect(response.status).toBe(400);
    expect(createDraftCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      code: "validation_error",
      fieldErrors: {
        rawBrief: ["Request body must be valid JSON."]
      },
      message: "Trip brief validation failed."
    });
  });

  test("emits trip_created analytics event with privacy-safe properties on success", async () => {
    const analytics = createFakeAnalyticsProvider();

    const response = await handleTripCreateRequest(jsonRequest(validBrief), {
      analytics,
      createDraft: async () => ({ tripBriefId: "987", tripId: "654" }),
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(201);
    expect(analytics.outbox).toHaveLength(1);

    const captured = analytics.outbox[0];
    expect(captured?.name).toBe("trip_created");
    expect(captured?.distinctId).toBe("traveler-user-123");
    expect(captured?.properties).toEqual({
      trip_id: "654",
      trip_brief_id: "987",
      country: "portugal",
      days: 5,
      traveler_type: "couple",
      transport_mode: "train-and-transfers",
      budget_level: "mid-range",
      pace: "calm",
      travelers_count: 2,
      interests_count: 2,
      regions_count: 2
    });

    const propKeys = Object.keys(captured?.properties ?? {});
    expect(propKeys).not.toContain("rawBrief");
    expect(propKeys).not.toContain("raw_brief");
    expect(propKeys).not.toContain("email");
    expect(propKeys).not.toContain("accommodationLocation");
  });

  test("does not emit analytics when validation fails", async () => {
    const analytics = createFakeAnalyticsProvider();

    const response = await handleTripCreateRequest(
      jsonRequest({ ...validBrief, rawBrief: "Too short." }),
      {
        analytics,
        createDraft: async () => ({ tripBriefId: "1", tripId: "1" }),
        requireTraveler: async () => travelerAuth
      }
    );

    expect(response.status).toBe(400);
    expect(analytics.outbox).toHaveLength(0);
  });

  test("does not emit analytics when persistence fails", async () => {
    const analytics = createFakeAnalyticsProvider();

    const response = await handleTripCreateRequest(jsonRequest(validBrief), {
      analytics,
      createDraft: async () => {
        throw new Error("db down");
      },
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(500);
    expect(analytics.outbox).toHaveLength(0);
  });

  test("still returns 201 when analytics provider throws", async () => {
    const response = await handleTripCreateRequest(jsonRequest(validBrief), {
      analytics: {
        mode: "fake",
        capture: async () => {
          throw new Error("posthog unreachable");
        }
      },
      createDraft: async () => ({ tripBriefId: "1", tripId: "1" }),
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(201);
  });

  test("captures a redacted api_error monitoring event when persistence fails", async () => {
    const monitor = createFakeMonitoringProvider();

    const response = await handleTripCreateRequest(jsonRequest(validBrief), {
      createDraft: async () => {
        throw new Error("supabase down: Bearer eyJabc.def.ghi user@example.com");
      },
      monitor,
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(500);
    expect(monitor.outbox).toHaveLength(1);

    const captured = monitor.outbox[0];
    expect(captured?.name).toBe("api_error");
    expect(captured?.severity).toBe("error");
    expect(captured?.surface).toBe("api");
    expect(captured?.properties).toEqual({
      route: "/api/trips",
      method: "POST",
      status: 500,
      errorCode: "internal_error",
      errorKind: "unknown"
    });

    const stringified = JSON.stringify(captured);
    expect(stringified).not.toContain("Bearer");
    expect(stringified).not.toContain("user@example.com");
    expect(stringified).not.toContain("supabase down");
  });

  test("captures a 503 service_unavailable monitoring event when env is missing", async () => {
    const monitor = createFakeMonitoringProvider();

    const response = await handleTripCreateRequest(jsonRequest(validBrief), {
      createDraft: async () => {
        throw new Error("Missing required environment variable SUPABASE_SERVICE_ROLE_KEY");
      },
      monitor,
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(503);
    expect(monitor.outbox).toHaveLength(1);
    expect(monitor.outbox[0]?.properties).toMatchObject({
      route: "/api/trips",
      status: 503,
      errorCode: "service_unavailable",
      errorKind: "missing_env"
    });
    const stringified = JSON.stringify(monitor.outbox[0]);
    expect(stringified).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  test("still returns 500 when monitoring provider throws", async () => {
    const response = await handleTripCreateRequest(jsonRequest(validBrief), {
      createDraft: async () => {
        throw new Error("db down");
      },
      monitor: {
        mode: "fake",
        capture: async () => {
          throw new Error("monitor unreachable");
        }
      },
      requireTraveler: async () => travelerAuth
    });

    expect(response.status).toBe(500);
  });

  test("blocks anonymous creation before persistence", async () => {
    let createDraftCalled = false;

    const response = await handleTripCreateRequest(jsonRequest(validBrief), {
      createDraft: async () => {
        createDraftCalled = true;
        throw new Error("createDraft should not run without auth.");
      },
      requireTraveler: async () =>
        Response.json(
          {
            error: {
              code: "unauthenticated",
              message: "Authentication required."
            }
          },
          { status: 401 }
        )
    });

    expect(response.status).toBe(401);
    expect(createDraftCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "unauthenticated",
        message: "Authentication required."
      }
    });
  });
});
