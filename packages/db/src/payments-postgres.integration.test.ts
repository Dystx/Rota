import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TripBrief } from "@repo/types";

const traveler = "00000000-0000-4000-8000-000000000015";

const brief: TripBrief = {
  accommodationLocation: "Porto center",
  avoidances: ["rushed-schedules"],
  budgetLevel: "mid-range",
  destinationCountry: "portugal",
  endDate: "",
  foodPreferences: ["casual-local-meals"],
  interests: ["old-streets", "local-food"],
  pace: "calm",
  rawBrief: "A calm Portugal trip with old streets, local food, and enough time to explore without rushing.",
  regions: ["porto"],
  startDate: "",
  transportMode: "train-and-transfers",
  travelerType: "couple",
  travelersCount: 2,
  tripLengthDays: 4
};

describe("PostgreSQL payment fulfillment", () => {
  let ownerPool: import("pg").Pool;
  let actor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let tripId: string;
  let fulfillPostgresTripPaymentWebhook: typeof import("./payments-postgres").fulfillPostgresTripPaymentWebhook;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    await ownerPool.query("delete from app.payment_webhook_events where user_id = $1", [traveler]);
    await ownerPool.query("delete from app.audit_events where actor_user_id = $1", [traveler]);
    await ownerPool.query("delete from authn.user where id = $1", [traveler]);
    await ownerPool.query(
      "insert into authn.user (id, name, email, email_verified) values ($1, 'Payment Traveler', 'payment-traveler@example.test', true)",
      [traveler]
    );
    await ownerPool.query("insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'traveler', 'Payment Traveler')", [traveler]);

    const { loadPostgresAuthorizationContext } = await import("./actor");
    const { createPostgresTripDraft } = await import("./trips-postgres");
    actor = await loadPostgresAuthorizationContext(traveler);
    const created = await createPostgresTripDraft(brief, actor!);
    tripId = created.tripId;
    ({ fulfillPostgresTripPaymentWebhook } = await import("./payments-postgres"));
  }, 30000);

  afterAll(async () => {
    await ownerPool.query("delete from app.payment_webhook_events where user_id = $1", [traveler]);
    await ownerPool.query("delete from app.audit_events where actor_user_id = $1", [traveler]);
    await ownerPool.query("delete from authn.user where id = $1", [traveler]);
    await ownerPool.end();
  }, 30000);

  it("fulfills once, ignores duplicate events, and queues human review", async () => {
    const baseInput = {
      eventId: "evt_postgres_unlock_1",
      purchaseKind: "unlock" as const,
      stripeSessionId: "cs_postgres_unlock_1",
      tripId,
      userId: traveler
    };

    await expect(fulfillPostgresTripPaymentWebhook(baseInput)).resolves.toMatchObject({ status: "fulfilled" });
    await expect(fulfillPostgresTripPaymentWebhook(baseInput)).resolves.toMatchObject({ status: "duplicate" });
    await expect(
      fulfillPostgresTripPaymentWebhook({ ...baseInput, eventId: "evt_postgres_review_1", stripeSessionId: "cs_postgres_review_1", purchaseKind: "human_review" })
    ).resolves.toMatchObject({ status: "fulfilled" });

    const trip = await fulfillPostgresTripPaymentWebhook({ ...baseInput, eventId: "evt_postgres_review_2", stripeSessionId: "cs_postgres_review_2", purchaseKind: "human_review" });
    expect(trip.trip).toMatchObject({ id: tripId, isPaid: true, status: "in_review" });
  }, 30000);

  it("rejects webhook metadata for another owner", async () => {
    await expect(
      fulfillPostgresTripPaymentWebhook({
        eventId: "evt_postgres_forged_owner",
        purchaseKind: "unlock",
        stripeSessionId: "cs_postgres_forged_owner",
        tripId,
        userId: "00000000-0000-4000-8000-000000000016"
      })
    ).resolves.toMatchObject({ status: "invalid", trip: null });
  });
});
