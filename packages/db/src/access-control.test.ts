import { describe, expect, it } from "vitest";

import { getAuthorizationContext, selectActiveCapabilities } from "./access-control";

describe("selectActiveCapabilities", () => {
  it("deduplicates active, unexpired grants and excludes revoked grants", () => {
    expect(
      selectActiveCapabilities(
        [
          { capability: "content:manage", expiresAt: null, revokedAt: null },
          { capability: "content:manage", expiresAt: null, revokedAt: null },
          { capability: "operations:manage", expiresAt: "2026-05-01T00:00:00.000Z", revokedAt: null },
          { capability: "analytics:read", expiresAt: null, revokedAt: "2026-04-01T00:00:00.000Z" }
        ],
        new Date("2026-05-02T00:00:00.000Z")
      )
    ).toEqual(["content:manage"]);
  });
});

describe("getAuthorizationContext", () => {
  it("derives roles, reviewer identity, and capabilities from database records only", async () => {
    await expect(
      getAuthorizationContext("user-1", {
        loadCapabilityGrants: async () => [
          { capability: "operations:manage", expiresAt: null, revokedAt: null },
          { capability: "analytics:read", expiresAt: "2026-05-01T00:00:00.000Z", revokedAt: null }
        ],
        loadProfile: async () => ({ appRole: "admin" as const }),
        loadReviewerId: async () => null,
        now: new Date("2026-05-02T00:00:00.000Z")
      })
    ).resolves.toEqual({
      capabilities: ["operations:manage"],
      reviewerId: null,
      roles: ["admin"],
      userId: "user-1"
    });
  });
});
