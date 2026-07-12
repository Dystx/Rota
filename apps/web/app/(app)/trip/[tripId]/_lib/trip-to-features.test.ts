import { describe, expect, it } from "vitest";

import {
  geographicRouteToFeatureCollection,
  tripStopsToRouteCollection,
  tripRouteStatusMessage,
  tripRouteStatusFromFeatures,
  tripStopsToRouteStatus,
  type TripStopRow
} from "./trip-to-features";

const stops: TripStopRow[] = [
  {
    order: 1,
    label: "Ribeira",
    note: "Historic riverfront",
    lng: -8.6109,
    lat: 41.1496
  },
  {
    order: 2,
    label: "Clerigos",
    note: "Go before the afternoon queue",
    lng: -8.6148,
    lat: 41.1457
  }
];

describe("trip stop geographic projection", () => {
  it("keeps stop points without fabricating an unsourced connector", () => {
    const collection = tripStopsToRouteCollection(stops);

    expect(collection.features).toHaveLength(2);
    expect(collection.features.every((feature) => feature.geometry.type === "Point")).toBe(true);
    expect(collection.features.map((feature) => feature.geometry)).toEqual([
      { type: "Point", coordinates: [-8.6109, 41.1496] },
      { type: "Point", coordinates: [-8.6148, 41.1457] }
    ]);
  });

  it("reports a partial route when stops exist but validated route geometry does not", () => {
    expect(tripStopsToRouteStatus(stops)).toBe("partial");
    expect(tripStopsToRouteStatus([])).toBe("unavailable");
    expect(tripRouteStatusMessage("partial")).toContain("no route line is drawn");
    expect(tripRouteStatusMessage("unavailable")).toContain("unavailable for this trip");
  });

  it("renders only sourced geographic segments and reports ready", () => {
    const collection = geographicRouteToFeatureCollection({
      coordinateSystem: "WGS84",
      status: "ready",
      stops: [
        { id: "stop-1", activityId: "ribeira", title: "Ribeira", dayIndex: 1, order: 0, coordinates: [-8.61, 41.14] },
        { id: "stop-2", activityId: "clerigos", title: "Clérigos", dayIndex: 1, order: 1, coordinates: [-8.615, 41.145] }
      ],
      segments: [
        {
          fromStopId: "stop-1",
          toStopId: "stop-2",
          mode: "walk",
          durationMinutes: 12,
          distanceMeters: 900,
          geometry: { type: "LineString", coordinates: [[-8.61, 41.14], [-8.615, 41.145]] },
          source: "provider",
          checkedAt: "2026-07-12",
          attribution: "Rumia route provider"
        },
        {
          fromStopId: "stop-2",
          toStopId: "stop-3",
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

    expect(collection.features.map((feature) => feature.geometry.type)).toEqual(["Point", "Point", "LineString"]);
    expect(tripRouteStatusFromFeatures(stops, collection)).toBe("ready");
  });
});
