import "server-only";

import { getTripDraftByIdForOwner, tripDraftExists, type TripDraftDetail } from "@repo/db";
import { getCurrentUser } from "@/lib/auth/current-user";

export type TripAccessResult =
  | { kind: "ok"; trip: TripDraftDetail; userId: string }
  | { kind: "anonymous" }
  | { kind: "forbidden" }
  | { kind: "missing" };

/**
 * Resolves a traveler trip request without returning a non-owned trip.
 *
 * The owner-filtered query is the only source for an `ok` trip. After that
 * lookup misses, an id-only existence probe classifies the result internally;
 * route boundaries deliberately render `missing` and `forbidden` identically.
 */
export async function getOwnedTrip(tripId: string): Promise<TripAccessResult> {
  const { user } = await getCurrentUser();

  if (!user) {
    return { kind: "anonymous" };
  }

  const trip = await getTripDraftByIdForOwner(tripId, user.id);

  if (trip) {
    return { kind: "ok", trip, userId: user.id };
  }

  const exists = await tripDraftExists(tripId);

  return exists ? { kind: "forbidden" } : { kind: "missing" };
}
