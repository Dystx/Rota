"use server";

import { updateTripTransportMode } from "@repo/db";
import { getOwnedTrip } from "@/app/lib/trip-access";
import type { TransportChoice } from "../_components/logistics/mobility-tiles";

export async function persistLogisticsTransport(tripId: string, choice: TransportChoice): Promise<void> {
  const access = await getOwnedTrip(tripId);
  if (access.kind !== "ok") throw new Error("Trip is unavailable");
  const mode = choice === "car" ? "rental-car" : "train-and-transfers";
  const updated = await updateTripTransportMode(tripId, mode, access.userId);
  if (!updated) throw new Error("Trip update failed");
}
