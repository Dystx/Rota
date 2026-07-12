import { describe, expect, it, vi } from "vitest";

import { emitMapTelemetry, type MapTelemetryEvent } from "./map-telemetry";

describe("map telemetry", () => {
  it("forwards only the bounded event contract", () => {
    const handler = vi.fn();
    const event: MapTelemetryEvent = {
      type: "camera-focus",
      surface: "activity-map",
      reason: "selection",
      targetId: "porto-ribeira-slow-walk"
    };

    emitMapTelemetry(handler, event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("swallows host analytics failures", () => {
    const handler = vi.fn(() => {
      throw new Error("analytics unavailable");
    });

    expect(() =>
      emitMapTelemetry(handler, {
        type: "fallback",
        surface: "workspace",
        reason: "webgl-unavailable"
      })
    ).not.toThrow();
  });
});
