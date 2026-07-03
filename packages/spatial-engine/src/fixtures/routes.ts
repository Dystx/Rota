import type { SpatialFeature, SpatialFeatureCollection } from "../core/types";

/**
 * Deterministic itinerary fixture for the WorkspaceCanvas proof of
 * concept. Five stops from Porto down to Lisbon, with a stopover in
 * Coimbra, mirroring the kind of route a real Rumia trip would render.
 */
const PORTUGUESE_CITIES: Array<{ name: string; lng: number; lat: number; note: string }> = [
  { name: "Porto", lng: -8.6291, lat: 41.1579, note: "Cellars, river, day 1." },
  { name: "Coimbra", lng: -8.4291, lat: 40.2033, note: "University + fado, day 2." },
  { name: "Aveiro", lng: -8.654, lat: 40.6405, note: "Canals + salt pans, day 3." },
  { name: "Nazaré", lng: -9.0742, lat: 39.6011, note: "Coastal cliff reset, day 4." },
  { name: "Lisbon", lng: -9.1393, lat: 38.7223, note: "Final day — pasteis + miradouros." }
];

const STOP_FEATURES: SpatialFeature[] = PORTUGUESE_CITIES.map((stop, index) => ({
  type: "Feature",
  geometry: { type: "Point", coordinates: [stop.lng, stop.lat] },
  properties: { order: index + 1, label: stop.name, note: stop.note }
}));

const LINE_FEATURE: SpatialFeature = {
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: PORTUGUESE_CITIES.map((stop) => [stop.lng, stop.lat])
  },
  properties: { kind: "itinerary-line" }
};

export function fixtureRouteCollection(): SpatialFeatureCollection {
  return {
    type: "FeatureCollection",
    features: [LINE_FEATURE, ...STOP_FEATURES]
  };
}

export function fixtureRouteSummary(): Array<{ name: string; note: string }> {
  return PORTUGUESE_CITIES.map((stop) => ({ name: stop.name, note: stop.note }));
}