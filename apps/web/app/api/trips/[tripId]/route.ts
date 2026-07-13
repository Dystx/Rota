import { updateTripTransportMode } from "@repo/db";
import { isApiResponse, internalError, notFoundError, requireApiRole, validationError } from "@/lib/auth/api";

const MODES = { car: "rental-car", transit: "train-and-transfers" } as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireApiRole(["traveler"]);
  if (isApiResponse(auth)) return auth;
  const { tripId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return validationError("Trip update validation failed."); }
  const choice = (body as { transport?: unknown } | null)?.transport;
  if (choice !== "car" && choice !== "transit") return validationError("Trip update validation failed.");
  try {
    const updated = await updateTripTransportMode(tripId, MODES[choice], auth.userId, { actor: auth.actor });
    if (!updated) return notFoundError("Trip not found.");
    return Response.json({ message: "Trip updated." });
  } catch {
    return internalError("Failed to update trip.");
  }
}
