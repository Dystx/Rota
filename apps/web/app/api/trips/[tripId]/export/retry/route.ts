import { getOwnedTrip } from "@/app/lib/trip-access";
import { retryExportJob } from "@/app/lib/export-jobs";
import { isApiResponse, requireApiRole } from "@/lib/auth/api";

export async function POST(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireApiRole(["traveler"]);
  if (isApiResponse(auth)) return auth;

  const { tripId } = await params;
  const access = await getOwnedTrip(tripId);
  if (access.kind === "anonymous") return Response.redirect(new URL(`/sign-in?next=/trip/${tripId}/export`, _request.url), 303);
  if (access.kind !== "ok") return new Response("Not found", { status: 404 });
  if (!access.trip.isPaid) return new Response("Unlock required", { status: 403 });
  retryExportJob(tripId);
  return Response.redirect(new URL(`/trip/${tripId}/export?export=retry`, _request.url), 303);
}
