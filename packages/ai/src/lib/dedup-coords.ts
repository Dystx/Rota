/**
 * Coordinate deduplication helper.
 *
 * Extracted verbatim from the deleted
 * `packages/maps/src/geocoding.ts#offsetDuplicateCoords` — pure,
 * provider-agnostic utility, no Mapbox runtime. Geocoders
 * occasionally return the same coordinates for two distinct
 * places (e.g. "Porto" and "Ribeira" both resolving to
 * `41.14, -8.61`); a polyline that visits both on top of each
 * other renders as a single dot. This helper nudges duplicates
 * a few metres apart so the line is visible.
 *
 * The nudge is deterministic in the stop's index — re-running
 * the helper with the same input produces the same output.
 * Adjacent identical stops are shifted by `stopIndex * 17 * 1e-6`
 * degrees (roughly `stopIndex * 1.9` metres at mid latitudes),
 * which is enough to break a 5-metre haversine match without
 * visibly moving the pin.
 */

const FIVE_METRES = 5;
const EARTH_RADIUS_METERS = 6371000;

function distanceMeters(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number }
): number {
  const rad = Math.PI / 180;
  const deltaLat = (b.lat - a.lat) * rad;
  const deltaLng = (b.lng - a.lng) * rad;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const haversine =
    sinLat * sinLat +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

export interface DedupInput {
  lng: number;
  lat: number;
  stopIndex: number;
}

export function offsetDuplicateCoords(
  stops: readonly DedupInput[]
): { lng: number; lat: number }[] {
  const adjusted: { lng: number; lat: number }[] = [];
  for (const stop of stops) {
    const duplicate = adjusted.find((coord) => distanceMeters(coord, stop) <= FIVE_METRES);
    if (duplicate) {
      const offset = stop.stopIndex * 17 * 1e-6;
      adjusted.push({ lng: stop.lng + offset, lat: stop.lat + offset });
      continue;
    }
    adjusted.push({ lng: stop.lng, lat: stop.lat });
  }
  return adjusted;
}
