import { describe, expect, test } from "vitest";
import {
  createFakeCheckoutProvider,
  createStripeCheckoutProvider,
  getCheckoutPlanForPurchase,
  readCheckoutSessionCompletedEvent,
  signStripeWebhookPayload,
  verifyStripeWebhookEvent
} from "./index";

describe("checkout providers", () => {
  test("creates deterministic fake checkout sessions with ownership metadata", async () => {
    const provider = createFakeCheckoutProvider();

    const session = await provider.createSession({
      cancelUrl: "http://localhost/trip/42?unlock=cancelled",
      purchaseKind: "unlock",
      successUrl: "http://localhost/trip/42?unlock=checkout-started",
      tripId: "42",
      userId: "traveler-user-123"
    });

    expect(session).toEqual({
      id: "cs_test_unlock-42-traveler-user-123",
      metadata: {
        purchase_kind: "unlock",
        trip_id: "42",
        user_id: "traveler-user-123"
      },
      mode: "fake",
      url: "https://checkout.stripe.com/c/test_unlock-42-traveler-user-123"
    });
  });

  test("keeps Stripe secrets in request headers, never returned sessions", async () => {
    const secretKey = "unit-test-secret-should-not-leak";
    let authorizationHeader = "";
    let requestBody = "";
    const provider = createStripeCheckoutProvider({
      fetch: async (_url, init) => {
        authorizationHeader = new Headers(init?.headers).get("Authorization") ?? "";
        requestBody = String(init?.body);

        return Response.json({
          id: "cs_test_from_stripe",
          url: "https://checkout.stripe.com/c/test_from_stripe"
        });
      },
      secretKey
    });

    const session = await provider.createSession({
      cancelUrl: "http://localhost/trip/42?review=cancelled",
      purchaseKind: "human_review",
      successUrl: "http://localhost/trip/42?review=checkout-started",
      tripId: "42",
      userId: "traveler-user-123"
    });

    expect(authorizationHeader).toBe(`Bearer ${secretKey}`);
    expect(requestBody).toContain("metadata%5Bpurchase_kind%5D=human_review");
    expect(JSON.stringify(session)).not.toContain(secretKey);
    expect(session.metadata).toEqual({
      purchase_kind: "human_review",
      trip_id: "42",
      user_id: "traveler-user-123"
    });
  });
});

describe("checkout plans", () => {
  test("maps purchase kinds to deterministic amounts", () => {
    expect(getCheckoutPlanForPurchase("unlock").unitAmountCents).toBe(1900);
    expect(getCheckoutPlanForPurchase("human_review").unitAmountCents).toBe(4900);
  });
});

describe("Stripe webhook verification", () => {
  const secret = "whsec_unit_test_secret";
  const now = new Date("2026-05-02T00:00:00.000Z");
  const timestamp = Math.floor(now.getTime() / 1000);

  function payload(): string {
    return JSON.stringify({
      data: {
        object: {
          id: "cs_test_webhook",
          metadata: {
            purchase_kind: "unlock",
            trip_id: "42",
            user_id: "traveler-user-123"
          }
        }
      },
      id: "evt_test_webhook",
      type: "checkout.session.completed"
    });
  }

  test("verifies signed raw payloads and reads checkout metadata", async () => {
    const rawPayload = payload();
    const signature = await signStripeWebhookPayload(rawPayload, secret, timestamp);
    const result = await verifyStripeWebhookEvent({ now, payload: rawPayload, secret, signatureHeader: signature });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected valid webhook signature.");
    }

    expect(readCheckoutSessionCompletedEvent(result.event)).toEqual({
      id: "cs_test_webhook",
      metadata: {
        purchase_kind: "unlock",
        trip_id: "42",
        user_id: "traveler-user-123"
      }
    });
  });

  test("rejects signatures generated for a different payload", async () => {
    const rawPayload = payload();
    const signature = await signStripeWebhookPayload(rawPayload.replace("42", "43"), secret, timestamp);
    const result = await verifyStripeWebhookEvent({ now, payload: rawPayload, secret, signatureHeader: signature });

    expect(result).toEqual({ ok: false, reason: "invalid_signature" });
  });

  test("rejects stale webhook timestamps", async () => {
    const rawPayload = payload();
    const signature = await signStripeWebhookPayload(rawPayload, secret, timestamp - 301);
    const result = await verifyStripeWebhookEvent({ now, payload: rawPayload, secret, signatureHeader: signature });

    expect(result).toEqual({ ok: false, reason: "timestamp_outside_tolerance" });
  });
});
