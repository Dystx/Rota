import "server-only";

import {
  CreateReviewerAssignmentSchema,
  ReviewerAssignmentSchema,
  UpdateReviewerAssignmentSchema,
  type CreateReviewerAssignmentInput,
  type ReviewerAssignment,
  type UpdateReviewerAssignmentInput
} from "@repo/types";
import { and, desc, eq } from "drizzle-orm";

import { withActor, type ActorDb, type DatabaseActor } from "./actor";
import { authUsers, reviewerAssignments } from "./schema";

export const activeReviewerAssignmentStatuses = ["assigned", "submitted"] as const;

export class DuplicateActiveReviewerAssignmentError extends Error {
  constructor(public readonly existingAssignment: ReviewerAssignment) {
    super("Trip already has an active reviewer assignment.");
    this.name = "DuplicateActiveReviewerAssignmentError";
  }
}

export class DuplicateActiveReviewerAssignmentDatabaseError extends Error {
  constructor() {
    super("Trip already has an active reviewer assignment.");
    this.name = "DuplicateActiveReviewerAssignmentDatabaseError";
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Reviewer assignment completion date is invalid.");
  }
  return date;
}

function parseAssignmentRow(row: {
  completedAt: Date | null;
  createdAt: Date;
  id: string;
  notes: string;
  reviewerId: string;
  reviewerName: string | null;
  status: string;
  tripId: string;
}): ReviewerAssignment {
  return ReviewerAssignmentSchema.parse({
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    notes: row.notes,
    reviewerId: row.reviewerId,
    reviewerName: row.reviewerName ?? undefined,
    status: row.status,
    tripId: row.tripId
  });
}

async function selectAssignments(
  db: ActorDb["db"],
  tripId?: string,
  reviewerId?: string,
  limit = 100,
  assignmentId?: string
) {
  const conditions = [];
  if (tripId) conditions.push(eq(reviewerAssignments.tripId, tripId));
  if (reviewerId) conditions.push(eq(reviewerAssignments.reviewerUserId, reviewerId));
  if (assignmentId) conditions.push(eq(reviewerAssignments.id, assignmentId));

  const query = db
    .select({
      completedAt: reviewerAssignments.completedAt,
      createdAt: reviewerAssignments.createdAt,
      id: reviewerAssignments.id,
      notes: reviewerAssignments.notes,
      reviewerId: reviewerAssignments.reviewerUserId,
      reviewerName: authUsers.name,
      status: reviewerAssignments.status,
      tripId: reviewerAssignments.tripId
    })
    .from(reviewerAssignments)
    .leftJoin(authUsers, eq(authUsers.id, reviewerAssignments.reviewerUserId))
    .orderBy(desc(reviewerAssignments.createdAt))
    .limit(limit);

  return conditions.length > 0 ? query.where(and(...conditions)) : query;
}

function ensureUuid(value: string, label: string): string {
  const normalized = value.trim();
  if (!isUuid(normalized)) {
    throw new Error(`${label} must be a UUID.`);
  }
  return normalized;
}

export async function createPostgresReviewerAssignment(
  input: CreateReviewerAssignmentInput,
  actor: DatabaseActor
): Promise<ReviewerAssignment> {
  const assignment = CreateReviewerAssignmentSchema.parse(input);
  const tripId = ensureUuid(assignment.tripId, "Trip ID");
  const reviewerId = ensureUuid(assignment.reviewerId, "Reviewer ID");

  return withActor(actor, async ({ db }) => {
    try {
      const [row] = await db
        .insert(reviewerAssignments)
        .values({
          notes: assignment.notes,
          reviewerUserId: reviewerId,
          status: assignment.status,
          tripId
        })
        .returning({ id: reviewerAssignments.id });

      if (!row) {
        throw new Error("Failed to create reviewer assignment.");
      }

      const [created] = await selectAssignments(db, undefined, undefined, 1, row.id);
      if (!created) {
        throw new Error("Failed to load reviewer assignment after creation.");
      }
      return parseAssignmentRow(created);
    } catch (error) {
      const directCode = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
      const cause = typeof error === "object" && error !== null && "cause" in error ? error.cause : undefined;
      const causeCode = typeof cause === "object" && cause !== null && "code" in cause ? cause.code : undefined;
      if (directCode === "23505" || causeCode === "23505") {
        throw new DuplicateActiveReviewerAssignmentDatabaseError();
      }
      throw error;
    }
  });
}

