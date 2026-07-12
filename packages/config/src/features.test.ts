import { describe, expect, it } from "vitest";
import { featureFlagNames, getFeatureFlagEnvironmentVariable, isFeatureEnabled } from "./features";

describe("feature flags", () => {
  it("keeps every feature off unless it is explicitly enabled", () => {
    expect(isFeatureEnabled("tripMessaging", {})).toBe(false);
    expect(isFeatureEnabled("tripMessaging", { ENABLE_TRIP_MESSAGING: "false" })).toBe(false);
    expect(isFeatureEnabled("tripMessaging", { ENABLE_TRIP_MESSAGING: "true" })).toBe(true);
    expect(isFeatureEnabled("tripMessaging", { ENABLE_TRIP_MESSAGING: " TRUE " })).toBe(true);
    expect(isFeatureEnabled("activityMap", {})).toBe(false);
    expect(isFeatureEnabled("activityMap", { ENABLE_ACTIVITY_MAP: "true" })).toBe(true);
  });

  it("exposes the deployment variable name without exposing a value", () => {
    expect(getFeatureFlagEnvironmentVariable("b2bBeta")).toBe("ENABLE_B2B_BETA");
    expect(getFeatureFlagEnvironmentVariable("activityMap")).toBe("ENABLE_ACTIVITY_MAP");
  });

  it("includes every approved gated operator surface", () => {
    expect(featureFlagNames).toEqual([
      "liveAi",
      "stripe",
      "transactionalEmail",
      "tripMessaging",
      "b2bBeta",
      "guideBeta",
      "operatorConsole",
      "consoleConfig",
      "apiDocs",
      "activityMap",
      "pt"
    ]);
  });
});
