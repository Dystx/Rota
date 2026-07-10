export * from "./catalogue";

export type CheckoutTier = "free-preview" | "paid-trip" | "human-polish";

export type CheckoutPurchaseKind = "unlock" | "human_review";

export type CheckoutPlan = {
  ctaLabel: string;
  deliverables: string[];
  fulfillment: string;
  priceLabel: string;
  tier: CheckoutTier;
  unitAmountCents: number;
};

export type CheckoutSessionMetadata = {
  purchase_kind: CheckoutPurchaseKind;
  trip_id: string;
  user_id: string;
};

export type StripeWebhookVerificationFailure =
  | "invalid_payload"
  | "invalid_signature"
  | "missing_signature"
  | "timestamp_outside_tolerance";

export type StripeWebhookEvent = {
  data: {
    object: unknown;
  };
  id: string;
  type: string;
};

export type StripeCheckoutSessionCompleted = {
  id: string;
  metadata: CheckoutSessionMetadata;
};

export type StripeWebhookVerificationResult =
  | {
      event: StripeWebhookEvent;
      ok: true;
    }
  | {
      ok: false;
      reason: StripeWebhookVerificationFailure;
    };

export type StripeWebhookVerificationInput = {
  now?: Date;
  payload: string;
  secret: string;
  signatureHeader: string | null;
  toleranceSeconds?: number;
};

export type CheckoutSessionInput = {
  cancelUrl: string;
  purchaseKind: CheckoutPurchaseKind;
  successUrl: string;
  tripId: string;
  userId: string;
};

export type CheckoutSession = {
  id: string;
  metadata: CheckoutSessionMetadata;
  mode: "fake" | "stripe";
  url: string;
};

export type CheckoutProvider = {
  createSession(input: CheckoutSessionInput): Promise<CheckoutSession>;
};

type StripeCheckoutProviderOptions = {
  fetch?: typeof fetch;
  secretKey: string;
};

const stripeSignatureToleranceSeconds = 300;

const plans: Record<CheckoutTier, CheckoutPlan> = {
  "free-preview": {
    ctaLabel: "Start free preview",
    deliverables: ["Basic route preview", "Watermarked itinerary", "No full export"],
    fulfillment: "No checkout required. User stays inside the free planning flow.",
    priceLabel: "€0",
    tier: "free-preview",
    unitAmountCents: 0
  },
  "human-polish": {
    ctaLabel: "Add human review",
    deliverables: ["Local expert review", "Pacing and food upgrades", "Reviewer notes"],
    fulfillment: "Create a checkout session after unlock; webhook fulfillment will enqueue reviewer work.",
    priceLabel: "€49",
    tier: "human-polish",
    unitAmountCents: 4900
  },
  "paid-trip": {
    ctaLabel: "Unlock a trip",
    deliverables: ["Full itinerary", "Full route map", "PDF + calendar export"],
    fulfillment: "Create a checkout session; webhook fulfillment will unlock export access.",
    priceLabel: "€19",
    tier: "paid-trip",
    unitAmountCents: 1900
  }
};

const purchaseKindToTier = {
  human_review: "human-polish",
  unlock: "paid-trip"
} satisfies Record<CheckoutPurchaseKind, CheckoutTier>;

export function getCheckoutPlan(tier: CheckoutTier): CheckoutPlan {
  return plans[tier];
}

export function getCheckoutPlanForPurchase(purchaseKind: CheckoutPurchaseKind): CheckoutPlan {
  return getCheckoutPlan(purchaseKindToTier[purchaseKind]);
}

export function listCheckoutPlans(): CheckoutPlan[] {
  return [plans["free-preview"], plans["paid-trip"], plans["human-polish"]];
}

function buildMetadata(input: CheckoutSessionInput): CheckoutSessionMetadata {
  return {
    purchase_kind: input.purchaseKind,
    trip_id: input.tripId,
    user_id: input.userId
  };
}

function toDeterministicSlug(input: CheckoutSessionInput): string {
  return `${input.purchaseKind}-${input.tripId}-${input.userId}`.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
}

export function createFakeCheckoutProvider(): CheckoutProvider {
  return {
    async createSession(input) {
      const slug = toDeterministicSlug(input);

      return {
        id: `cs_test_${slug}`,
        metadata: buildMetadata(input),
        mode: "fake",
        url: `https://checkout.stripe.com/c/test_${slug}`
      };
    }
  };
}

function appendStripeCheckoutParams(params: URLSearchParams, input: CheckoutSessionInput): void {
  const plan = getCheckoutPlanForPurchase(input.purchaseKind);
  const metadata = buildMetadata(input);

  params.set("mode", "payment");
  params.set("success_url", input.successUrl);
  params.set("cancel_url", input.cancelUrl);
  params.set("client_reference_id", `${metadata.purchase_kind}:${metadata.trip_id}:${metadata.user_id}`);
  params.set("metadata[purchase_kind]", metadata.purchase_kind);
  params.set("metadata[trip_id]", metadata.trip_id);
  params.set("metadata[user_id]", metadata.user_id);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "eur");
  params.set("line_items[0][price_data][unit_amount]", String(plan.unitAmountCents));
  params.set("line_items[0][price_data][product_data][name]", plan.ctaLabel);
}

