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
  tripStopsToRouteStatus,
  type TripRouteStatus,
  type TripStopRow
} from "../_lib/trip-to-features";
import { useTripStops, type UseTripStopsResult } from "./use-trip-stops";

export interface UseTripRouteResult {
  data: SpatialFeatureCollection | null;
  /** `partial` means stop points exist but no sourced route geometry is drawn. */
  status: TripRouteStatus;
  isLoading: boolean;
  error: Error | null;
}

/**
 * `useTripRoute(tripId)` — returns the trip's geographic map features as a
 * `SpatialFeatureCollection`. The current legacy trip source contains stop
 * points but no validated route segments, so the collection never invents a
 * connector. `status` tells consumers whether they have useful points
 * (`partial`) or no usable map data (`unavailable`).
 */
export function useTripRoute(tripId: string): UseTripRouteResult {
  const { data: stops, isLoading, error }: UseTripStopsResult = useTripStops(tripId);

  const projection = React.useMemo<{ data: SpatialFeatureCollection | null; status: TripRouteStatus }>(() => {
    if (stops === null) {
      return { data: null, status: "unavailable" };
    }
    const rows: TripStopRow[] = stops.map((stop) => ({
      label: stop.label,
      lat: stop.coordinates[1],
      lng: stop.coordinates[0],
      note: stop.note,
      order: stop.order
    }));

    return {
      data: tripStopsToRouteCollection(rows),
      status: tripStopsToRouteStatus(rows)
    };
  }, [stops]);

  return { ...projection, error, isLoading };
}
