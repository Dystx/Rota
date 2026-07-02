import { ConfigValidationError } from "@repo/config";
import { createServerStripeWebhookSecretConfig } from "@repo/config/server";
import { fulfillTripPaymentWebhook, isPersistenceConfigError, type PaymentWebhookFulfillmentInput } from "@repo/db";
import { readCheckoutSessionCompletedEvent, verifyStripeWebhookEvent, type StripeWebhookVerificationResult } from "@repo/payments";
import { internalError, validationError } from "@/lib/auth/api";

type StripeWebhookDependencies = {
  fulfillPayment?: typeof fulfillTripPaymentWebhook;
  now?: Date;
  verifyWebhook?: typeof verifyStripeWebhookEvent;
  webhookSecret?: string;
};

function toVerificationStatus(result: StripeWebhookVerificationResult): Response {
  const status = result.ok || result.reason === "missing_signature" || result.reason === "invalid_payload" ? 400 : 401;

  return Response.json(
    {
      error: {
        code: "invalid_webhook",
        message: "Stripe webhook signature could not be verified."
      }
    },
    { status }
  );
}

function isWebhookConfigError(error: unknown): boolean {
  return isPersistenceConfigError(error) || error instanceof ConfigValidationError;
}

function resolveWebhookSecret(dependencies: StripeWebhookDependencies): string {
  return dependencies.webhookSecret ?? createServerStripeWebhookSecretConfig().webhookSecret;
}

export async function handleStripeWebhookRequest(request: Request, dependencies: StripeWebhookDependencies = {}): Promise<Response> {
  const signatureHeader = request.headers.get("stripe-signature");
  const verifyWebhook = dependencies.verifyWebhook ?? verifyStripeWebhookEvent;
  const fulfillPayment = dependencies.fulfillPayment ?? fulfillTripPaymentWebhook;
  const rawPayload = await request.text();

  let webhookSecret: string;

  try {
    webhookSecret = resolveWebhookSecret(dependencies);
  } catch (error) {
    if (isWebhookConfigError(error)) {
      return internalError("Stripe webhook secret is not configured.", 503);
    }

    return internalError("Stripe webhook could not be configured.");
  }

  const verification = await verifyWebhook({
    now: dependencies.now,
    payload: rawPayload,
    secret: webhookSecret,
    signatureHeader
  });

  if (!verification.ok) {
    return toVerificationStatus(verification);
  }

  const checkoutSession = readCheckoutSessionCompletedEvent(verification.event);

  if (!checkoutSession) {
    return Response.json({ ignored: true, status: "ignored" });
  }

  const fulfillmentInput: PaymentWebhookFulfillmentInput = {
    eventId: verification.event.id,
    purchaseKind: checkoutSession.metadata.purchase_kind,
    stripeSessionId: checkoutSession.id,
    tripId: checkoutSession.metadata.trip_id,
    userId: checkoutSession.metadata.user_id
  };

  try {
    const result = await fulfillPayment(fulfillmentInput);

    if (result.status === "invalid") {
      return validationError("Stripe webhook metadata did not match an existing trip.");
    }

    return Response.json({
      eventId: verification.event.id,
      purchaseKind: fulfillmentInput.purchaseKind,
      status: result.status,
      tripId: fulfillmentInput.tripId
    });
  } catch (error) {
    if (isPersistenceConfigError(error)) {
      return internalError("Persistence is not configured.", 503);
    }

    return internalError("Stripe webhook could not be fulfilled.", 502);
  }
}

export async function POST(request: Request) {
  return handleStripeWebhookRequest(request);
}
