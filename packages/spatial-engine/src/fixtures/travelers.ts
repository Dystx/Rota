import type { SpatialFeature, SpatialFeatureCollection } from "../core/types";

/**
 * Deterministic GeoJSON fixtures for phase-1 verification. Real-time
 * traveler / specialist presence will arrive via PostgreSQL-backed SSE or
 * SSE in phase 2 — the engine consumes both via the same
 * TelemetryService.subscribe() / publish() interface.
 */
const TRAVELERS: SpatialFeature[] = [
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-9.1393, 38.7223] },
    properties: { kind: "traveler", label: "Lisbon", country: "PT", pulse: 0.6 }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-8.6291, 41.1579] },
    properties: { kind: "traveler", label: "Porto", country: "PT", pulse: 0.7 }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-9.2978, 38.7068] },
    properties: { kind: "traveler", label: "Sintra", country: "PT", pulse: 0.5 }
  }
];

const SPECIALISTS: SpatialFeature[] = [
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-7.9304, 37.0173] },
    properties: { kind: "specialist", label: "Faro", country: "PT", pulse: 0.4 }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-7.8271, 41.4491] },
    properties: { kind: "specialist", label: "Coimbra", country: "PT", pulse: 0.3 }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-8.5392, 39.4755] },
    properties: { kind: "specialist", label: "Nazaré", country: "PT", pulse: 0.45 }
  }
];

export function fixtureTravelerCollection(): SpatialFeatureCollection {
  return { type: "FeatureCollection", features: [...TRAVELERS] };
}

export function fixtureSpecialistCollection(): SpatialFeatureCollection {
  return { type: "FeatureCollection", features: [...SPECIALISTS] };
}

export function fixtureAllCollections(): {
  travelers: SpatialFeatureCollection;
  specialists: SpatialFeatureCollection;
} {
  return {
    travelers: fixtureTravelerCollection(),
    specialists: fixtureSpecialistCollection()
  };
}
