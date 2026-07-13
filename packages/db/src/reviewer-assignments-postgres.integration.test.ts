import { afterAll, beforeAll, describe, expect, it } from "vitest";

const reviewerA = "00000000-0000-4000-8000-000000000109";
const reviewerB = "00000000-0000-4000-8000-000000000110";
const traveler = "00000000-0000-4000-8000-000000000111";
const admin = "00000000-0000-4000-8000-000000000114";
const briefId = "00000000-0000-4000-8000-000000000113";
const tripId = "00000000-0000-4000-8000-000000000112";

describe("PostgreSQL reviewer assignments", () => {
  let ownerPool: import("pg").Pool;
  let reviewerActorA: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let reviewerActorB: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let adminActor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let createPostgresReviewerAssignment: typeof import("./reviewer-assignments-postgres").createPostgresReviewerAssignment;
  let listPostgresReviewerAssignments: typeof import("./reviewer-assignments-postgres").listPostgresReviewerAssignments;
  let updatePostgresReviewerAssignment: typeof import("./reviewer-assignments-postgres").updatePostgresReviewerAssignment;
  let DuplicateActiveReviewerAssignmentDatabaseError: typeof import("./reviewer-assignments-postgres").DuplicateActiveReviewerAssignmentDatabaseError;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });

    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[reviewerA, reviewerB, traveler, admin]]);
    await ownerPool.query("delete from app.trip_briefs where id = $1::uuid", [briefId]);
    await ownerPool.query(
      "insert into authn.user (id, name, email, email_verified) values ($1, 'Reviewer A', 'assignment-a@example.test', true), ($2, 'Reviewer B', 'assignment-b@example.test', true), ($3, 'Traveler', 'assignment-traveler@example.test', true), ($4, 'Admin', 'assignment-admin@example.test', true)",
      [reviewerA, reviewerB, traveler, admin]
    );
    await ownerPool.query(
      "insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'reviewer', 'Reviewer A'), ($2, 'reviewer', 'Reviewer B'), ($3, 'traveler', 'Traveler'), ($4, 'admin', 'Admin')",
      [reviewerA, reviewerB, traveler, admin]
    );
    await ownerPool.query(
      "insert into app.capability_grants (subject_user_id, app_role, capability, reason, granted_by) values ($1, 'admin', 'operations:manage', 'assignment integration test', $1)",
      [admin]
    );
    await ownerPool.query(
      "insert into app.trip_briefs (id, owner_user_id, destination_country, destination_regions, trip_length_days, travelers_count, traveler_type, budget_level, pace, interests, food_preferences, avoidances, transport_mode, accommodation_location, raw_input, normalized_json) values ($1, $2, 'portugal', '{porto}', 3, 2, 'couple', 'mid-range', 'calm', '{old-streets}', '{}', '{}', 'train-and-transfers', '', 'Assignment integration test brief with enough context.', '{}')",
      [briefId, traveler]
    );
    await ownerPool.query(
      "insert into app.trips (id, trip_brief_id, owner_user_id, country_slug, title) values ($1, $2, $3, 'portugal', 'Assignment integration trip')",
      [tripId, briefId, traveler]
    );

    ({ createPostgresReviewerAssignment, listPostgresReviewerAssignments, updatePostgresReviewerAssignment, DuplicateActiveReviewerAssignmentDatabaseError } = await import("./reviewer-assignments-postgres"));
    const { loadPostgresAuthorizationContext } = await import("./actor");
    reviewerActorA = await loadPostgresAuthorizationContext(reviewerA);
    reviewerActorB = await loadPostgresAuthorizationContext(reviewerB);
    adminActor = await loadPostgresAuthorizationContext(admin);
  }, 30000);

  afterAll(async () => {
    await ownerPool.query("delete from app.trip_briefs where id = $1::uuid", [briefId]);
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[reviewerA, reviewerB, traveler, admin]]);
    await ownerPool.end();
  }, 30000);

  it("limits assignment visibility to the assigned reviewer and supports idempotent completion", async () => {
    expect(reviewerActorA).not.toBeNull();
    expect(reviewerActorB).not.toBeNull();
    expect(adminActor).not.toBeNull();

    const assignment = await createPostgresReviewerAssignment(
      { notes: "Review the pace", reviewerId: reviewerA, status: "assigned", tripId },
      adminActor!
    );

    expect(assignment).toMatchObject({ reviewerId: reviewerA, reviewerName: "Reviewer A", status: "assigned", tripId });
    await expect(listPostgresReviewerAssignments(10, reviewerA, reviewerActorA!)).resolves.toHaveLength(1);
    await expect(listPostgresReviewerAssignments(10, reviewerB, reviewerActorB!)).resolves.toHaveLength(0);

    await expect(
      createPostgresReviewerAssignment({ notes: "Duplicate", reviewerId: reviewerB, status: "assigned", tripId }, adminActor!)
    ).rejects.toBeInstanceOf(DuplicateActiveReviewerAssignmentDatabaseError);

    await expect(
      updatePostgresReviewerAssignment(assignment.id, { status: "submitted", notes: "Ready for QA" }, reviewerActorB!)
    ).resolves.toBeNull();

    const updated = await updatePostgresReviewerAssignment(
      assignment.id,
      { status: "completed", notes: "Reviewed and complete", completedAt: "2026-08-01T10:00:00.000Z" },
      reviewerActorA!
    );
    expect(updated).toMatchObject({ status: "completed", notes: "Reviewed and complete", reviewerName: "Reviewer A" });
  });
});
