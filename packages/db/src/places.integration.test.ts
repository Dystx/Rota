import { afterAll, beforeAll, describe, expect, it } from "vitest";

const adminUserId = "00000000-0000-4000-8000-000000000003";

describe("PostgreSQL places repository", () => {
  let ownerPool: import("pg").Pool;
  let actor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let createPlace: typeof import("./places").createPlace;
  let getPlaceById: typeof import("./places").getPlaceById;
  let updatePlace: typeof import("./places").updatePlace;
  let writeAuditTrail: typeof import("./audit").writeAuditTrail;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    await ownerPool.query("delete from app.audit_events where entity_id = $1", ["actor-test-place"]);
    await ownerPool.query("delete from app.audit_events where actor_user_id = $1", [adminUserId]);
    await ownerPool.query("delete from app.places where slug = $1", ["actor-test-place"]);
    await ownerPool.query("delete from app.capability_grants where subject_user_id = $1", [adminUserId]);
    await ownerPool.query("delete from app.user_profiles where user_id = $1", [adminUserId]);
    await ownerPool.query("delete from authn.user where id = $1", [adminUserId]);
    await ownerPool.query("insert into authn.user (id, name, email, email_verified) values ($1, 'Admin', 'places-admin@example.test', true)", [adminUserId]);
    await ownerPool.query("insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'admin', 'Admin')", [adminUserId]);
    await ownerPool.query(
      "insert into app.capability_grants (subject_user_id, app_role, capability, reason, granted_by) values ($1, 'admin', 'content:manage', 'integration test', $1)",
      [adminUserId]
    );
    ({ createPlace, getPlaceById, updatePlace } = await import("./places"));
    ({ writeAuditTrail } = await import("./audit"));
    const { loadPostgresAuthorizationContext } = await import("./actor");
    actor = await loadPostgresAuthorizationContext(adminUserId);
  });

  afterAll(async () => {
    await ownerPool.query("delete from app.audit_events where entity_id = $1", ["actor-test-place"]);
    await ownerPool.query("delete from app.audit_events where actor_user_id = $1", [adminUserId]);
    await ownerPool.query("delete from app.places where slug = $1", ["actor-test-place"]);
    await ownerPool.query("delete from app.user_profiles where user_id = $1", [adminUserId]);
    await ownerPool.query("delete from authn.user where id = $1", [adminUserId]);
    await ownerPool.end();
  });

  it("creates, reads, updates, and audits a place through the actor boundary", async () => {
    expect(actor).not.toBeNull();
    const place = await createPlace(
      {
        category: "Viewpoint",
        id: "actor-test-place",
        name: "Actor Test Place",
        quality: 9,
        region: "Porto",
        sourceConfidence: "High"
      },
      { actor: actor! }
    );
    expect(place.id).toBe("actor-test-place");

    await expect(getPlaceById("actor-test-place", { actor: actor! })).resolves.toMatchObject({ name: "Actor Test Place" });
    await expect(updatePlace("actor-test-place", { quality: 7 }, { actor: actor! })).resolves.toMatchObject({ quality: 7 });
    await writeAuditTrail(
      { action: "update", actorUserId: adminUserId, entityId: "actor-test-place", entityType: "places", after: { quality: 7 } },
      { actor: actor! }
    );

    const audit = await ownerPool.query<{ count: string }>("select count(*)::text as count from app.audit_events where entity_id = $1", [
      "actor-test-place"
    ]);
    expect(audit.rows[0]?.count).toBe("1");
  }, 30000);
});
