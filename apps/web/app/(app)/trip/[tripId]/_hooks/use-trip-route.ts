"use client";

/**
 * useTripRoute — derives a `SpatialFeatureCollection` from the trip's
 * ordered stops and feeds `RouteLayer` / `applyLayerUpdate` directly.
 *
 * Reuses `useTripStops` for the fetch + shape projection, then runs
 * the result through `tripStopsToRouteCollection` (pure, in
 * `_lib/trip-to-features.ts`). The hook is intentionally thin so the
 * adapter stays the single source of truth for the row → GeoJSON
 * transformation — both this hook and any future consumer (export
 * pipeline, snapshot diff, etc.) see identical collections.
 */

import * as React from "react";
import type { SpatialFeatureCollection } from "@repo/spatial-engine";

import {
  tripStopsToRouteCollection,
  type TripStopRow
} from "../_lib/trip-to-features";
import { useTripStops, type UseTripStopsResult } from "./use-trip-stops";

export interface UseTripRouteResult {
  data: SpatialFeatureCollection | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * `useTripRoute(tripId)` — returns the trip's route as a
 * `SpatialFeatureCollection`. `data` is `null` when the trip was not
 * found; when the trip exists but no stops have usable coordinates
 * yet, `data` is an empty collection (RouteLayer handles that
 * gracefully — no features → nothing rendered).
 */
export function useTripRoute(tripId: string): UseTripRouteResult {
  const { data: stops, isLoading, error }: UseTripStopsResult = useTripStops(tripId);

  const data = React.useMemo<SpatialFeatureCollection | null>(() => {
    if (stops === null) {
      return null;
    }
    return tripStopsToRouteCollection(
      stops.map((stop) => ({
        label: stop.label,
        lat: stop.coordinates[1],
        lng: stop.coordinates[0],
        note: stop.note,
        order: stop.order
      }))
    );
  }, [stops]);

  return { data, error, isLoading };
}