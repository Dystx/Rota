/**
 * Server-side trip-stops fetcher.
 *
 * Extracted from `use-trip-stops.ts` into its own file so Next.js
 * 16's stricter `"use server"` rules can satisfy the
 * "Server Actions must live in a file marked `"use server"` at
 * the top, not as an inline function inside a Client Component"
 * check. The hook imports the action from this module; the
 * hook's public API is unchanged. Because this is client-callable, it
 * authorizes through the owner-scoped trip helper before it generates or
 * returns any route locations or stop reasons.
 */

"use server";

import { generateItineraryFromBrief } from "@repo/ai";
import type { Itinerary } from "@repo/types";
import { getOwnedTrip } from "@/app/lib/trip-access";

import {
  type TripStopRow
} from "../_lib/trip-to-features";

type FetchResult = TripStopRow[] | null;

/**
 * Flatten a generated Itinerary into a single, ordered `TripStopRow[]`.
 * Order is the visit order across the whole trip: day 1 stops come
 * first, then day 2, etc. Stops without usable lng/lat (geocoding not
 * yet available) are kept here; the adapter strips them when building
 * features, but we keep the full set so the hook can expose them to
 * consumers that want raw coordinates.
 */
function flattenItineraryToRows(itinerary: Itinerary): TripStopRow[] {
  const rows: TripStopRow[] = [];
  let order = 0;

  for (const day of itinerary.days) {
    for (const stop of day.stops) {
      order += 1;

      if (stop.lng === undefined || stop.lat === undefined) {
        // Skip stops without coordinates — the adapter cannot place
        // them on the map.
        continue;
      }

      rows.push({
        label: stop.placeName,
        lat: stop.lat,
        lng: stop.lng,
        note: stop.reason,
        order
      });
    }
  }

  return rows;
}

/**
 * Server-side fetcher. The inline pattern (`async function ... { "use server"; ... }`)
 * inside a `"use client"` file is forbidden by Next.js 16; moving
 * the action to its own file with `"use server"` at the top is
 * the supported escape hatch. Returned promise resolves to `null`
 * when the trip doesn't exist; any other error propagates so the
 * hook can record it as `error`. Anonymous, missing, and non-owner requests
 * all receive `null`, so the action does not reveal whether a trip exists.
 */
export async function fetchTripStopsAction(tripId: string): Promise<FetchResult> {
  const tripAccess = await getOwnedTrip(tripId);

  if (tripAccess.kind !== "ok") {
    return null;
  }

  const itinerary = await generateItineraryFromBrief(tripAccess.trip.brief);
  return flattenItineraryToRows(itinerary);
}