export async function listPostgresReviewerAssignments(
  limit: number,
  reviewerId: string | undefined,
  actor: DatabaseActor
): Promise<ReviewerAssignment[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const normalizedReviewerId = reviewerId ? ensureUuid(reviewerId, "Reviewer ID") : undefined;

  return withActor(actor, async ({ db }) => {
    const rows = await selectAssignments(db, undefined, normalizedReviewerId, safeLimit);
    return rows.map(parseAssignmentRow);
  });
}

export async function listPostgresAssignmentsForTrip(tripId: string, actor: DatabaseActor): Promise<ReviewerAssignment[]> {
  if (!isUuid(tripId)) return [];

  return withActor(actor, async ({ db }) => {
    const rows = await selectAssignments(db, tripId, undefined, 100);
    return rows.map(parseAssignmentRow);
  });
}

export async function getPostgresReviewerAssignmentById(
  assignmentId: string,
  actor: DatabaseActor
): Promise<ReviewerAssignment | null> {
  if (!isUuid(assignmentId)) return null;

  return withActor(actor, async ({ db }) => {
    const rows = await selectAssignments(db, undefined, undefined, 1, assignmentId);
    return rows[0] ? parseAssignmentRow(rows[0]) : null;
  });
}

export async function updatePostgresReviewerAssignment(
  assignmentId: string,
  patch: UpdateReviewerAssignmentInput,
  actor: DatabaseActor
): Promise<ReviewerAssignment | null> {
  if (!isUuid(assignmentId)) return null;
  const parsed = UpdateReviewerAssignmentSchema.parse(patch);

  return withActor(actor, async ({ db }) => {
    const updates: Partial<typeof reviewerAssignments.$inferInsert> = {};
    if (parsed.notes !== undefined) updates.notes = parsed.notes;
    if (parsed.status !== undefined) updates.status = parsed.status;
    if (parsed.completedAt !== undefined) updates.completedAt = toDate(parsed.completedAt);

    const changed = await db
      .update(reviewerAssignments)
      .set(updates)
      .where(eq(reviewerAssignments.id, assignmentId))
      .returning({ id: reviewerAssignments.id });

    if (!changed[0]) return null;

    const rows = await selectAssignments(db, undefined, undefined, 1, assignmentId);
    return rows[0] ? parseAssignmentRow(rows[0]) : null;
  });
}

export async function getPostgresLatestAssignmentForTrip(tripId: string, actor: DatabaseActor): Promise<ReviewerAssignment | null> {
  const assignments = await listPostgresAssignmentsForTrip(tripId, actor);
  return assignments[0] ?? null;
}

export async function getPostgresLatestAssignmentForReviewerTrip(
  tripId: string,
  reviewerId: string,
  actor: DatabaseActor
): Promise<ReviewerAssignment | null> {
  const assignments = await listPostgresAssignmentsForTrip(tripId, actor);
  return assignments.find((assignment) => assignment.reviewerId === reviewerId) ?? null;
}

export async function reviewerHasPostgresTripAssignment(
  tripId: string,
  reviewerId: string,
  actor: DatabaseActor
): Promise<boolean> {
  const assignment = await getPostgresLatestAssignmentForReviewerTrip(tripId, reviewerId, actor);
  return assignment !== null;
}

export async function markPostgresReviewerAssignmentCompleted(
  tripId: string,
  reviewerId: string,
  notes: string | undefined,
  actor: DatabaseActor
): Promise<ReviewerAssignment | null> {
  const assignment = await getPostgresLatestAssignmentForReviewerTrip(tripId, reviewerId, actor);
  if (!assignment) return null;

  return updatePostgresReviewerAssignment(
    assignment.id,
    { completedAt: new Date().toISOString(), notes, status: "completed" },
    actor
  );
}
