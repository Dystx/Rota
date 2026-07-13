import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";

const reviewerUserId = "00000000-0000-4000-8000-000000000001";
const travelerUserId = "00000000-0000-4000-8000-000000000002";

describe("PostgreSQL actor authorization boundary", () => {
  let ownerPool: import("pg").Pool;
  let appPool: import("pg").Pool;
  let loadPostgresAuthorizationContext: typeof import("./actor").loadPostgresAuthorizationContext;
  let withActor: typeof import("./actor").withActor;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";

    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    appPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

    await ownerPool.query("delete from app.capability_grants where subject_user_id = any($1::uuid[])", [[reviewerUserId, travelerUserId]]);
    await ownerPool.query("delete from app.user_profiles where user_id = any($1::uuid[])", [[reviewerUserId, travelerUserId]]);
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[reviewerUserId, travelerUserId]]);
    await ownerPool.query(
      "insert into authn.user (id, name, email, email_verified) values ($1, 'Reviewer', 'actor-reviewer@example.test', true), ($2, 'Traveler', 'actor-traveler@example.test', true)",
      [reviewerUserId, travelerUserId]
    );
    await ownerPool.query("insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'reviewer', 'Reviewer'), ($2, 'traveler', 'Traveler')", [
      reviewerUserId,
      travelerUserId
    ]);
    await ownerPool.query(
      "insert into app.capability_grants (subject_user_id, app_role, capability, reason, granted_by) values ($1, 'reviewer', 'content:manage', 'integration test', $1)",
      [reviewerUserId]
    );

    ({ loadPostgresAuthorizationContext, withActor } = await import("./actor"));
  });

  afterAll(async () => {
    await ownerPool.query("delete from app.capability_grants where subject_user_id = any($1::uuid[])", [[reviewerUserId, travelerUserId]]);
    await ownerPool.query("delete from app.user_profiles where user_id = any($1::uuid[])", [[reviewerUserId, travelerUserId]]);
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[reviewerUserId, travelerUserId]]);
    await ownerPool.end();
    await appPool.end();
  });

  it("loads only the actor's profile and active capabilities", async () => {
    await expect(loadPostgresAuthorizationContext(reviewerUserId)).resolves.toEqual({
      capabilities: ["content:manage"],
      reviewerId: reviewerUserId,
      roles: ["reviewer"],
      userId: reviewerUserId
    });
    await expect(loadPostgresAuthorizationContext(travelerUserId)).resolves.toEqual({
      capabilities: [],
      reviewerId: null,
      roles: ["traveler"],
      userId: travelerUserId
    });
  });

  it("binds RLS actor settings to one transaction and clears them afterward", async () => {
    const actor = await loadPostgresAuthorizationContext(reviewerUserId);
    expect(actor).not.toBeNull();

    await withActor(actor!, async ({ db }) => {
      const visibleProfiles = await db.execute<{ user_id: string }>(sql`select user_id from app.user_profiles order by user_id`);
      expect(visibleProfiles.rows).toEqual([{ user_id: reviewerUserId }]);
    });

    const result = await appPool.query<{ actor_id: string | null }>("select current_setting('app.actor_id', true) as actor_id");
    expect(result.rows[0]?.actor_id).toBeNull();
  });
});
