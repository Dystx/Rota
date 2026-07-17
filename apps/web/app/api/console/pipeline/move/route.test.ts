import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getAdminPageAuthContext: vi.fn(),
  isAdminPageAuthContext: vi.fn(),
  isPersistenceConfigError: vi.fn(() => false),
  isSchemaDriftError: vi.fn(() => false),
  isSessionProviderFailure: vi.fn(() => false),
  moveTripStage: vi.fn()
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
vi.mock("./store", () => ({ moveTripStage: mocks.moveTripStage }));

import { POST } from "./route";

const admin = {
  actor: { capabilities: [], reviewerId: null, roles: ["admin"], userId: "admin-user-123" },
  role: "admin",
  userId: "admin-user-123"
};

describe("console pipeline move route recovery", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getAdminPageAuthContext.mockResolvedValue(admin);
    mocks.isAdminPageAuthContext.mockReturnValue(true);
    mocks.isPersistenceConfigError.mockReturnValue(false);
    mocks.isSchemaDriftError.mockReturnValue(false);
    mocks.isSessionProviderFailure.mockReturnValue(false);
  });

  test("returns fixed 503 copy for a provider failure", async () => {
    const hostile = Object.assign(new Error("DATABASE_URL=secret ECONNREFUSED SQL stack"), { code: "ECONNREFUSED" });
    mocks.moveTripStage.mockRejectedValue(hostile);
    mocks.isSessionProviderFailure.mockReturnValue(true);

    const response = await POST(new NextRequest("http://localhost/api/console/pipeline/move", {
      body: JSON.stringify({ toStatus: "in_revision", tripId: "trip-1" }),
      headers: { "content-type": "application/json" },
      method: "POST"
    }));

    expect(response.status).toBe(503);
    const payload = await response.json();
    expect(payload).toEqual({
      code: "unavailable",
      message: "This service is temporarily unavailable. Please try again shortly."
    });
    expect(JSON.stringify(payload)).not.toMatch(/DATABASE_URL|ECONNREFUSED|SQL|stack/i);
  });

  test("returns fixed 500 copy for an unknown failure", async () => {
    mocks.moveTripStage.mockRejectedValue(new Error("DATABASE_URL=secret ECONNREFUSED SQL stack"));

    const response = await POST(new NextRequest("http://localhost/api/console/pipeline/move", {
      body: JSON.stringify({ toStatus: "in_revision", tripId: "trip-1" }),
      headers: { "content-type": "application/json" },
      method: "POST"
    }));

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toEqual({ code: "internal_error", message: "Could not move trip." });
    expect(JSON.stringify(payload)).not.toMatch(/DATABASE_URL|ECONNREFUSED|SQL|stack/i);
  });

  test("returns fixed 503 copy for schema drift during console auth", async () => {
    mocks.getAdminPageAuthContext.mockRejectedValue(new Error("schema details DATABASE_URL=secret SQLSTATE 42P01"));
    mocks.isSchemaDriftError.mockReturnValue(true);

    const response = await POST(new NextRequest("http://localhost/api/console/pipeline/move", {
      body: JSON.stringify({ toStatus: "in_revision", tripId: "trip-1" }),
      headers: { "content-type": "application/json" },
      method: "POST"
    }));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({ code: "unavailable", message: "This service is temporarily unavailable. Please try again shortly." });
    expect(JSON.stringify(payload)).not.toMatch(/DATABASE_URL|SQLSTATE|schema details/i);
  });

  test("denies limited capability before parsing or calling the store", async () => {
    mocks.getAdminPageAuthContext.mockResolvedValue({ reason: "forbidden", status: 403 });
    mocks.isAdminPageAuthContext.mockReturnValue(false);

    const response = await POST(new NextRequest("http://localhost/api/console/pipeline/move", {
      body: JSON.stringify({ toStatus: "not-a-real-status", tripId: "trip-1" }),
      headers: { "content-type": "application/json" },
      method: "POST"
    }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ code: "forbidden", message: "Forbidden." });
    expect(mocks.moveTripStage).not.toHaveBeenCalled();
  });

  test("returns the shared sanitized validation envelope", async () => {
    const response = await POST(new NextRequest("http://localhost/api/console/pipeline/move", {
      body: JSON.stringify({ toStatus: "not-a-real-status", tripId: "trip-1" }),
      headers: { "content-type": "application/json" },
      method: "POST"
    }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload).toMatchObject({ code: "validation_error", message: "Invalid payload." });
    expect(payload).not.toHaveProperty("error");
    expect(payload).not.toHaveProperty("details");
  });
});
