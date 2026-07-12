import { describe, expect, it } from "vitest";

import { canUseThreeDEnhancement, evaluateThreeDCapability } from "./three-d-capability";

const capable = {
  requested: true,
  reducedMotion: false,
  viewportWidth: 1280,
  finePointer: true,
  hardwareConcurrency: 8,
  webgl: true
};

describe("canUseThreeDEnhancement", () => {
  it("allows a requested enhancement only on a capable desktop", () => {
    expect(canUseThreeDEnhancement(capable)).toBe(true);
  });

  it.each([
    ["not requested", { requested: false }],
    ["reduced motion", { reducedMotion: true }],
    ["small viewport", { viewportWidth: 390 }],
    ["coarse pointer", { finePointer: false }],
    ["weak device", { hardwareConcurrency: 2 }],
    ["webgl unavailable", { webgl: false }]
  ])("falls back when %s", (_label, override) => {
    expect(canUseThreeDEnhancement({ ...capable, ...override })).toBe(false);
  });

  it("reports a bounded fallback reason for device policy telemetry", () => {
    expect(evaluateThreeDCapability({ ...capable, viewportWidth: 390 })).toEqual({
      enabled: false,
      reason: "small-viewport"
    });
    expect(evaluateThreeDCapability(capable)).toEqual({ enabled: true, reason: null });
  });
});
