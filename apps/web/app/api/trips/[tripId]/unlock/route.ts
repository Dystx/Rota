import { isPersistenceConfigError, markTripAsPaid } from "@repo/db";

function buildRedirectUrl(request: Request, tripId: string, unlock: string) {
  const currentUrl = new URL(request.url);
  const fallbackUrl = new URL(`/trip/${tripId}`, currentUrl.origin);
  const referer = request.headers.get("referer");

  if (!referer) {
    fallbackUrl.searchParams.set("unlock", unlock);

    return fallbackUrl;
  }

  try {
    const refererUrl = new URL(referer);

    if (refererUrl.origin === currentUrl.origin) {
      refererUrl.searchParams.set("unlock", unlock);

      return refererUrl;
    }
  } catch {
    fallbackUrl.searchParams.set("unlock", unlock);

    return fallbackUrl;
  }

  fallbackUrl.searchParams.set("unlock", unlock);

  return fallbackUrl;
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;

  try {
    const trip = await markTripAsPaid(tripId);

    return Response.redirect(buildRedirectUrl(request, tripId, trip ? "success" : "not-found"), 303);
  } catch (error) {
    return Response.redirect(
      buildRedirectUrl(request, tripId, isPersistenceConfigError(error) ? "unavailable" : "error"),
      303
    );
  }
}
