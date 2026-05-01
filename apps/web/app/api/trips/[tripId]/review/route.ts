import {
  createReviewerAssignment,
  getTripDraftById,
  isPersistenceConfigError,
  markLatestAssignmentCompleted,
  markTripAsHumanReviewed,
  requestTripHumanReview
} from "@repo/db";

function buildRedirectUrl(request: Request, tripId: string, review: string, target: "trip" | "reviewer") {
  const currentUrl = new URL(request.url);
  const fallbackUrl = new URL(target === "reviewer" ? `/reviewer/trips/${tripId}` : `/trip/${tripId}`, currentUrl.origin);
  const referer = request.headers.get("referer");

  if (!referer) {
    fallbackUrl.searchParams.set("review", review);

    return fallbackUrl;
  }

  try {
    const refererUrl = new URL(referer);

    if (refererUrl.origin === currentUrl.origin) {
      refererUrl.searchParams.set("review", review);

      return refererUrl;
    }
  } catch {
    fallbackUrl.searchParams.set("review", review);

    return fallbackUrl;
  }

  fallbackUrl.searchParams.set("review", review);

  return fallbackUrl;
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const formData = await request.formData();
  const intent = formData.get("intent");
  const target = formData.get("target") === "reviewer" ? "reviewer" : "trip";
  const notesValue = formData.get("notes");
  const notes = typeof notesValue === "string" && notesValue.trim() ? notesValue.trim() : "Review completed from reviewer workspace.";

  try {
    const existingTrip = await getTripDraftById(tripId);

    if (!existingTrip) {
      return Response.redirect(buildRedirectUrl(request, tripId, "not-found", target), 303);
    }

    if (intent === "request") {
      if (!existingTrip.isPaid) {
        return Response.redirect(buildRedirectUrl(request, tripId, "locked", target), 303);
      }

      const trip = await requestTripHumanReview(tripId);

      if (trip?.status === "in_review") {
        try {
          await createReviewerAssignment({
            notes: "Queued from trip human-review request.",
            reviewerId: "ines-almeida",
            status: "assigned",
            tripId
          });
        } catch {
          // Keep the existing review flow working even when assignment persistence is unavailable.
        }
      }

      const reviewState = trip?.status === "in_review" ? "queued" : trip?.hasHumanReview ? "completed" : "error";

      return Response.redirect(buildRedirectUrl(request, tripId, reviewState, target), 303);
    }

    if (intent === "complete") {
      if (!existingTrip.isPaid) {
        return Response.redirect(buildRedirectUrl(request, tripId, "locked", target), 303);
      }

      const trip = await markTripAsHumanReviewed(tripId);

      if (trip?.hasHumanReview) {
        try {
          await markLatestAssignmentCompleted(tripId, notes);
        } catch {
          // Keep the existing completion flow working even when assignment persistence is unavailable.
        }
      }

      const reviewState = trip?.hasHumanReview ? "completed" : "error";

      return Response.redirect(buildRedirectUrl(request, tripId, reviewState, target), 303);
    }

    return Response.redirect(buildRedirectUrl(request, tripId, "invalid", target), 303);
  } catch (error) {
    return Response.redirect(
      buildRedirectUrl(request, tripId, isPersistenceConfigError(error) ? "unavailable" : "error", target),
      303
    );
  }
}
