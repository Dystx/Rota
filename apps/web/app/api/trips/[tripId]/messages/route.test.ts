import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  feature: vi.fn(() => true),
  access: vi.fn(),
  client: vi.fn()
}));

vi.mock("@repo/config", () => ({ isFeatureEnabled: mocks.feature }));
vi.mock("@/app/lib/trip-access", () => ({ getOwnedTrip: mocks.access }));

import { GET, POST } from "./route";

const params = Promise.resolve({ tripId: "42" });
const trip = { isPaid: true, hasHumanReview: true, status: "reviewed" };

function request(body?: unknown) {
  return new Request("http://localhost/api/trips/42/messages", body === undefined ? undefined : {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

function requireResponse(response: Response | undefined): Response {
  if (!response) throw new Error("Expected route handler to return a response");
  return response;
}

describe("trip messaging API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.feature.mockReturnValue(true);
    mocks.access.mockResolvedValue({ kind: "ok", trip, userId: "traveler-1" });
  });

  it("returns unavailable while the capability is disabled", async () => {
    mocks.feature.mockReturnValue(false);
    const response = requireResponse(await GET(request(), { params }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "MESSAGING_UNAVAILABLE" } });
    expect(mocks.access).not.toHaveBeenCalled();
  });

  it("returns 401 for an anonymous traveler", async () => {
    mocks.access.mockResolvedValue({ kind: "anonymous" });
    const response = requireResponse(await GET(request(), { params }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when the trip is not owned", async () => {
    mocks.access.mockResolvedValue({ kind: "forbidden" });
    const response = requireResponse(await GET(request(), { params }));
    expect(response.status).toBe(403);
  });

  it("returns unavailable while the PostgreSQL messaging ledger is pending", async () => {
    const response = requireResponse(await GET(request(), { params }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "MESSAGING_UNAVAILABLE" } });
  });

  it("keeps the provider disabled until the PostgreSQL messaging ledger is migrated", async () => {
    const response = requireResponse(await GET(request(), { params }));
    expect(response.status).toBe(503);
  });
});
