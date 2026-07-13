import { afterAll, beforeAll, describe, expect, it } from "vitest";

const travelerA = "00000000-0000-4000-8000-000000000006";
const travelerB = "00000000-0000-4000-8000-000000000007";
const placeId = "00000000-0000-4000-8000-000000000008";

describe("PostgreSQL saved activity days", () => {
  let ownerPool: import("pg").Pool;
  let actorA: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let actorB: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let createPostgresSavedActivityDay: typeof import("./activity-days").createPostgresSavedActivityDay;
  let getPostgresSavedActivityDay: typeof import("./activity-days").getPostgresSavedActivityDay;
  let updatePostgresSavedActivityDay: typeof import("./activity-days").updatePostgresSavedActivityDay;
  let deletePostgresSavedActivityDay: typeof import("./activity-days").deletePostgresSavedActivityDay;
  let listPostgresSavedActivityDays: typeof import("./activity-days").listPostgresSavedActivityDays;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });

    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[travelerA, travelerB]]);
    await ownerPool.query("delete from app.places where id = $1::uuid", [placeId]);
    await ownerPool.query(
      "insert into authn.user (id, name, email, email_verified) values ($1, 'Day A', 'day-a@example.test', true), ($2, 'Day B', 'day-b@example.test', true)",
      [travelerA, travelerB]
    );
    await ownerPool.query(
      "insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'traveler', 'Day A'), ($2, 'traveler', 'Day B')",
      [travelerA, travelerB]
    );
    await ownerPool.query(
      "insert into app.places (id, slug, name, region_slug, category, editorial_status, source_confidence) values ($1, 'activity-days-test', 'Activity Days Test', 'porto', 'walk', 'published', 'verified')",
      [placeId]
    );

    ({ createPostgresSavedActivityDay, getPostgresSavedActivityDay, updatePostgresSavedActivityDay, deletePostgresSavedActivityDay, listPostgresSavedActivityDays } = await import("./activity-days"));
    const { loadPostgresAuthorizationContext } = await import("./actor");
    actorA = await loadPostgresAuthorizationContext(travelerA);
    actorB = await loadPostgresAuthorizationContext(travelerB);
  }, 30000);

  afterAll(async () => {
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[travelerA, travelerB]]);
    await ownerPool.query("delete from app.places where id = $1::uuid", [placeId]);
    await ownerPool.end();
  }, 30000);

  it("keeps saved days owner-scoped across read, update, and delete", async () => {
    expect(actorA).not.toBeNull();
    expect(actorB).not.toBeNull();

    const created = await createPostgresSavedActivityDay(
      {
        destinationSlug: "porto",
        title: "A slow Porto morning",
        dayDate: "2026-08-01",
        selections: [{ note: "Start early", placeId, position: 0 }]
      },
      actorA!
    );

    expect(created.ownerUserId).toBe(travelerA);
    expect(created.selections).toEqual([{ note: "Start early", placeId, position: 0 }]);
    await expect(listPostgresSavedActivityDays(10, actorA!)).resolves.toHaveLength(1);
    await expect(getPostgresSavedActivityDay(created.id, actorA!)).resolves.toMatchObject({ id: created.id });

    await expect(getPostgresSavedActivityDay(created.id, actorB!)).resolves.toBeNull();
    await expect(
      updatePostgresSavedActivityDay(created.id, { title: "Should not change", selections: [] }, actorB!)
    ).resolves.toBeNull();
    await expect(deletePostgresSavedActivityDay(created.id, actorB!)).resolves.toBe(false);

    const updated = await updatePostgresSavedActivityDay(
      created.id,
      {
        title: "A slower Porto morning",
        selections: [{ placeId, position: 0, note: "Keep the first stop" }]
      },
      actorA!
    );
    expect(updated).toMatchObject({ id: created.id, title: "A slower Porto morning" });
    expect(updated?.selections).toEqual([{ note: "Keep the first stop", placeId, position: 0 }]);

    await expect(deletePostgresSavedActivityDay(created.id, actorA!)).resolves.toBe(true);
    await expect(getPostgresSavedActivityDay(created.id, actorA!)).resolves.toBeNull();
  });
});
