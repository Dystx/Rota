import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import type { TripBrief } from "@repo/types";

const travelerA = "00000000-0000-4000-8000-000000000004";
const travelerB = "00000000-0000-4000-8000-000000000005";

const brief: TripBrief = {
  accommodationLocation: "Porto historic center",
  avoidances: ["rushed-schedules"],
  budgetLevel: "mid-range",
  destinationCountry: "portugal",
  endDate: "",
  foodPreferences: ["casual-local-meals"],
  interests: ["local-food", "old-streets"],
  pace: "calm",
  rawBrief: "A calm Portugal trip with local food, old streets, and enough buffer time.",
  regions: ["porto"],
  startDate: "",
  transportMode: "train-and-transfers",
  travelerType: "couple",
  travelersCount: 2,
  tripLengthDays: 5
};

describe("PostgreSQL trip draft repository", () => {
  let ownerPool: import("pg").Pool;
  let createPostgresTripDraft: typeof import("./trips-postgres").createPostgresTripDraft;
  let loadPostgresAuthorizationContext: typeof import("./actor").loadPostgresAuthorizationContext;
  let withActor: typeof import("./actor").withActor;
  let getTripsForUser: typeof import("./index").getTripsForUser;
  let getTripDraftByIdForOwner: typeof import("./index").getTripDraftByIdForOwner;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[travelerA, travelerB]]);
    await ownerPool.query(
      "insert into authn.user (id, name, email, email_verified) values ($1, 'Traveler A', 'trip-a@example.test', true), ($2, 'Traveler B', 'trip-b@example.test', true)",
      [travelerA, travelerB]
    );
    await ownerPool.query("insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'traveler', 'Traveler A'), ($2, 'traveler', 'Traveler B')", [
      travelerA,
      travelerB
    ]);
    ({ createPostgresTripDraft } = await import("./trips-postgres"));
    ({ loadPostgresAuthorizationContext, withActor } = await import("./actor"));
    ({ getTripsForUser, getTripDraftByIdForOwner } = await import("./index"));
  }, 30000);

  afterAll(async () => {
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[travelerA, travelerB]]);
    await ownerPool.end();
  }, 30000);

  it("creates an owned draft and hides it from a different actor", async () => {
    const actorA = await loadPostgresAuthorizationContext(travelerA);
    const actorB = await loadPostgresAuthorizationContext(travelerB);
    expect(actorA).not.toBeNull();
    expect(actorB).not.toBeNull();

    const result = await createPostgresTripDraft(brief, actorA!);
    expect(result.tripId).toMatch(/^[0-9a-f-]{36}$/);
    await expect(getTripsForUser(travelerA, 5, { actor: actorA! })).resolves.toHaveLength(1);
    await expect(getTripDraftByIdForOwner(result.tripId, travelerA, { actor: actorA! })).resolves.toMatchObject({ id: result.tripId });
    await expect(getTripDraftByIdForOwner(result.tripId, travelerB, { actor: actorB! })).resolves.toBeNull();

    await withActor(actorA!, async ({ db }) => {
      const visible = await db.execute<{ id: string }>(sql`select id from app.trips where id = ${result.tripId}::uuid`);
      expect(visible.rows).toHaveLength(1);
    });
    await withActor(actorB!, async ({ db }) => {
      const hidden = await db.execute<{ id: string }>(sql`select id from app.trips where id = ${result.tripId}::uuid`);
      expect(hidden.rows).toHaveLength(0);
    });
  });
});
