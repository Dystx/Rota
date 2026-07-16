import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generate: vi.fn(),
  getOwnedTrip: vi.fn(),
  markError: vi.fn(),
  markReady: vi.fn(),
  queue: vi.fn(),
  requireRole: vi.fn(),
  persistenceConfig: vi.fn(),
  schemaDrift: vi.fn(),
  sessionProvider: vi.fn()
}));

vi.mock("@repo/ai", () => ({ generateItineraryFromBrief: mocks.generate }));
vi.mock("@repo/db", () => ({
  isPersistenceConfigError: mocks.persistenceConfig,
  isSchemaDriftError: mocks.schemaDrift
}));
vi.mock("@/app/lib/trip-access", () => ({ getOwnedTrip: mocks.getOwnedTrip }));
vi.mock("@/app/lib/export-jobs", () => ({
  markExportJobError: mocks.markError,
  markExportJobReady: mocks.markReady,
  queueExportJob: mocks.queue
}));
vi.mock("@/lib/auth/api", () => ({
  forbiddenError: (message: string) => Response.json({ code: "forbidden", message }, { status: 403 }),
  internalError: (message: string, status: number) => Response.json({ code: "internal_error", message }, { status }),
  isApiResponse: (value: unknown) => value instanceof Response,
  notFoundError: (message: string) => Response.json({ code: "not_found", message }, { status: 404 }),
  requireApiRole: mocks.requireRole,
  validationError: (message: string) => Response.json({ code: "validation_error", message }, { status: 400 })
}));
vi.mock("@/lib/auth/session-outcome", () => ({ isSessionProviderFailure: mocks.sessionProvider }));
vi.mock("@/lib/trip-export", () => ({
  buildTripCalendarExport: vi.fn(() => "calendar"),
  buildTripCalendarFilename: vi.fn(() => "trip.ics"),
  buildTripExportFilename: vi.fn(() => "trip.md"),
  buildTripMarkdownExport: vi.fn(() => "markdown"),
  buildTripPdfExport: vi.fn(() => new Uint8Array([1, 2, 3])),
  buildTripPdfFilename: vi.fn(() => "trip.pdf")
}));

import { GET } from "./route";

const actor = { capabilities: [], reviewerId: null, roles: ["traveler"], userId: "traveler-1" };
const trip = { brief: { rawBrief: "A calm Portugal day" }, id: "42", isPaid: true, title: "Portugal day" };
const params = Promise.resolve({ tripId: "42" });

function request() {
  return new Request("http://localhost/api/trips/42/export?format=markdown");
}

describe("trip export API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRole.mockResolvedValue({ actor });
    mocks.getOwnedTrip.mockResolvedValue({ kind: "ok", trip });
    mocks.generate.mockResolvedValue({ days: [] });
    mocks.persistenceConfig.mockReturnValue(false);
    mocks.schemaDrift.mockReturnValue(false);
    mocks.sessionProvider.mockReturnValue(false);
  });

  it("returns a fixed 503 response for provider failures", async () => {
    const diagnostic = "DATABASE_URL=postgres://secret ECONNREFUSED stack trace";
    mocks.generate.mockRejectedValue(new Error(diagnostic));
    mocks.sessionProvider.mockReturnValue(true);

    const response = await GET(request(), { params });
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({
      code: "internal_error",
      message: "Trip export is temporarily unavailable. Please try again shortly."
    });
    expect(JSON.stringify(payload)).not.toMatch(/DATABASE_URL|ECONNREFUSED|stack trace/i);
    expect(mocks.markError).toHaveBeenCalledWith("42");
  });

  it("returns fixed generic copy for unknown export failures", async () => {
    const diagnostic = "SQLSTATE 08001 password=secret stack trace";
    mocks.generate.mockRejectedValue(new Error(diagnostic));

    const response = await GET(request(), { params });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ code: "internal_error", message: "Could not export this trip." });
    expect(JSON.stringify(payload)).not.toMatch(/SQLSTATE|password=secret|stack trace/i);
  });

  it("sanitizes schema failures during API auth", async () => {
    const diagnostic = "schema relation details DATABASE_URL=secret SQLSTATE 42P01";
    mocks.requireRole.mockRejectedValue(new Error(diagnostic));
    mocks.schemaDrift.mockReturnValue(true);

    const response = await GET(request(), { params });
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({
      code: "internal_error",
      message: "Trip export is temporarily unavailable. Please try again shortly."
    });
    expect(JSON.stringify(payload)).not.toMatch(/DATABASE_URL|SQLSTATE|schema relation/i);
  });
});
