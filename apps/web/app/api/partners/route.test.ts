import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPartner: vi.fn(),
  listPartners: vi.fn(),
  requireApiRole: vi.fn(),
  writeAuditTrail: vi.fn()
}));

vi.mock("@repo/db", () => ({
  createPartner: mocks.createPartner,
  listPartners: mocks.listPartners,
  writeAuditTrail: mocks.writeAuditTrail
}));
vi.mock("@/lib/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/api")>("@/lib/auth/api");
  return { ...actual, requireApiRole: mocks.requireApiRole };
});

import { GET, POST } from "./route";

const actor = { capabilities: ["operations:manage"], reviewerId: null, roles: ["admin"], userId: "admin-1" };
const auth = { actor, reviewerId: null, role: "admin", userId: "admin-1" };

function request(body: unknown): Request {
  return new Request("http://localhost/api/partners", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST"
  });
}

describe("partners API capability boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireApiRole.mockResolvedValue(auth);
  });

  it("requires operations management for reads", async () => {
    mocks.listPartners.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.requireApiRole).toHaveBeenCalledWith(["admin"], ["operations:manage"]);
    expect(mocks.listPartners).toHaveBeenCalledWith(100, { actor });
  });

  it("blocks a wrong-role write before validation or persistence", async () => {
    mocks.requireApiRole.mockResolvedValue(Response.json({ code: "forbidden", message: "Forbidden." }, { status: 403 }));
    const hostileRequest = { json: vi.fn(() => { throw new Error("body should not be read"); }) } as unknown as Request;

    const response = await POST(hostileRequest);

    expect(response.status).toBe(403);
    expect(hostileRequest.json).not.toHaveBeenCalled();
    expect(mocks.createPartner).not.toHaveBeenCalled();
  });

  it("writes for an authorized operator", async () => {
    const partner = {
      coverageRegions: [],
      isAffiliate: false,
      link: "",
      name: "Local host",
      notes: "",
      status: "Draft",
      type: "stay"
    };
    mocks.createPartner.mockResolvedValue({ id: "partner-1", ...partner });

    const response = await POST(request(partner));

    expect(response.status).toBe(201);
    expect(mocks.createPartner).toHaveBeenCalledWith(partner, { actor });
  });
});
