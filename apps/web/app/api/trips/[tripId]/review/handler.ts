import { createFakeCheckoutProvider, createStripeCheckoutProvider, type CheckoutProvider } from "@repo/payments";
import { getTripDraftById, isPersistenceConfigError, markReviewerTripAssignmentCompleted, markTripAsHumanReviewed, reviewerHasTripAssignment, type TripDraftDetail } from "@repo/db";
import { createServerStripeSecretConfig } from "@repo/config/server";
import { forbiddenError, internalError, isApiResponse, requireApiRole, validationError, type AuthorizedApiContext } from "@/lib/auth/api";

export type ReviewCompleteNotifier = (input: { notes: string; trip: TripDraftDetail }) => Promise<void> | void;

export type ReviewRouteDependencies = {
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
  if (!referer) { fallbackUrl.searchParams.set("review", review); return fallbackUrl; }
  try {
    const refererUrl = new URL(referer);
    if (refererUrl.origin === currentUrl.origin) { refererUrl.searchParams.set("review", review); return refererUrl; }
  } catch {
    fallbackUrl.searchParams.set("review", review);
    return fallbackUrl;
  }
  fallbackUrl.searchParams.set("review", review);
  return fallbackUrl;
}

function resolveCheckoutProvider(): CheckoutProvider {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey || stripeSecretKey.startsWith("sk_test_fake")) return createFakeCheckoutProvider();
  return createStripeCheckoutProvider({ secretKey: createServerStripeSecretConfig().secretKey });
}

export async function handleTripReviewRequest(request: Request, tripId: string, dependencies: ReviewRouteDependencies = {}): Promise<Response> {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const target = formData.get("target") === "reviewer" ? "reviewer" : "trip";
  const notesValue = formData.get("notes");
  const notes = typeof notesValue === "string" && notesValue.trim() ? notesValue.trim() : "Review completed from reviewer workspace.";
  if (intent !== "request" && intent !== "complete") return validationError("Review intent must be request or complete.");

  const requireForIntent = intent === "request" ? dependencies.requireTraveler ?? (() => requireApiRole(["traveler"])) : dependencies.requireReviewer ?? (() => requireApiRole(["reviewer"]));
  const auth = await requireForIntent();
  if (isApiResponse(auth)) return auth;
  if (intent === "complete" && !auth.reviewerId) return forbiddenError("Reviewer profile is not linked to this session.");

  const getTrip = dependencies.getTrip ?? getTripDraftById;
  const checkoutProvider = dependencies.checkoutProvider ?? resolveCheckoutProvider();
  const markHumanReviewed = dependencies.markHumanReviewed ?? markTripAsHumanReviewed;
  const markReviewAssignmentCompleted = dependencies.markReviewAssignmentCompleted ?? markReviewerTripAssignmentCompleted;
  const hasReviewerAssignment = dependencies.reviewerHasAssignment ?? reviewerHasTripAssignment;
  const redirect = (review: string) => Response.redirect(buildRedirectUrl(request, tripId, review, target), 303);

  try {
    const existingTrip = await getTrip(tripId, { actor: auth.actor });
    if (!existingTrip) return redirect("not-found");
    if (intent === "request") {
      if (existingTrip.ownerUserId && existingTrip.ownerUserId !== auth.userId) return forbiddenError("Trip does not belong to this traveler.");
      if (!existingTrip.isPaid) return redirect("locked");
      if (existingTrip.hasHumanReview || existingTrip.status === "in_review") return redirect(existingTrip.status === "in_review" ? "already-queued" : "already-reviewed");
      const checkoutSession = await checkoutProvider.createSession({ cancelUrl: buildRedirectUrl(request, tripId, "cancelled", target).toString(), purchaseKind: "human_review", successUrl: buildRedirectUrl(request, tripId, "checkout-started", target).toString(), tripId, userId: auth.userId });
      return Response.redirect(checkoutSession.url, 303);
    }
    if (!auth.reviewerId || !(await hasReviewerAssignment(tripId, auth.reviewerId, { actor: auth.actor }))) return forbiddenError("Reviewer is not assigned to this trip.");
    if (!existingTrip.isPaid) return redirect("locked");
    const trip = await markHumanReviewed(tripId, { actor: auth.actor });
    if (trip?.hasHumanReview) {
      try { await markReviewAssignmentCompleted(tripId, auth.reviewerId, notes, { actor: auth.actor }); } catch { /* completion remains valid when audit persistence is unavailable */ }
      if (dependencies.notifyReviewComplete) {
        try { await dependencies.notifyReviewComplete({ notes, trip }); } catch { /* notification failure must not block completion */ }
      }
    }
    return redirect(trip?.hasHumanReview ? "completed" : "error");
  } catch (error) {
    if (isPersistenceConfigError(error)) return redirect("unavailable");
    return internalError("Review checkout could not be processed.", 502);
  }
}
