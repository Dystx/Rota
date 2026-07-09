import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  feature: vi.fn(() => true),
  access: vi.fn(),
  client: vi.fn()
}));

vi.mock("@repo/config", () => ({ isFeatureEnabled: mocks.feature }));
vi.mock("@/app/lib/trip-access", () => ({ getOwnedTrip: mocks.access }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.client }));

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

describe("trip messaging API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.feature.mockReturnValue(true);
    mocks.access.mockResolvedValue({ kind: "ok", trip, userId: "traveler-1" });
  });

  it("returns unavailable while the capability is disabled", async () => {
    mocks.feature.mockReturnValue(false);
    const response = await GET(request(), { params });
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "MESSAGING_UNAVAILABLE" } });
    expect(mocks.access).not.toHaveBeenCalled();
  });

  it("returns 401 for an anonymous traveler", async () => {
    mocks.access.mockResolvedValue({ kind: "anonymous" });
    const response = await GET(request(), { params });
    expect(response.status).toBe(401);
  });

  it("returns 403 when the trip is not owned", async () => {
    mocks.access.mockResolvedValue({ kind: "forbidden" });
    const response = await GET(request(), { params });
    expect(response.status).toBe(403);
  });

  it("returns unavailable when the provider/schema cannot be queried", async () => {
    mocks.client.mockResolvedValue({ from: () => ({ select: () => ({ eq: () => ({ order: async () => ({ data: null, error: new Error("relation does not exist") }) }) }) }) });
    const response = await GET(request(), { params });
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "MESSAGING_UNAVAILABLE" } });
  });

  it("returns the stable adapter shape for a successful list", async () => {
    mocks.client.mockResolvedValue({ from: () => ({ select: () => ({ eq: () => ({ order: async () => ({ data: [{ id: "m1", author_role: "traveler", body: "Hello", created_at: "2026-01-01T00:00:00Z" }], error: null }) }) }) }) });
    const response = await GET(request(), { params });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ messages: [{ id: "m1", authorRole: "traveler", body: "Hello", createdAt: "2026-01-01T00:00:00Z" }] });
  });
});
