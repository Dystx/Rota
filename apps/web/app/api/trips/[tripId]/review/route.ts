import { createFakeCheckoutProvider, createStripeCheckoutProvider, type CheckoutProvider } from "@repo/payments";
import { getTripDraftById, isPersistenceConfigError, markReviewerTripAssignmentCompleted, markTripAsHumanReviewed, reviewerHasTripAssignment, type TripDraftDetail } from "@repo/db";
import { createServerStripeSecretConfig } from "@repo/config/server";
import { forbiddenError, internalError, isApiResponse, requireApiRole, validationError, type AuthorizedApiContext } from "@/lib/auth/api";

export type ReviewCompleteNotifier = (input: {
  notes: string;
  trip: TripDraftDetail;
}) => Promise<void> | void;

type ReviewRouteDependencies = {
  checkoutProvider?: CheckoutProvider;
  getTrip?: typeof getTripDraftById;
  markHumanReviewed?: typeof markTripAsHumanReviewed;
  markReviewAssignmentCompleted?: typeof markReviewerTripAssignmentCompleted;
  reviewerHasAssignment?: typeof reviewerHasTripAssignment;
  notifyReviewComplete?: ReviewCompleteNotifier;
  requireReviewer?: () => Promise<AuthorizedApiContext | Response>;
  requireTraveler?: () => Promise<AuthorizedApiContext | Response>;
};

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

function buildCheckoutReturnUrl(request: Request, tripId: string, review: string, target: "trip" | "reviewer"): string {
  return buildRedirectUrl(request, tripId, review, target).toString();
}

function resolveCheckoutProvider(): CheckoutProvider {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!stripeSecretKey || stripeSecretKey.startsWith("sk_test_fake")) {
    return createFakeCheckoutProvider();
  }

  return createStripeCheckoutProvider({
    secretKey: createServerStripeSecretConfig().secretKey
  });
}

export async function handleTripReviewRequest(
  request: Request,
  tripId: string,
  dependencies: ReviewRouteDependencies = {}
): Promise<Response> {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const target = formData.get("target") === "reviewer" ? "reviewer" : "trip";
  const notesValue = formData.get("notes");
  const notes = typeof notesValue === "string" && notesValue.trim() ? notesValue.trim() : "Review completed from reviewer workspace.";

  if (intent !== "request" && intent !== "complete") {
    return validationError("Review intent must be request or complete.");
  }

  const requireForIntent = intent === "request"
    ? dependencies.requireTraveler ?? (() => requireApiRole(["traveler"]))
    : dependencies.requireReviewer ?? (() => requireApiRole(["reviewer"]));
  const auth = await requireForIntent();

  if (isApiResponse(auth)) {
    return auth;
  }

  if (intent === "complete" && !auth.reviewerId) {
    return forbiddenError("Reviewer profile is not linked to this session.");
  }

  const getTrip = dependencies.getTrip ?? getTripDraftById;
  const checkoutProvider = dependencies.checkoutProvider ?? resolveCheckoutProvider();
  const markHumanReviewed = dependencies.markHumanReviewed ?? markTripAsHumanReviewed;
  const markReviewAssignmentCompleted = dependencies.markReviewAssignmentCompleted ?? markReviewerTripAssignmentCompleted;
  const hasReviewerAssignment = dependencies.reviewerHasAssignment ?? reviewerHasTripAssignment;

  try {
    const existingTrip = await getTrip(tripId, { client: auth.client });

    if (!existingTrip) {
      return Response.redirect(buildRedirectUrl(request, tripId, "not-found", target), 303);
    }

    if (intent === "request") {
      if (existingTrip.ownerUserId && existingTrip.ownerUserId !== auth.userId) {
        return forbiddenError("Trip does not belong to this traveler.");
      }

      if (!existingTrip.isPaid) {
        return Response.redirect(buildRedirectUrl(request, tripId, "locked", target), 303);
      }

      if (existingTrip.hasHumanReview || existingTrip.status === "in_review") {
        const reviewState = existingTrip.status === "in_review" ? "already-queued" : "already-reviewed";

        return Response.redirect(buildRedirectUrl(request, tripId, reviewState, target), 303);
      }

      const checkoutSession = await checkoutProvider.createSession({
        cancelUrl: buildCheckoutReturnUrl(request, tripId, "cancelled", target),
        purchaseKind: "human_review",
        successUrl: buildCheckoutReturnUrl(request, tripId, "checkout-started", target),
        tripId,
        userId: auth.userId
      });

      return Response.redirect(checkoutSession.url, 303);
    }

    if (intent === "complete") {
      if (!auth.reviewerId || !(await hasReviewerAssignment(tripId, auth.reviewerId, { client: auth.client }))) {
        return forbiddenError("Reviewer is not assigned to this trip.");
      }

      if (!existingTrip.isPaid) {
        return Response.redirect(buildRedirectUrl(request, tripId, "locked", target), 303);
      }

      const trip = await markHumanReviewed(tripId, { client: auth.client });

      if (trip?.hasHumanReview) {
        try {
            await markReviewAssignmentCompleted(tripId, auth.reviewerId, notes, { client: auth.client });
        } catch {
          // Keep the existing completion flow working even when assignment persistence is unavailable.
        }

        if (dependencies.notifyReviewComplete) {
          try {
            await dependencies.notifyReviewComplete({ notes, trip });
          } catch {
            // Email delivery failures must never block the reviewer completion flow.
          }
        }
      }

      const reviewState = trip?.hasHumanReview ? "completed" : "error";

      return Response.redirect(buildRedirectUrl(request, tripId, reviewState, target), 303);
    }

    return validationError("Review intent must be request or complete.");
  } catch (error) {
    if (isPersistenceConfigError(error)) {
      return Response.redirect(buildRedirectUrl(request, tripId, "unavailable", target), 303);
    }

    return internalError("Review checkout could not be processed.", 502);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return handleTripReviewRequest(request, tripId);
}
