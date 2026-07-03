/**
 * Adapter — DB-shaped trip stop rows → @repo/spatial-engine features.
 *
 * Pure, side-effect-free functions. The adapter is the only place that
 * knows about the DB row column shape; hooks and consumers see
 * spatial-engine-native types (`SpatialFeature` / `SpatialFeatureCollection`)
 * that RouteLayer.bindFeatures can ingest unchanged.
 *
 * Schema mapping (current state of the Supabase schema — see
 * `supabase/migrations/202604291900_create_trip_briefs_and_trips.sql`):
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
  coordinates: readonly [number, number];
}

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
 * Build a complete route `SpatialFeatureCollection`: one LineString
 * feature (the trip outline) plus one Point feature per stop. The
 * collection is the same shape `fixtureRouteCollection` produces so
 * `RouteLayer` / `applyLayerUpdate(layer, collection)` ingests it
 * without modification.
 *
 * Stops with missing or out-of-range coordinates are filtered out of
 * the LineString; the resulting collection may legitimately have only
 * Point features if fewer than two stops have usable coordinates (a
 * single Point can't form a LineString per the GeoJSON spec).
 */
export function tripStopsToRouteCollection(
  stops: readonly TripStopRow[]
): SpatialFeatureCollection {
  const usableStops = stops.filter(isCoordinateUsable);

  const lineFeature: SpatialFeature | null =
    usableStops.length >= 2
      ? {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: usableStops.map((stop) => [stop.lng, stop.lat])
          },
          properties: { kind: "itinerary-line" } satisfies Record<string, unknown>
        }
      : null;

  const pointFeatures: SpatialFeature[] = usableStops.map(tripStopRowToFeature);

  const features: SpatialFeature[] = [
    ...(lineFeature ? [lineFeature] : []),
    ...pointFeatures
  ];

  return {
    type: "FeatureCollection",
    features
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