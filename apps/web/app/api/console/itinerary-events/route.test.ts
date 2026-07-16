import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getAdminPageAuthContext: vi.fn(),
  insertItineraryEvent: vi.fn(),
  isAdminPageAuthContext: vi.fn(),
  isPersistenceConfigError: vi.fn(() => false),
  isSchemaDriftError: vi.fn(() => false),
  isSessionProviderFailure: vi.fn(() => false),
  listItineraryEvents: vi.fn()
}));

vi.mock("@/lib/auth/admin", () => ({
  getAdminPageAuthContext: mocks.getAdminPageAuthContext,
  isAdminPageAuthContext: mocks.isAdminPageAuthContext
}));
vi.mock("@/lib/auth/session-outcome", () => ({
  isSessionProviderFailure: mocks.isSessionProviderFailure
}));
vi.mock("@repo/db", () => ({
  isPersistenceConfigError: mocks.isPersistenceConfigError,
  isSchemaDriftError: mocks.isSchemaDriftError
}));
vi.mock("./store", () => ({
  insertItineraryEvent: mocks.insertItineraryEvent,
  listItineraryEvents: mocks.listItineraryEvents
}));

import { GET, POST } from "./route";

const admin = {
  actor: { capabilities: [], reviewerId: null, roles: ["admin"], userId: "admin-user-123" },
  role: "admin",
  userId: "admin-user-123"
};

function request(method: "GET" | "POST", url: string, body?: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    method
  });
}

const eventInput = {
  conversationId: "conversation-1",
  eventDate: "2026-07-16",
  eventTime: "10:30",
  eventType: "activity",
  title: "Ribeira walk"
};

describe("console itinerary event route recovery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getAdminPageAuthContext.mockResolvedValue(admin);
    mocks.isAdminPageAuthContext.mockReturnValue(true);
    mocks.isPersistenceConfigError.mockReturnValue(false);
    mocks.isSchemaDriftError.mockReturnValue(false);
    mocks.isSessionProviderFailure.mockReturnValue(false);
  });

  test("returns fixed 503 copy for a provider failure on POST", async () => {
    const hostile = Object.assign(new Error("DATABASE_URL=secret ECONNREFUSED SQL stack"), { code: "ECONNREFUSED" });
    mocks.insertItineraryEvent.mockRejectedValue(hostile);
    mocks.isSessionProviderFailure.mockReturnValue(true);

    const response = await POST(request("POST", "/api/console/itinerary-events", eventInput));

    expect(response.status).toBe(503);
    const payload = await response.json();
    expect(payload).toEqual({
      ok: false,
      error: "This service is temporarily unavailable. Please try again shortly."
    });
    expect(JSON.stringify(payload)).not.toMatch(/DATABASE_URL|ECONNREFUSED|SQL|stack/i);
  });

  test("returns fixed 500 copy for an unknown GET failure", async () => {
    mocks.listItineraryEvents.mockRejectedValue(new Error("DATABASE_URL=secret ECONNREFUSED SQL stack"));

    const response = await GET(request("GET", "/api/console/itinerary-events?conversationId=conversation-1"));

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toEqual({ ok: false, error: "Could not load timeline events." });
    expect(JSON.stringify(payload)).not.toMatch(/DATABASE_URL|ECONNREFUSED|SQL|stack/i);
  });
});
