import { describe, expect, it } from "vitest";

import { requireApiAccess, resourceNotFound } from "./authorization";

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
});

describe("resourceNotFound", () => {
  it("returns the same 404 for missing and foreign resources", async () => {
    const response = resourceNotFound();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ code: "not_found", message: "Resource not found." });
  });
});
