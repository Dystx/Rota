import "server-only";

import { getTripDraftById, getTripDraftByIdForOwner, type TripDraftDetail } from "@repo/db";
import { getCurrentUser } from "@/lib/auth/current-user";

export type TripAccessResult =
  | { kind: "ok"; trip: TripDraftDetail; userId: string }
  | { kind: "anonymous" }
  | { kind: "forbidden" }
  | { kind: "missing" };

/**
 * Resolves a traveler trip request without returning a non-owned trip.
 *
 * The owner-filtered query is the only source for an `ok` trip. The second
 * lookup is internal classification after authentication; route boundaries
 * deliberately render `missing` and `forbidden` identically.
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

  const existingTrip = await getTripDraftById(tripId);

  return existingTrip ? { kind: "forbidden" } : { kind: "missing" };
}
