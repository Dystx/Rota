"use server";

import { updateTripTransportMode } from "@repo/db";
import { getOwnedTrip } from "@/app/lib/trip-access";
import { loadPostgresAuthorizationContext } from "@repo/db";
import type { TransportChoice } from "../_components/logistics/mobility-tiles";

export async function persistLogisticsTransport(tripId: string, choice: TransportChoice): Promise<void> {
  const access = await getOwnedTrip(tripId);
  if (access.kind !== "ok") throw new Error("Trip is unavailable");
  const mode = choice === "car" ? "rental-car" : "train-and-transfers";
  const actor = await loadPostgresAuthorizationContext(access.userId);
  const updated = actor ? await updateTripTransportMode(tripId, mode, access.userId, { actor }) : false;
  if (!updated) throw new Error("Trip update failed");
}
