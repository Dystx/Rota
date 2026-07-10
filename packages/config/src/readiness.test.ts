import { describe, expect, it } from "vitest";

import { resolveFeatureReadiness } from "./readiness";

describe("resolveFeatureReadiness", () => {
  it("never treats a flag alone as ready", () => {
    expect(
      resolveFeatureReadiness({
        credentials: false,
        enabled: true,
        migration: true,
        provider: true,
        rls: true
      })
    ).toEqual({ status: "unavailable", failed: ["credentials"] });
  });

  it("returns disabled before inspecting providers", () => {
    expect(
      resolveFeatureReadiness({
        credentials: false,
        enabled: false,
        migration: false,
        provider: false,
        rls: false
      })
    ).toEqual({ status: "disabled", reason: "flag_off" });
  });

  it("reports every failed readiness dependency in deterministic order", () => {
    expect(
      resolveFeatureReadiness({
        capability: false,
        credentials: false,
        enabled: true,
        migration: false,
        provider: false,
        rls: false
      })
    ).toEqual({
      status: "unavailable",
      failed: ["credentials", "migration", "rls", "provider", "capability"]
    });
  });
});