function readStripeCheckoutResponse(value: unknown): { id: string; url: string } | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as { id?: unknown; url?: unknown };

  if (typeof candidate.id !== "string" || typeof candidate.url !== "string") {
    return null;
  }

  return {
    id: candidate.id,
    url: candidate.url
  };
}

function isCheckoutPurchaseKind(value: unknown): value is CheckoutPurchaseKind {
  return value === "unlock" || value === "human_review";
}

function readStringRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readStripeWebhookEvent(value: unknown): StripeWebhookEvent | null {
  const candidate = readStringRecord(value);
  const data = readStringRecord(candidate?.data);

  if (!candidate || !data || typeof candidate.id !== "string" || typeof candidate.type !== "string") {
    return null;
  }

  return {
    data: {
      object: data.object
    },
    id: candidate.id,
    type: candidate.type
  };
}

function parseStripeSignatureHeader(signatureHeader: string): { signatures: string[]; timestamp: number | null } {
  const parts = signatureHeader.split(",").map((part) => part.trim());
  const signatures: string[] = [];
  let timestamp: number | null = null;

  for (const part of parts) {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = part.slice(0, separatorIndex);
    const value = part.slice(separatorIndex + 1);

    if (key === "t") {
      const parsedTimestamp = Number(value);
      timestamp = Number.isInteger(parsedTimestamp) ? parsedTimestamp : null;
    }

    if (key === "v1" && value) {
      signatures.push(value);
    }
  }

  return { signatures, timestamp };
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;

  for (let index = 0; index < maxLength; index += 1) {
    const leftCode = left.charCodeAt(index) || 0;
    const rightCode = right.charCodeAt(index) || 0;
    mismatch |= leftCode ^ rightCode;
  }

  return mismatch === 0;
}

async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey("raw", encoder.encode(secret), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return toHex(signature);
}

export async function signStripeWebhookPayload(payload: string, secret: string, timestamp: number): Promise<string> {
  const signature = await hmacSha256Hex(secret, `${timestamp}.${payload}`);

  return `t=${timestamp},v1=${signature}`;
}

export async function verifyStripeWebhookEvent({
  now = new Date(),
  payload,
  secret,
  signatureHeader,
  toleranceSeconds = stripeSignatureToleranceSeconds
}: StripeWebhookVerificationInput): Promise<StripeWebhookVerificationResult> {
  if (!signatureHeader) {
    return { ok: false, reason: "missing_signature" };
  }

  const { signatures, timestamp } = parseStripeSignatureHeader(signatureHeader);

  if (timestamp === null || signatures.length === 0) {
    return { ok: false, reason: "invalid_signature" };
  }

  const currentTimestamp = Math.floor(now.getTime() / 1000);

  if (Math.abs(currentTimestamp - timestamp) > toleranceSeconds) {
    return { ok: false, reason: "timestamp_outside_tolerance" };
  }

  const expectedSignature = await hmacSha256Hex(secret, `${timestamp}.${payload}`);
  const signatureMatches = signatures.some((signature) => constantTimeEqual(signature, expectedSignature));

  if (!signatureMatches) {
    return { ok: false, reason: "invalid_signature" };
  }

  try {
    const event = readStripeWebhookEvent(JSON.parse(payload));

    if (!event) {
      return { ok: false, reason: "invalid_payload" };
    }

    return { event, ok: true };
  } catch {
    return { ok: false, reason: "invalid_payload" };
  }
}

export function readCheckoutSessionCompletedEvent(event: StripeWebhookEvent): StripeCheckoutSessionCompleted | null {
  if (event.type !== "checkout.session.completed") {
    return null;
  }

  const session = readStringRecord(event.data.object);
  const metadata = readStringRecord(session?.metadata);

  if (!session || !metadata || typeof session.id !== "string") {
    return null;
  }

  const purchaseKind = metadata.purchase_kind;
  const tripId = metadata.trip_id;
  const userId = metadata.user_id;

  if (!isCheckoutPurchaseKind(purchaseKind) || typeof tripId !== "string" || typeof userId !== "string") {
    return null;
  }

  return {
    id: session.id,
    metadata: {
      purchase_kind: purchaseKind,
      trip_id: tripId,
      user_id: userId
    }
  };
}

export function createStripeCheckoutProvider({ fetch: fetchImpl = fetch, secretKey }: StripeCheckoutProviderOptions): CheckoutProvider {
  return {
    async createSession(input) {
      const params = new URLSearchParams();
      appendStripeCheckoutParams(params, input);

      const response = await fetchImpl("https://api.stripe.com/v1/checkout/sessions", {
        body: params,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
      });

      const payload: unknown = await response.json();
      const session = readStripeCheckoutResponse(payload);

      if (!response.ok || !session) {
        throw new Error("Stripe checkout session creation failed.");
      }

      return {
        ...session,
        metadata: buildMetadata(input),
        mode: "stripe"
      };
    }
  };
}
