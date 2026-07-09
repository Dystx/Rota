import { createFakeCheckoutProvider, createStripeCheckoutProvider, type CheckoutProvider } from "@repo/payments";
import { getTripDraftById, isPersistenceConfigError } from "@repo/db";
import { createServerStripeSecretConfig } from "@repo/config/server";
import { forbiddenError, internalError, isApiResponse, requireApiRole, type AuthorizedApiContext } from "@/lib/auth/api";

type UnlockCheckoutDependencies = {
  checkoutProvider?: CheckoutProvider;
  getTrip?: typeof getTripDraftById;
  requireTraveler?: () => Promise<AuthorizedApiContext | Response>;
};

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

function buildCheckoutReturnUrl(request: Request, tripId: string, unlock: string): string {
  return buildRedirectUrl(request, tripId, unlock).toString();
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

export async function handleUnlockCheckoutRequest(
  request: Request,
  tripId: string,
  dependencies: UnlockCheckoutDependencies = {}
): Promise<Response> {
  const requireTraveler = dependencies.requireTraveler ?? (() => requireApiRole(["traveler"]));
  const getTrip = dependencies.getTrip ?? getTripDraftById;
  const checkoutProvider = dependencies.checkoutProvider ?? resolveCheckoutProvider();
  const auth = await requireTraveler();

  if (isApiResponse(auth)) {
    return auth;
  }

  let selectedPackage = "core";
  try {
    const body = await request.clone().formData();
    const value = body.get("package");
    if (value !== null) {
      if (value !== "core" && value !== "specialist") return new Response("Invalid package.", { status: 400 });
      selectedPackage = value;
    }
  } catch {
    // Stripe-hosted checkout may submit without a form body.
  }

  try {
    const trip = await getTrip(tripId, { client: auth.client });

    if (!trip) {
      return Response.redirect(buildRedirectUrl(request, tripId, "not-found"), 303);
    }

    if (trip.ownerUserId && trip.ownerUserId !== auth.userId) {
      return forbiddenError("Trip does not belong to this traveler.");
    }

    if (trip.isPaid) {
      return Response.redirect(buildRedirectUrl(request, tripId, "already-unlocked"), 303);
    }

    const checkoutSession = await checkoutProvider.createSession({
      cancelUrl: buildCheckoutReturnUrl(request, tripId, "cancelled"),
      purchaseKind: selectedPackage === "specialist" ? "human_review" : "unlock",
      successUrl: buildCheckoutReturnUrl(request, tripId, "checkout-started"),
      tripId,
      userId: auth.userId
    });

    return Response.redirect(checkoutSession.url, 303);
  } catch (error) {
    if (isPersistenceConfigError(error)) {
      return Response.redirect(buildRedirectUrl(request, tripId, "unavailable"), 303);
    }

    return internalError("Checkout session could not be created.", 502);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return handleUnlockCheckoutRequest(request, tripId);
}
