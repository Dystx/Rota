import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOwnedTrip: vi.fn(),
  retry: vi.fn(),
  requireRole: vi.fn(),
  persistenceConfig: vi.fn(),
  schemaDrift: vi.fn(),
  sessionProvider: vi.fn()
}));

vi.mock("@/app/lib/trip-access", () => ({ getOwnedTrip: mocks.getOwnedTrip }));
vi.mock("@/app/lib/export-jobs", () => ({ retryExportJob: mocks.retry }));
vi.mock("@/lib/auth/api", () => ({
  isApiResponse: (value: unknown) => value instanceof Response,
  requireApiRole: mocks.requireRole
}));
vi.mock("@repo/db", () => ({
  isPersistenceConfigError: mocks.persistenceConfig,
  isSchemaDriftError: mocks.schemaDrift
}));
vi.mock("@/lib/auth/session-outcome", () => ({ isSessionProviderFailure: mocks.sessionProvider }));

import { POST } from "./route";

const actor = { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-1" };
const trip = { id: "42", isPaid: true };
const params = Promise.resolve({ tripId: "42" });

function request() {
  return new Request("http://localhost/api/trips/42/export/retry");
}

describe("trip export retry API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRole.mockResolvedValue({ actor });
    mocks.getOwnedTrip.mockResolvedValue({ kind: "ok", trip });
    mocks.retry.mockReturnValue("retry");
    mocks.persistenceConfig.mockReturnValue(false);
    mocks.schemaDrift.mockReturnValue(false);
    mocks.sessionProvider.mockReturnValue(false);
  });

  it("returns a fixed 503 response for provider failures", async () => {
    const diagnostic = "DATABASE_URL=postgres://secret ECONNREFUSED stack trace";
    mocks.retry.mockImplementation(() => {
      throw new Error(diagnostic);
    });
    mocks.sessionProvider.mockReturnValue(true);

    const response = await POST(request(), { params });
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).toBe("Trip export is temporarily unavailable. Please try again shortly.");
    expect(body).not.toMatch(/DATABASE_URL|ECONNREFUSED|stack trace/i);
  });

  it("returns fixed generic copy for unknown retry failures", async () => {
    const diagnostic = "SQLSTATE 08001 password=secret stack trace";
    mocks.retry.mockImplementation(() => {
      throw new Error(diagnostic);
    });

    const response = await POST(request(), { params });
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toBe("Could not retry trip export.");
    expect(body).not.toMatch(/SQLSTATE|password=secret|stack trace/i);
  });
});
