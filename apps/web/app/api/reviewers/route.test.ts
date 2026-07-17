import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createReviewer: vi.fn(),
  getReviewerById: vi.fn(),
  listReviewers: vi.fn(),
  requireApiRole: vi.fn(),
  updateReviewer: vi.fn(),
  writeAuditTrail: vi.fn()
}));

vi.mock("@repo/db", () => ({
  createReviewer: mocks.createReviewer,
  getReviewerById: mocks.getReviewerById,
  listReviewers: mocks.listReviewers,
  updateReviewer: mocks.updateReviewer,
  writeAuditTrail: mocks.writeAuditTrail
}));
vi.mock("@/lib/auth/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/api")>("@/lib/auth/api");
  return { ...actual, requireApiRole: mocks.requireApiRole };
});

import { GET, POST } from "./route";
import { PATCH } from "./[reviewerId]/route";
import { GET as GET_ONE, PATCH as PATCH_ONE } from "./[reviewerId]/route";

const actor = { capabilities: ["operations:manage"], reviewerId: null, roles: ["admin"], userId: "admin-1" };
const auth = { actor, reviewerId: null, role: "admin", userId: "admin-1" };

function request(body: unknown): Request {
  return new Request("http://localhost/api/reviewers", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST"
  });
}

describe("reviewers API capability boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireApiRole.mockResolvedValue(auth);
  });

  it("requires operations management for the collection", async () => {
    mocks.listReviewers.mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.requireApiRole).toHaveBeenCalledWith(["admin"], ["operations:manage"]);
  });

  it("blocks an unavailable provider before parsing a write", async () => {
    mocks.requireApiRole.mockResolvedValue(Response.json({ code: "unavailable", message: "This service is temporarily unavailable." }, { status: 503 }));
    const hostileRequest = { json: vi.fn(() => { throw new Error("body should not be read"); }) } as unknown as Request;

    const response = await PATCH(hostileRequest, { params: Promise.resolve({ reviewerId: "reviewer-1" }) });

    expect(response.status).toBe(503);
    expect(hostileRequest.json).not.toHaveBeenCalled();
    expect(mocks.updateReviewer).not.toHaveBeenCalled();
  });

  it("uses the same capability for dynamic reads and updates", async () => {
    mocks.getReviewerById.mockResolvedValue({ id: "reviewer-1", name: "Inês" });
    mocks.updateReviewer.mockResolvedValue({ id: "reviewer-1", name: "Inês" });

    await GET_ONE(new Request("http://localhost/api/reviewers/reviewer-1"), { params: Promise.resolve({ reviewerId: "reviewer-1" }) });
    await PATCH_ONE(request({ name: "Inês" }), { params: Promise.resolve({ reviewerId: "reviewer-1" }) });

    expect(mocks.requireApiRole).toHaveBeenCalledWith(["admin"], ["operations:manage"]);
    expect(mocks.updateReviewer).toHaveBeenCalledWith("reviewer-1", { name: "Inês" }, { actor });
  });

  it("writes only after an authorized valid body", async () => {
    const reviewer = { id: "reviewer-1", name: "Inês" };
    mocks.createReviewer.mockResolvedValue(reviewer);

    const response = await POST(request(reviewer));

    expect(response.status).toBe(201);
    expect(mocks.createReviewer).toHaveBeenCalledWith(expect.objectContaining(reviewer), { actor });
  });
});
