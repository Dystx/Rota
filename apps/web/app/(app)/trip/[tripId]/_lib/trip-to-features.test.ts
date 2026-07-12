import { describe, expect, it } from "vitest";

import {
  tripStopsToRouteCollection,
  tripRouteStatusMessage,
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
});
