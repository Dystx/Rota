import { afterAll, beforeAll, describe, expect, it } from "vitest";

const adminUserId = "00000000-0000-4000-8000-000000000017";

describe("PostgreSQL console and organization repositories", () => {
  let ownerPool: import("pg").Pool;
  let adminActor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let repos: typeof import("./console-postgres");

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    await ownerPool.query("delete from app.chat_messages where conversation_id = $1", ["console-test"]);
    await ownerPool.query("delete from app.itinerary_events where conversation_id = $1", ["console-test"]);
    await ownerPool.query("delete from app.organizations where slug = $1", ["console-test-org"]);
    await ownerPool.query("delete from app.user_profiles where user_id = $1", [adminUserId]);
    await ownerPool.query("delete from authn.user where id = $1", [adminUserId]);
    await ownerPool.query("insert into authn.user (id, name, email, email_verified) values ($1, 'Console Admin', 'console-admin@example.test', true)", [adminUserId]);
    await ownerPool.query("insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'admin', 'Console Admin')", [adminUserId]);
    await ownerPool.query("insert into app.organizations (name, slug, branding) values ('Console Org', 'console-test-org', '{\"primary_color\":\"#123456\"}')");
    repos = await import("./console-postgres");
    const { loadPostgresAuthorizationContext } = await import("./actor");
    adminActor = await loadPostgresAuthorizationContext(adminUserId);
  });

  afterAll(async () => {
    await ownerPool.query("delete from app.chat_messages where conversation_id = $1", ["console-test"]);
    await ownerPool.query("delete from app.itinerary_events where conversation_id = $1", ["console-test"]);
    await ownerPool.query("delete from app.organizations where slug = $1", ["console-test-org"]);
    await ownerPool.query("delete from app.user_profiles where user_id = $1", [adminUserId]);
    await ownerPool.query("delete from authn.user where id = $1", [adminUserId]);
    await ownerPool.end();
  }, 30000);

  it("keeps operator console writes actor-scoped and organization branding public", async () => {
    expect(adminActor).not.toBeNull();
    await expect(repos.getPostgresOrgBySlug("console-test-org")).resolves.toMatchObject({ name: "Console Org", slug: "console-test-org" });
    const event = await repos.insertPostgresItineraryEvent(
      {
        conversationId: "console-test",
        eventType: "activity",
        title: "Test activity",
        eventDate: "2026-08-01",
        eventTime: "10:00",
        internalNotes: "Check weather",
        createdBy: adminUserId
      },
      adminActor!
    );
    expect(event.id).toEqual(expect.any(String));
    const message = await repos.insertPostgresChatMessage(
      {
        conversationId: "console-test",
        authorRole: "operator",
        body: "Hello from the operator",
        sourceSnippetId: null
      },
      adminActor!
    );
    expect(message.id).toEqual(expect.any(String));
    await expect(repos.listPostgresItineraryEvents({ conversationId: "console-test", limit: 10 }, adminActor!)).resolves.toHaveLength(1);
    await expect(repos.listPostgresChatMessages({ conversationId: "console-test", limit: 10 }, adminActor!)).resolves.toHaveLength(1);
  });
});
