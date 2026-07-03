"use client";

/**
 * useTripStops — fetches a trip's ordered stop rows and projects them
 * into the spatial-engine-native `TripStop` shape that
 * `useTripRoute` and the CinematicMap migration consume.
 *
 * Data path:
 *   1. The server action `fetchTripStopsAction` (in
 *      `../_actions/fetch-trip-stops.ts`) runs on the server and calls
 *      `@repo/db.getTripDraftById` + `@repo/ai.generateItineraryFromBrief`.
 *      It returns the flat, ordered `TripStopRow[]` or `null` when
 *      the trip is missing.
 *   2. The hook owns loading / error state via `useState` and uses a
 *      monotonic request id (not AbortController — server actions don't
 *      accept a signal) to drop stale responses when `tripId` changes
 *      mid-flight.
 *
 * The server action lives in a separate file because Next.js 16
 * forbids inline `"use server"` directives inside `"use client"`
 * modules — the action must be in a file whose top-level directive
 * is `"use server"`. The previous inline pattern was an artefact of
 * the earlier Next.js preview; the new file is the supported
 * migration path and keeps the hook's public API unchanged.
 *
 * Why an inline server action instead of `@tanstack/react-query` or
 * `swr`? Neither is in `apps/web/package.json` and the constraint
 * forbids new dependencies. The existing `useReducedMotion` hook in
 * `@repo/ui` follows the same `useState` + `useEffect` precedent.
 */

import * as React from "react";

import {
  tripStopRowsToStops,
  type TripStop,
  type TripStopRow
} from "../_lib/trip-to-features";
import { fetchTripStopsAction } from "../_actions/fetch-trip-stops";

/**
 * Public hook surface. Matches the contract the CinematicMap migration
 * will wire against — `null` for "no trip found", `[]` for "trip
 * exists but no stops have coordinates yet".
 */
export interface UseTripStopsResult {
  data: TripStop[] | null;
  isLoading: boolean;
  error: Error | null;
}

/** Internal raw payload from the server action. */
type FetchResult = TripStopRow[] | null;

/**
 * `useTripStops(tripId)` — typed React hook that fetches a trip's
 * ordered, geocoded stops and projects them into the spatial-engine
 * `TripStop` shape.
 *
 * Returns:
 *   - `data`: `TripStop[]` on success, `null` when the trip was not
 *     found, and `[]` when no stops have usable coordinates.
 *   - `isLoading`: `true` until the first fetch settles.
 *   - `error`: the underlying `Error` if the fetch threw (excluding
 *     the "not found" case, which is reported via `data: null`).
 */
export function useTripStops(tripId: string): UseTripStopsResult {
  const [data, setData] = React.useState<TripStop[] | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);

  // Monotonic id so out-of-order responses from the server action
  // can't clobber the latest state. Server actions don't accept an
  // AbortController signal, so this guard is the cancellation
  // mechanism we have.
  const requestIdRef = React.useRef<number>(0);

  React.useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    fetchTripStopsAction(tripId).then(
      (result: FetchResult) => {
        if (requestIdRef.current !== requestId) {
          return;
        }
        setData(result === null ? null : tripStopRowsToStops(result));
        setIsLoading(false);
      },
      (caught: unknown) => {
        if (requestIdRef.current !== requestId) {
          return;
        }
        setData(null);
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        setIsLoading(false);
      }
    );
  }, [tripId]);

  return { data, error, isLoading };
}
