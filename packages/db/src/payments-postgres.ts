import "server-only";

import { eq, sql } from "drizzle-orm";

import type { PaymentWebhookFulfillmentInput, PaymentWebhookFulfillmentResult } from "./index";
import { loadPostgresAuthorizationContext, withActor, type DatabaseActor } from "./actor";
import { getPostgresTripDraftById } from "./trips-postgres";
import { paymentWebhookEvents, trips } from "./schema";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const directCode = "code" in error ? error.code : undefined;
  const cause = "cause" in error ? error.cause : undefined;
  const causeCode = typeof cause === "object" && cause !== null && "code" in cause ? cause.code : undefined;
  return directCode === "23505" || causeCode === "23505";
}

/**
 * Fulfills Stripe events for UUID-backed PostgreSQL trips. The actor is
 * derived from the verified trip owner metadata and then bound to the same
 * transaction that locks the trip and records the idempotency event.
 */
export async function fulfillPostgresTripPaymentWebhook(
  input: PaymentWebhookFulfillmentInput,
  providedActor?: DatabaseActor
): Promise<PaymentWebhookFulfillmentResult> {
  const tripId = input.tripId.trim();
  const userId = input.userId.trim();
  if (!isUuid(tripId) || !isUuid(userId) || !input.eventId.trim() || !input.stripeSessionId.trim()) {
    return { status: "invalid", trip: null };
  }

  const actor = providedActor ?? (await loadPostgresAuthorizationContext(userId));
  if (!actor || actor.userId !== userId) {
    return { status: "invalid", trip: null };
  }

  const result = await withActor(actor, async ({ db }) => {
    const lockedTrip = await db.execute<{ id: string }>(sql`
      select id
      from app.trips
      where id = ${tripId}::uuid
        and owner_user_id = ${userId}::uuid
      for update
    `);
    if (lockedTrip.rows.length === 0) {
      return { status: "invalid" as const };
    }

    const [existingEvent] = await db
      .select({ eventId: paymentWebhookEvents.eventId })
      .from(paymentWebhookEvents)
      .where(eq(paymentWebhookEvents.eventId, input.eventId))
      .limit(1);
    if (existingEvent) {
      return { status: "duplicate" as const };
    }

    try {
      await db.insert(paymentWebhookEvents).values({
        eventId: input.eventId,
        purchaseKind: input.purchaseKind,
        stripeSessionId: input.stripeSessionId,
        tripId,
        userId,
        payload: {}
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return { status: "duplicate" as const };
      }
      throw error;
    }

    await db
      .update(trips)
      .set({
        isPaid: true,
        status: input.purchaseKind === "human_review" ? "in_review" : "paid"
      })
      .where(eq(trips.id, tripId));

    return { status: "fulfilled" as const };
  });

  if (result.status === "invalid") {
    return { status: "invalid", trip: null };
  }

  return {
    status: result.status,
    trip: await getPostgresTripDraftById(tripId, actor)
  };
}
