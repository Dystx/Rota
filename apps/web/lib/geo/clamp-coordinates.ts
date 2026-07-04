/**
 * Phase 5 of the engineering lifecycle (Realtime Triage).
 *
 * Real-time telemetry coordinates go over Supabase Realtime broadcast channels.
 * Each channel payload includes a `{ lng, lat }` pair. Unbounded floats waste
 * up to 50% of the wire payload (a `123.4567890123` is 14 chars, but
 * `123.456789` is 9). The lifecycle spec fixes 6 decimal places (~1cm
 * precision) as the precision floor for human-scale travel.
 *
 * Two clamping helpers:
 *  - `clampCoordinate(value, axis)` for one axis
 *  - `clampCoordinates(lng, lat)` for a pair
 *
 * Invalid inputs (NaN, out-of-range) are passed through; the caller is
 * expected to validate at the source boundary.
 */
const COORDINATE_DECIMALS = 6;

export function clampCoordinate(value: number, _axis: "lng" | "lat"): number {
  if (!Number.isFinite(value)) return value;
  return Number.parseFloat(value.toFixed(COORDINATE_DECIMALS));
}

export function clampCoordinates(
  lng: number,
  lat: number
): [number, number] {
  return [clampCoordinate(lng, "lng"), clampCoordinate(lat, "lat")];
}
