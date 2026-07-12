/**
 * Adapter — DB-shaped trip stop rows → @repo/spatial-engine features.
 *
 * Pure, side-effect-free functions. The adapter is the only place that
 * knows about the DB row column shape; hooks and consumers see
 * spatial-engine-native types (`SpatialFeature` / `SpatialFeatureCollection`)
 * that RouteLayer.bindFeatures can ingest unchanged.
 *
 * Schema mapping for the self-hosted PostgreSQL schema (see
 * `drizzle/0000_initial_rumia.sql`):
 *
 *   The migrations ship `trips` + `trip_briefs` only. Stops are not yet
 *   persisted as a relational table; they live inside the generated
 *   `Itinerary` returned by `@repo/ai`'s `generateItineraryFromBrief` and
 *   are enriched with coordinates by `enrichItineraryWithCoords` (which
 *   the AI module calls internally). The hook in `use-trip-stops.ts`
 *   synthesises a flat, ordered `TripStopRow[]` from that Itinerary and
 *   feeds it through this adapter. The columns below name the
 *   forward-looking fields the eventual `trip_stops` migration is
 *   expected to introduce (`place_name`, `sequence_order`, `note`).
 *
 *   ┌─────────────────────┬──────────────────────────────┐
 *   │ TripStopRow field   │ source                       │
 *   ├─────────────────────┼──────────────────────────────┤
 *   │ order               │ sequence_order (1-based)     │
 *   │ label               │ place_name                   │
 *   │ note                │ itinerary stop `reason`      │
 *   │ lng / lat           │ enriched lng / lat columns   │
 *   └─────────────────────┴──────────────────────────────┘
 *
 * Coordinate order follows the GeoJSON convention: `[longitude, latitude]`.
 * Rows carry lng/lat as separate scalar columns so the swap happens once,
 * here, instead of being scattered across consumers.
 */

import type {
  SpatialFeature,
  SpatialFeatureCollection
} from "@repo/spatial-engine";
import type { GeographicCoordinate } from "@repo/types";

/**
 * DB-shaped row. Mirrors what the eventual `trip_stops` table will look
 * like: lng and lat are stored as separate columns (Postgres `numeric`
 * or `double precision`); the adapter is responsible for swapping them
 * into GeoJSON's `[lng, lat]` order at the boundary.
 */
export interface TripStopRow {
  /** 1-based visit order across the trip's full day sequence. */
  order: number;
  /** Human-readable place name shown on the map. */
  label: string;
  /** One-sentence rationale / local tip for the stop. */
  note: string;
  /** Longitude, decimal degrees. */
  lng: number;
  /** Latitude, decimal degrees. */
  lat: number;
}

/**
 * Spatial-engine-shaped stop returned by `useTripStops`. The shape is
 * what consumers see — already in GeoJSON coordinate order so they
 * don't need to know about lng/lat inversion.
 */
export interface TripStop {
  order: number;
  label: string;
  note: string;
  /** GeoJSON `[lng, lat]` tuple. */
  coordinates: GeographicCoordinate;
}

/**
 * Status exposed by the legacy trip-map adapter while route geometry is not
 * yet sourced. A trip can have usable stop points (`partial`) without having
 * a drawable route; an empty or missing trip is `unavailable`.
 */
export type TripRouteStatus = "partial" | "unavailable";

/** Property bag attached to each Point feature. Matches `fixtureRouteCollection`. */
type TripStopProperties = Record<string, unknown> & {
  order: number;
  label: string;
  note: string;
};

/** Validity guard for a single row — used to filter partial / not-yet-geocoded stops. */
function isCoordinateUsable(row: TripStopRow): boolean {
  return (
    Number.isFinite(row.lng) &&
    Number.isFinite(row.lat) &&
    row.lng >= -180 &&
    row.lng <= 180 &&
    row.lat >= -90 &&
    row.lat <= 90
  );
}

/**
 * Build a Point `SpatialFeature` for one stop. The properties match the
 * shape produced by `fixtureRouteCollection` so existing layer code
 * (e.g. `RouteLayer`, future `SymbolBadgesLayer` consumers) keeps working.
 */
export function tripStopRowToFeature(row: TripStopRow): SpatialFeature {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [row.lng, row.lat]
    },
    properties: {
      order: row.order,
      label: row.label,
      note: row.note
    } satisfies TripStopProperties
  };
}

/**
 * Return the truthful status for a trip whose stop points are known but whose
 * geographic route segments have not been sourced yet. Stop points are useful
 * map context, but they do not authorize a direct stop-to-stop connector.
 */
export function tripStopsToRouteStatus(stops: readonly TripStopRow[]): TripRouteStatus {
  return stops.some(isCoordinateUsable) ? "partial" : "unavailable";
}

/** Human-readable fallback copy for route surfaces and assistive technology. */
export function tripRouteStatusMessage(status: TripRouteStatus): string {
  return status === "partial"
    ? "Stops are shown. Validated route geometry is not available yet, so no route line is drawn."
    : "Validated route geometry is unavailable for this trip.";
}

/**
 * Build the legacy trip-map feature collection from stop points only.
 *
 * This adapter deliberately does not derive a LineString by joining adjacent
 * stops. A straight connector is not a route and would violate the geographic
 * route contract unless it came from a validated, licensed provider or
 * editorial segment. A future sourced-route adapter can append only those
 * validated segment features; until then the map keeps the points and the
 * consumer exposes the `partial`/`unavailable` status.
 */
export function tripStopsToRouteCollection(
  stops: readonly TripStopRow[]
): SpatialFeatureCollection {
  const usableStops = stops.filter(isCoordinateUsable);
  const pointFeatures: SpatialFeature[] = usableStops.map(tripStopRowToFeature);

  return {
    type: "FeatureCollection",
    features: pointFeatures
  };
}

/**
 * Convert a flat `TripStopRow[]` into the spatial-engine-shaped
 * `TripStop[]` that the hook returns to consumers. Mirrors
 * `tripStopRowToFeature`'s coordinate swap so the shape stays in sync.
 */
export function tripStopRowsToStops(stops: readonly TripStopRow[]): TripStop[] {
  return stops.filter(isCoordinateUsable).map((stop) => ({
    coordinates: [stop.lng, stop.lat] as const,
    label: stop.label,
    note: stop.note,
    order: stop.order
  }));
}
