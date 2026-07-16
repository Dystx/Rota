import { getOwnedTrip } from "@/app/lib/trip-access";
import { retryExportJob } from "@/app/lib/export-jobs";
import { isApiResponse, requireApiRole } from "@/lib/auth/api";
import { isPersistenceConfigError, isSchemaDriftError } from "@repo/db";
import { isSessionProviderFailure } from "@/lib/auth/session-outcome";

function retryFailure(error: unknown) {
  const unavailable = isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error);
  return new Response(
    unavailable ? "Trip export is temporarily unavailable. Please try again shortly." : "Could not retry trip export.",
    { status: unavailable ? 503 : 500 }
  );
}

export async function POST(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  let auth: Awaited<ReturnType<typeof requireApiRole>>;
  try {
    auth = await requireApiRole(["traveler"]);
  } catch (error) {
    return retryFailure(error);
  }
  if (isApiResponse(auth)) return auth;

  const { tripId } = await params;
  try {
    const access = await getOwnedTrip(tripId, { actor: auth.actor });
    if (access.kind === "anonymous") return Response.redirect(new URL(`/sign-in?next=/trip/${tripId}/export`, _request.url), 303);
    if (access.kind === "unavailable") return new Response("Trip export is temporarily unavailable. Please try again shortly.", { status: 503 });
    if (access.kind !== "ok") return new Response("Not found", { status: 404 });
    if (!access.trip.isPaid) return new Response("Unlock required", { status: 403 });
    retryExportJob(tripId);
    return Response.redirect(new URL(`/trip/${tripId}/export?export=retry`, _request.url), 303);
  } catch (error) {
    return retryFailure(error);
  }
}
