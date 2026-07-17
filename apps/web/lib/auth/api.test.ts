import { describe, expect, it, vi } from "vitest";

const { requireApiAccess } = vi.hoisted(() => ({ requireApiAccess: vi.fn() }));
vi.mock("./authorization", () => ({ requireApiAccess }));

import { requireApiRole, validationError } from "./api";

describe("validationError", () => {
  it("returns the typed top-level API envelope", async () => {
    const response = validationError("Trip brief validation failed.", {
      destination: ["Choose a Portugal region."]
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "validation_error",
      fieldErrors: { destination: ["Choose a Portugal region."] },
      message: "Trip brief validation failed."
    });
  });
});

describe("requireApiRole", () => {
  it("passes role and capability requirements to the shared access guard", async () => {
    const actor = {
      userId: "admin-1",
      roles: ["admin"],
      capabilities: ["content:manage"],
      reviewerId: null
    } as const;
    requireApiAccess.mockResolvedValue(actor);

    await expect(requireApiRole(["admin"], ["content:manage"])).resolves.toMatchObject({
      actor,
      role: "admin"
    });
    expect(requireApiAccess).toHaveBeenCalledWith({
      anyRole: ["admin"],
      allCapabilities: ["content:manage"]
    });
  });
});
