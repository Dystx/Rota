import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createRegion: vi.fn(),
  getRegionById: vi.fn(),
  listRegions: vi.fn(),
  requireApiRole: vi.fn(),
  updateRegion: vi.fn(),
  writeAuditTrail: vi.fn()
}));

vi.mock("@repo/db", () => ({
  createRegion: mocks.createRegion,
  getRegionById: mocks.getRegionById,
  listRegions: mocks.listRegions,
  updateRegion: mocks.updateRegion,
  writeAuditTrail: mocks.writeAuditTrail
}));
vi.mock("@/lib/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/api")>("@/lib/auth/api");
  return { ...actual, requireApiRole: mocks.requireApiRole };
});

import { GET, POST } from "./route";
import { PATCH } from "./[regionId]/route";

const actor = { capabilities: ["content:manage"], reviewerId: null, roles: ["admin"], userId: "admin-1" };
const auth = { actor, reviewerId: null, role: "admin", userId: "admin-1" };

function request(body: unknown): Request {
  return new Request("http://localhost/api/regions", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST"
  });
}

describe("regions API capability boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireApiRole.mockResolvedValue(auth);
  });

  it("requires content management for reads", async () => {
    mocks.listRegions.mockResolvedValue([{ id: "north", name: "North" }]);

    await expect(GET()).resolves.toBeInstanceOf(Response);
    expect(mocks.requireApiRole).toHaveBeenCalledWith(["admin"], ["content:manage"]);
    expect(mocks.listRegions).toHaveBeenCalledWith(100, { actor });
  });

  it("returns denial before parsing an anonymous or limited write", async () => {
    mocks.requireApiRole.mockResolvedValue(Response.json({ code: "forbidden", message: "Forbidden." }, { status: 403 }));
    const hostileRequest = { json: vi.fn(() => { throw new Error("body should not be read"); }) } as unknown as Request;

    const response = await POST(hostileRequest);

    expect(response.status).toBe(403);
    expect(mocks.createRegion).not.toHaveBeenCalled();
    expect(hostileRequest.json).not.toHaveBeenCalled();
  });

  it("keeps provider-unavailable denial before validation", async () => {
    mocks.requireApiRole.mockResolvedValue(Response.json({ code: "unavailable", message: "This service is temporarily unavailable." }, { status: 503 }));
    const response = await PATCH(request({}), { params: Promise.resolve({ regionId: "north" }) });

    expect(response.status).toBe(503);
    expect(mocks.updateRegion).not.toHaveBeenCalled();
  });

  it("writes only after the capability check and schema validation", async () => {
    const region = { id: "north", name: "North" };
    mocks.createRegion.mockResolvedValue(region);

    const response = await POST(request(region));

    expect(response.status).toBe(201);
    expect(mocks.createRegion).toHaveBeenCalledWith(expect.objectContaining(region), { actor });
    expect(mocks.writeAuditTrail).toHaveBeenCalledOnce();
  });
});
