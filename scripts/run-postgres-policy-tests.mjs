import process from "node:process";
import pg from "pg";

const { Pool } = pg;
const actorA = "00000000-0000-4000-8000-000000000006";
const actorB = "00000000-0000-4000-8000-000000000007";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function withActor(client, userId, work) {
  await client.query("begin");
  try {
    await client.query("select pg_catalog.set_config('app.actor_id', $1, true)", [userId]);
    await work();
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

export async function runPostgresPolicyTests({ appDatabaseUrl = process.env.DATABASE_URL, ownerDatabaseUrl = process.env.RUMIA_OWNER_DATABASE_URL } = {}) {
  if (!appDatabaseUrl) throw new Error("Missing required environment variable: DATABASE_URL");
  if (!ownerDatabaseUrl) throw new Error("Missing required environment variable: RUMIA_OWNER_DATABASE_URL");

  const owner = new Pool({ connectionString: ownerDatabaseUrl, max: 1 });
  const app = new Pool({ connectionString: appDatabaseUrl, max: 1 });
  let tripA;
  let tripB;

  try {
    await owner.query("delete from authn.user where id = any($1::uuid[])", [[actorA, actorB]]);
    await owner.query(
      "insert into authn.user (id, name, email, email_verified) values ($1, 'Policy A', 'policy-a@example.test', true), ($2, 'Policy B', 'policy-b@example.test', true)",
      [actorA, actorB]
    );
    await owner.query("insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'traveler', 'Policy A'), ($2, 'traveler', 'Policy B')", [actorA, actorB]);
    await owner.query(
      "insert into app.capability_grants (subject_user_id, app_role, capability, reason, granted_by) values ($1, 'traveler', 'content:manage', 'policy test', $1)",
      [actorA]
    );

    const briefA = await owner.query(
      "insert into app.trip_briefs (owner_user_id, destination_country, destination_regions, trip_length_days, travelers_count, traveler_type, budget_level, pace, interests, food_preferences, avoidances, transport_mode, accommodation_location, raw_input, normalized_json) values ($1, 'portugal', '{porto}', 3, 1, 'solo', 'budget', 'calm', '{nature}', '{}', '{}', 'no-car', '', 'policy test brief', '{}') returning id",
      [actorA]
    );
    const briefB = await owner.query(
      "insert into app.trip_briefs (owner_user_id, destination_country, destination_regions, trip_length_days, travelers_count, traveler_type, budget_level, pace, interests, food_preferences, avoidances, transport_mode, accommodation_location, raw_input, normalized_json) values ($1, 'portugal', '{lisbon}', 3, 1, 'solo', 'budget', 'calm', '{nature}', '{}', '{}', 'no-car', '', 'policy test brief', '{}') returning id",
      [actorB]
    );
    const insertedA = await owner.query("insert into app.trips (trip_brief_id, owner_user_id, country_slug, title) values ($1, $2, 'portugal', 'Policy A trip') returning id", [briefA.rows[0].id, actorA]);
    const insertedB = await owner.query("insert into app.trips (trip_brief_id, owner_user_id, country_slug, title) values ($1, $2, 'portugal', 'Policy B trip') returning id", [briefB.rows[0].id, actorB]);
    tripA = insertedA.rows[0].id;
    tripB = insertedB.rows[0].id;

    const appClient = await app.connect();
    try {
      await withActor(appClient, actorA, async () => {
        const visibleTrips = await appClient.query("select id from app.trips order by id");
        if (visibleTrips.rowCount !== 1 || String(visibleTrips.rows[0].id) !== String(tripA)) {
          throw new Error("RLS failed: actor A can see more than its own trip.");
        }
        const grants = await appClient.query("select capability from app.capability_grants");
        if (grants.rowCount !== 1 || grants.rows[0].capability !== "content:manage") {
          throw new Error("RLS failed: actor A cannot read its own capability grant.");
        }
      });

      await withActor(appClient, actorB, async () => {
        const visibleTrips = await appClient.query("select id from app.trips order by id");
        if (visibleTrips.rowCount !== 1 || String(visibleTrips.rows[0].id) !== String(tripB)) {
          throw new Error("RLS failed: actor B can see more than its own trip.");
        }
      });

      let privateDenied = false;
      try {
        await appClient.query("select count(*) from private.job_outbox");
      } catch (error) {
        privateDenied = error?.code === "42501";
      }
      if (!privateDenied) throw new Error("Private job state is directly readable by rumia_app.");
    } finally {
      appClient.release();
    }
  } finally {
    await owner.query("delete from authn.user where id = any($1::uuid[])", [[actorA, actorB]]);
    await owner.end();
    await app.end();
  }

  return { ok: true };
}

if (process.argv[1]?.endsWith("run-postgres-policy-tests.mjs")) {
  try {
    await runPostgresPolicyTests();
    console.log("PostgreSQL policy tests passed.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
