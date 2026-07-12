import { describe, expect, it } from "vitest";
import {
  GeographicRouteSchema,
  GeographicRouteSegmentSchema,
  GeographicRouteStopSchema
} from "./geographic-route";

const stop = {
  id: "stop-1",
  activityId: "porto-ribeira-slow-walk",
  title: "Ribeira and Miragaia at walking pace",
  dayIndex: 1,
  order: 0,
  coordinates: [-8.61, 41.14] as const
};

describe("geographic route contract", () => {
  it("keeps WGS84 coordinates separate from schematic x/y points", () => {
    expect(GeographicRouteStopSchema.parse(stop).coordinates).toEqual([-8.61, 41.14]);
    expect(() => GeographicRouteStopSchema.parse({ ...stop, x: 20, y: 30 })).toThrow();
  });

  it("requires geometry when a segment claims a provider or editorial source", () => {
    expect(() =>
      GeographicRouteSegmentSchema.parse({
        fromStopId: "stop-1",
        toStopId: "stop-2",
        mode: "walk",
        durationMinutes: 18,
        distanceMeters: 1200,
        geometry: null,
        source: "provider",
        checkedAt: "2026-07-12",
        attribution: "Route provider"
      })
    ).toThrow();
  });

  it("allows an explicit unavailable route without fabricated connectors", () => {
    const route = GeographicRouteSchema.parse({
      coordinateSystem: "WGS84",
      status: "partial",
      stops: [stop],
      segments: [
        {
          fromStopId: "stop-1",
          toStopId: "stop-2",
          mode: "walk",
          durationMinutes: null,
          distanceMeters: null,
          geometry: null,
          source: "none",
          checkedAt: null,
          attribution: null
        }
      ]
    });

    expect(route.segments[0]?.geometry).toBeNull();
  });
});
