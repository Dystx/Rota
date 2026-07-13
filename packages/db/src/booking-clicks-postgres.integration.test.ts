import { afterAll, beforeAll, describe, expect, it } from "vitest";

const adminUserId = "00000000-0000-4000-8000-000000000016";

describe("PostgreSQL booking clicks and analytics", () => {
  let ownerPool: import("pg").Pool;
  let adminActor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let repos: typeof import("./booking-clicks-postgres");

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    await ownerPool.query("delete from app.booking_clicks where partner_id = $1", ["click-test-partner"]);
    await ownerPool.query("delete from app.partners where id = $1", ["click-test-partner"]);
    await ownerPool.query("delete from app.capability_grants where subject_user_id = $1", [adminUserId]);
    await ownerPool.query("delete from app.user_profiles where user_id = $1", [adminUserId]);
    await ownerPool.query("delete from authn.user where id = $1", [adminUserId]);
    await ownerPool.query("insert into authn.user (id, name, email, email_verified) values ($1, 'Click Admin', 'click-admin@example.test', true)", [adminUserId]);
    await ownerPool.query("insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'admin', 'Click Admin')", [adminUserId]);
    await ownerPool.query(
      "insert into app.capability_grants (subject_user_id, app_role, capability, reason, granted_by) values ($1, 'admin', 'analytics:read', 'click integration test', $1)",
      [adminUserId]
    );
    await ownerPool.query(
      "insert into app.partners (id, name, type, status, link) values ('click-test-partner', 'Click Test Partner', 'transport', 'Active', 'https://example.test')"
    );
    repos = await import("./booking-clicks-postgres");
    const { loadPostgresAuthorizationContext } = await import("./actor");
    adminActor = await loadPostgresAuthorizationContext(adminUserId);
  });

  afterAll(async () => {
    await ownerPool.query("delete from app.booking_clicks where partner_id = $1", ["click-test-partner"]);
    await ownerPool.query("delete from app.partners where id = $1", ["click-test-partner"]);
    await ownerPool.query("delete from app.capability_grants where subject_user_id = $1", [adminUserId]);
    await ownerPool.query("delete from app.user_profiles where user_id = $1", [adminUserId]);
    await ownerPool.query("delete from authn.user where id = $1", [adminUserId]);
    await ownerPool.end();
  }, 30000);

  it("records anonymous clicks and restricts reporting to analytics actors", async () => {
    expect(adminActor).not.toBeNull();
    const created = await repos.createPostgresBookingClick({
      partnerId: "click-test-partner",
      tripId: "legacy-trip-42",
      source: "saved-day",
      target: "https://example.test/offer",
      referer: "https://rumia.pt/trip/42",
      userAgent: "test-agent"
    });
    expect(created).toMatchObject({ partnerId: "click-test-partner", tripId: "legacy-trip-42", partnerName: "Click Test Partner" });
    await expect(repos.listPostgresBookingClicks(10, adminActor!)).resolves.toEqual([expect.objectContaining({ id: created.id })]);
  });
});
