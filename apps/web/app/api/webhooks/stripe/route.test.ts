import { describe, expect, test } from "vitest";
import { signStripeWebhookPayload } from "@repo/payments";
import type { PaymentWebhookFulfillmentInput, PaymentWebhookFulfillmentResult } from "@repo/db";
import { handleStripeWebhookRequest } from "./route";

const secret = "whsec_unit_test_secret";
const now = new Date("2026-05-02T00:00:00.000Z");
const timestamp = Math.floor(now.getTime() / 1000);

function payload(eventId: string, purchaseKind: "human_review" | "unlock" = "unlock"): string {
  return JSON.stringify({
    data: {
      object: {
        id: `cs_test_${purchaseKind}_42`,
        metadata: {
          purchase_kind: purchaseKind,
          trip_id: "42",
          user_id: "traveler-user-123"
        }
      }
    },
    id: eventId,
    type: "checkout.session.completed"
  });
}

async function request(rawPayload: string, signatureHeader?: string): Promise<Request> {
  const headers = new Headers({ "content-type": "application/json" });

  if (signatureHeader) {
    headers.set("stripe-signature", signatureHeader);
  }

  return new Request("http://localhost/api/webhooks/stripe", {
    body: rawPayload,
    headers,
    method: "POST"
  });
}

async function signedRequest(rawPayload: string): Promise<Request> {
  return request(rawPayload, await signStripeWebhookPayload(rawPayload, secret, timestamp));
}

function fulfilled(status: PaymentWebhookFulfillmentResult["status"] = "fulfilled"): PaymentWebhookFulfillmentResult {
  return {
    status
  };
}

describe("handleStripeWebhookRequest", () => {
  test("returns service unavailable when webhook secret config is missing before verification or fulfillment", async () => {
    const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let verifyCalled = false;
    let fulfillCalled = false;

    delete process.env.STRIPE_WEBHOOK_SECRET;

    try {
      const response = await handleStripeWebhookRequest(await request(payload("evt_test_missing_config"), "t=1767312000,v1=bad"), {
        fulfillPayment: async () => {
          fulfillCalled = true;
          return fulfilled();
        },
        verifyWebhook: async () => {
          verifyCalled = true;
          return { ok: false, reason: "invalid_signature" };
        }
      });

      expect(response.status).toBe(503);
      expect(verifyCalled).toBe(false);
      expect(fulfillCalled).toBe(false);
      await expect(response.json()).resolves.toEqual({
        error: {
          code: "internal_error",
          message: "Stripe webhook secret is not configured."
        }
      });
    } finally {
      if (originalWebhookSecret === undefined) {
        delete process.env.STRIPE_WEBHOOK_SECRET;
      } else {
        process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
      }
    }
  });

  test("rejects invalid signatures before calling fulfillment", async () => {
    let fulfillCalled = false;
    const response = await handleStripeWebhookRequest(await request(payload("evt_test_invalid"), "t=1767312000,v1=bad"), {
      fulfillPayment: async () => {
        fulfillCalled = true;
        return fulfilled();
      },
      now,
      webhookSecret: secret
    });

    expect(response.status).toBe(401);
    expect(fulfillCalled).toBe(false);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "invalid_webhook",
        message: "Stripe webhook signature could not be verified."
      }
    });
  });

  test("rejects missing signatures before calling fulfillment", async () => {
    let fulfillCalled = false;
    const response = await handleStripeWebhookRequest(await request(payload("evt_test_missing_sig")), {
      fulfillPayment: async () => {
        fulfillCalled = true;
        return fulfilled();
      },
      now,
      webhookSecret: secret
    });

    expect(response.status).toBe(400);
    expect(fulfillCalled).toBe(false);
  });

  test("rejects signed malformed payloads as bad requests before calling fulfillment", async () => {
    let fulfillCalled = false;
    const malformedPayload = "{not-json";
    const response = await handleStripeWebhookRequest(await signedRequest(malformedPayload), {
      fulfillPayment: async () => {
        fulfillCalled = true;
        return fulfilled();
      },
      now,
      webhookSecret: secret
    });

    expect(response.status).toBe(400);
    expect(fulfillCalled).toBe(false);
  });

  test("fulfills a valid unlock checkout event exactly through the webhook path", async () => {
    const calls: PaymentWebhookFulfillmentInput[] = [];
    const response = await handleStripeWebhookRequest(await signedRequest(payload("evt_test_unlock_42")), {
      fulfillPayment: async (input) => {
        calls.push(input);
        return fulfilled();
      },
      now,
      webhookSecret: secret
    });

    expect(response.status).toBe(200);
    expect(calls).toEqual([
      {
        eventId: "evt_test_unlock_42",
        purchaseKind: "unlock",
        stripeSessionId: "cs_test_unlock_42",
        tripId: "42",
        userId: "traveler-user-123"
      }
    ]);
    await expect(response.json()).resolves.toEqual({
      eventId: "evt_test_unlock_42",
      purchaseKind: "unlock",
      status: "fulfilled",
      tripId: "42"
    });
  });

  test("returns safe success for duplicate valid webhook events", async () => {
    const response = await handleStripeWebhookRequest(await signedRequest(payload("evt_test_duplicate_42")), {
      fulfillPayment: async () => fulfilled("duplicate"),
      now,
      webhookSecret: secret
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      eventId: "evt_test_duplicate_42",
      status: "duplicate",
      tripId: "42"
    });
  });

  test("routes verified human review purchases to review fulfillment", async () => {
    const calls: PaymentWebhookFulfillmentInput[] = [];
    const response = await handleStripeWebhookRequest(await signedRequest(payload("evt_test_review_42", "human_review")), {
      fulfillPayment: async (input) => {
        calls.push(input);
        return fulfilled();
      },
      now,
      webhookSecret: secret
    });

    expect(response.status).toBe(200);
    expect(calls[0]).toMatchObject({
      eventId: "evt_test_review_42",
      purchaseKind: "human_review",
      tripId: "42",
      userId: "traveler-user-123"
    });
  });
});
