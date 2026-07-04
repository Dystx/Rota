import { describe, expect, it } from "vitest";
import { buildActiveStopFC, type FilmstripStopForMap } from "./useFilmstripSourceSync";

const STOPS: readonly FilmstripStopForMap[] = [
  {
    id: "day-1-stop-0",
    placeName: "Hotel check-in",
    startTime: "14:00"
  },
  {
    id: "day-1-stop-1",
    placeName: "Belém Tower",
    startTime: "16:00",
    coordinates: [-9.2149, 38.6916]
  },
  {
    id: "day-1-stop-2",
    placeName: "Fado dinner",
    startTime: "20:00",
    coordinates: [-9.1467, 38.7104]
  }
];

describe("buildActiveStopFC", () => {
  it("returns an empty FeatureCollection when activeStopId is null", () => {
    const fc = buildActiveStopFC(null, STOPS);
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toEqual([]);
  });

  it("returns an empty FeatureCollection when the active stop is not in the list", () => {
    const fc = buildActiveStopFC("day-99-stop-0", STOPS);
    expect(fc.features).toEqual([]);
  });

  it("returns an empty FeatureCollection when the active stop has no coordinates", () => {
    const fc = buildActiveStopFC("day-1-stop-0", STOPS);
    expect(fc.features).toEqual([]);
  });

  it("builds a single-point feature when the active stop has coordinates", () => {
    const fc = buildActiveStopFC("day-1-stop-1", STOPS);
    expect(fc.features).toHaveLength(1);
    const feature = fc.features[0]!;
    expect(feature.type).toBe("Feature");
    expect(feature.id).toBe("day-1-stop-1");
    expect(feature.geometry).toEqual({
      type: "Point",
      coordinates: [-9.2149, 38.6916]
    });
    expect(feature.properties).toEqual({
      title: "Belém Tower",
      startTime: "16:00"
    });
  });

  it("emits coordinates in [lng, lat] order per GeoJSON / MapLibre", () => {
    const fc = buildActiveStopFC("day-1-stop-2", STOPS);
    const feature = fc.features[0]!;
    if (feature.geometry.type !== "Point") {
      throw new Error(`Expected Point geometry, got ${feature.geometry.type}`);
    }
    const [lng, lat] = feature.geometry.coordinates;
    expect(lng).toBe(-9.1467);
    expect(lat).toBe(38.7104);
  });

  it("handles the edge case of an empty stops array without throwing", () => {
    const fc = buildActiveStopFC("day-1-stop-1", []);
    expect(fc.features).toEqual([]);
  });
});
