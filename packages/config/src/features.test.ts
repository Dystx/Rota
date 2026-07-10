import { describe, expect, it } from "vitest";
import { getFeatureFlagEnvironmentVariable, isFeatureEnabled } from "./features";

describe("feature flags", () => {
  it("keeps every feature off unless it is explicitly enabled", () => {
    expect(isFeatureEnabled("tripMessaging", {})).toBe(false);
    expect(isFeatureEnabled("tripMessaging", { ENABLE_TRIP_MESSAGING: "false" })).toBe(false);
    expect(isFeatureEnabled("tripMessaging", { ENABLE_TRIP_MESSAGING: "true" })).toBe(true);
    expect(isFeatureEnabled("tripMessaging", { ENABLE_TRIP_MESSAGING: " TRUE " })).toBe(true);
  });

  it("exposes the deployment variable name without exposing a value", () => {
    expect(getFeatureFlagEnvironmentVariable("b2bBeta")).toBe("ENABLE_B2B_BETA");
  });
});
