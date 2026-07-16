import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadSessionOutcome, loadPostgresAuthorizationContext } = vi.hoisted(() => ({
  loadSessionOutcome: vi.fn(),
  loadPostgresAuthorizationContext: vi.fn()
}));

vi.mock("./session-outcome", async () => {
  const actual = await vi.importActual<typeof import("./session-outcome")>("./session-outcome");
  return { ...actual, loadSessionOutcome };
});
vi.mock("@repo/db", () => ({
  isPersistenceConfigError: vi.fn(() => false),
  loadPostgresAuthorizationContext
}));

import { loadCurrentAuthorizedActor, requireApiAccess, resourceNotFound } from "./authorization";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireApiAccess", () => {
  it("uses database capabilities for secure decisions", async () => {
    const result = await requireApiAccess(
      { allCapabilities: ["operations:manage"] },
      { loadActor: async () => ({ userId: "u1", roles: ["admin"], capabilities: [], reviewerId: null }) }
    );

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(403);
  });

  it("allows an actor with every required database capability", async () => {
    const result = await requireApiAccess(
      { allCapabilities: ["operations:manage"] },
      {
        loadActor: async () => ({
          userId: "u1",
          roles: ["admin"],
          capabilities: ["operations:manage"],
          reviewerId: null
        })
      }
    );

    expect(result).toEqual({
      userId: "u1",
      roles: ["admin"],
      capabilities: ["operations:manage"],
      reviewerId: null
    });
  });

  it("keeps an unavailable persistence probe distinct from unauthenticated access", async () => {
    const result = await requireApiAccess(
      { anyRole: ["admin"] },
      { loadActorOutcome: async () => ({ kind: "unavailable" }) }
    );

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(503);
    await expect((result as Response).json()).resolves.toEqual({
      code: "unavailable",
      message: "This service is temporarily unavailable."
    });
  });
});

describe("resourceNotFound", () => {
  it("returns the same 404 for missing and foreign resources", async () => {
    const response = resourceNotFound();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ code: "not_found", message: "Resource not found." });
  });
});

describe("loadCurrentAuthorizedActor", () => {
  it("preserves an unavailable session outcome", async () => {
    loadSessionOutcome.mockResolvedValue({ kind: "unavailable" });

    await expect(loadCurrentAuthorizedActor()).resolves.toEqual({ kind: "unavailable" });
    expect(loadPostgresAuthorizationContext).not.toHaveBeenCalled();
  });

  it("uses an explicit session outcome without probing the session loader", async () => {
    const sessionOutcome = {
      kind: "ready",
      session: { user: { id: "u1" }, session: { id: "s1" } }
    } as unknown as import("./session-outcome").SessionOutcome;
    loadSessionOutcome.mockResolvedValue(sessionOutcome);
    loadPostgresAuthorizationContext.mockResolvedValue({
      userId: "u1",
      roles: ["traveler"],
      capabilities: [],
      reviewerId: null
    });

    const result = await loadCurrentAuthorizedActor(sessionOutcome);

    expect(result.kind).toBe("ready");
    expect(loadSessionOutcome).not.toHaveBeenCalled();
    expect(loadPostgresAuthorizationContext).toHaveBeenCalledOnce();
  });
});
