import "server-only";

import type { AuthorizedActor } from "@repo/types";
import {
  getTripDraftByIdForOwner,
  isPersistenceConfigError,
  isSchemaDriftError,
  type TripDraftDetail
} from "@repo/db";
import { loadCurrentAuthorizedActorOutcome } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isSessionProviderFailure, type SessionOutcome } from "@/lib/auth/session-outcome";

export type TripAccessResult =
  | { kind: "ok"; trip: TripDraftDetail; userId: string; actor: AuthorizedActor }
  | { kind: "anonymous" }
  | { kind: "unavailable" }
  | { kind: "forbidden" }
  | { kind: "missing" };

export type TripAccessOptions = {
  /** Reuse an actor already authorized by an API boundary. */
  actor?: AuthorizedActor;
  /** Reuse the session probe already performed by the current route. */
  sessionOutcome?: SessionOutcome;
};

/**
 * Resolves a traveler trip request without returning a non-owned trip.
 *
 * The owner-filtered query is the only source for an `ok` trip. After that
 * lookup misses, an id-only existence probe classifies the result internally;
 * route boundaries deliberately render `missing` and `forbidden` identically.
 */
export async function getOwnedTrip(tripId: string, options: TripAccessOptions = {}): Promise<TripAccessResult> {
  const currentUser = options.actor ? null : await getCurrentUser();

  if (!options.actor && currentUser?.outcome === "unavailable") {
    return { kind: "unavailable" };
  }

  const userId = options.actor?.userId ?? currentUser?.user?.id;
  if (!userId) {
    return { kind: "anonymous" };
  }

  const actorOutcome = options.actor
    ? { kind: "ready", actor: options.actor } as const
    : await loadCurrentAuthorizedActorOutcome(options.sessionOutcome ?? currentUser?.sessionOutcome);

  if (actorOutcome.kind === "unavailable") {
    return { kind: "unavailable" };
  }

  if (actorOutcome.kind !== "ready") {
    return { kind: "forbidden" };
  }

  let trip: TripDraftDetail | null;
  try {
    trip = await getTripDraftByIdForOwner(tripId, userId, { actor: actorOutcome.actor });
  } catch (error) {
    if (isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error)) {
      return { kind: "unavailable" };
    }
    throw error;
  }

  if (trip) {
    return { kind: "ok", trip, userId, actor: actorOutcome.actor };
  }

  return { kind: "missing" };
}
