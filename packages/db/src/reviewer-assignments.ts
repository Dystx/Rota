import {
  CreateReviewerAssignmentSchema,
  ReviewerAssignmentSchema,
  reviewerAssignmentStatuses,
  type CreateReviewerAssignmentInput,
  type ReviewerAssignment,
  type UpdateReviewerAssignmentInput
} from "@repo/types";
import { resolveLegacyDataClient, type DataClientOptions } from "./clients";
import {
  createPostgresReviewerAssignment,
  getPostgresReviewerAssignmentById,
  listPostgresAssignmentsForTrip,
  listPostgresReviewerAssignments,
  updatePostgresReviewerAssignment,
  DuplicateActiveReviewerAssignmentDatabaseError,
  DuplicateActiveReviewerAssignmentError
} from "./reviewer-assignments-postgres";

export { DuplicateActiveReviewerAssignmentDatabaseError, DuplicateActiveReviewerAssignmentError } from "./reviewer-assignments-postgres";

export const activeReviewerAssignmentStatuses = ["assigned", "submitted"] as const;

type RawReviewerAssignmentRow = {
  id: number;
  trip_id: number;
  reviewer_id: string;
  status: string;
  notes: string;
  created_at: string;
  completed_at: string | null;
  reviewers?:
    | {
        name: string;
      }
    | Array<{
        name: string;
      }>
    | null;
};

function parseAssignmentRow(row: RawReviewerAssignmentRow): ReviewerAssignment {
  const reviewerName = Array.isArray(row.reviewers) ? row.reviewers[0]?.name : row.reviewers?.name;

  return ReviewerAssignmentSchema.parse({
    completedAt: row.completed_at,
    createdAt: row.created_at,
    id: String(row.id),
    notes: row.notes,
    reviewerId: row.reviewer_id,
    reviewerName,
    status: row.status,
    tripId: String(row.trip_id)
  });
}

function toNumericTripId(tripId: string) {
  const numericTripId = Number(tripId);

  return Number.isInteger(numericTripId) ? numericTripId : null;
}

function isUniqueActiveReviewerAssignmentError(error: { code?: string; message?: string } | null | undefined): boolean {
  return (
    error?.code === "23505" &&
    (error.message?.includes("reviewer_assignments_one_active_per_trip_idx") ?? false)
  );
}

export function isActiveReviewerAssignmentStatus(status: string): boolean {
  return activeReviewerAssignmentStatuses.includes(status as (typeof activeReviewerAssignmentStatuses)[number]);
}

export function isSupportedReviewerAssignmentStatus(status: string): boolean {
  return reviewerAssignmentStatuses.includes(status as (typeof reviewerAssignmentStatuses)[number]);
}

export function filterActiveReviewerAssignments(assignments: ReviewerAssignment[]): ReviewerAssignment[] {
  return assignments.filter((assignment) => isActiveReviewerAssignmentStatus(assignment.status));
}

export async function createReviewerAssignment(input: CreateReviewerAssignmentInput, options?: DataClientOptions): Promise<ReviewerAssignment> {
  if (options?.actor) {
    return createPostgresReviewerAssignment(input, options.actor);
  }

  const assignment = CreateReviewerAssignmentSchema.parse(input);
  const numericTripId = toNumericTripId(assignment.tripId);

  if (numericTripId === null) {
    throw new Error("Trip assignment requires a numeric trip id.");
  }

  const activeAssignments = filterActiveReviewerAssignments(await listAssignmentsForTrip(assignment.tripId, options));
  const existingAssignment = activeAssignments[0];

  if (existingAssignment) {
    throw new DuplicateActiveReviewerAssignmentError(existingAssignment);
  }

  const { data, error } = await resolveLegacyDataClient(options)
    .from("reviewer_assignments")
    .insert({
      notes: assignment.notes,
      reviewer_id: assignment.reviewerId,
      status: assignment.status,
      trip_id: numericTripId
    })
    .select("id,trip_id,reviewer_id,status,notes,created_at,completed_at,reviewers(name)")
    .single();

  if (isUniqueActiveReviewerAssignmentError(error)) {
    throw new DuplicateActiveReviewerAssignmentDatabaseError();
  }

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create reviewer assignment.");
  }

  return parseAssignmentRow(data as RawReviewerAssignmentRow);
}

export async function listReviewerAssignments(limit = 100, reviewerId?: string, options?: DataClientOptions): Promise<ReviewerAssignment[]> {
  if (options?.actor) {
    return listPostgresReviewerAssignments(limit, reviewerId, options.actor);
  }

  let query = resolveLegacyDataClient(options)
    .from("reviewer_assignments")
    .select("id,trip_id,reviewer_id,status,notes,created_at,completed_at,reviewers(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (reviewerId) {
    query = query.eq("reviewer_id", reviewerId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawReviewerAssignmentRow[] | null) ?? []).map((row) => parseAssignmentRow(row));
}

export async function listAssignmentsForTrip(tripId: string, options?: DataClientOptions): Promise<ReviewerAssignment[]> {
  if (options?.actor) {
    return listPostgresAssignmentsForTrip(tripId, options.actor);
  }

  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return [];
  }

  const { data, error } = await resolveLegacyDataClient(options)
    .from("reviewer_assignments")
    .select("id,trip_id,reviewer_id,status,notes,created_at,completed_at,reviewers(name)")
    .eq("trip_id", numericTripId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawReviewerAssignmentRow[] | null) ?? []).map((row) => parseAssignmentRow(row));
}

export async function getReviewerAssignmentById(assignmentId: string, options?: DataClientOptions): Promise<ReviewerAssignment | null> {
  if (options?.actor) {
    return getPostgresReviewerAssignmentById(assignmentId, options.actor);
  }

  const numericAssignmentId = Number(assignmentId);

  if (!Number.isInteger(numericAssignmentId)) {
    return null;
  }

  const { data, error } = await resolveLegacyDataClient(options)
    .from("reviewer_assignments")
    .select("id,trip_id,reviewer_id,status,notes,created_at,completed_at,reviewers(name)")
    .eq("id", numericAssignmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parseAssignmentRow(data as RawReviewerAssignmentRow);
}

export async function getLatestAssignmentForTrip(tripId: string, options?: DataClientOptions): Promise<ReviewerAssignment | null> {
  const assignments = await listAssignmentsForTrip(tripId, options);

  return assignments[0] ?? null;
}

export async function getLatestAssignmentForReviewerTrip(
  tripId: string,
  reviewerId: string,
  options?: DataClientOptions
): Promise<ReviewerAssignment | null> {
  const assignments = await listAssignmentsForTrip(tripId, options);

  return assignments.find((assignment) => assignment.reviewerId === reviewerId) ?? null;
}

export async function reviewerHasTripAssignment(
  tripId: string,
  reviewerId: string,
  options?: DataClientOptions
): Promise<boolean> {
  const assignments = await listAssignmentsForTrip(tripId, options);

  return assignments.some((assignment) => assignment.reviewerId === reviewerId);
}

export async function updateReviewerAssignment(
  assignmentId: string,
  patch: UpdateReviewerAssignmentInput,
  options?: DataClientOptions
): Promise<ReviewerAssignment | null> {
  if (options?.actor) {
    return updatePostgresReviewerAssignment(assignmentId, patch, options.actor);
  }

  const numericAssignmentId = Number(assignmentId);

  if (!Number.isInteger(numericAssignmentId)) {
    return null;
  }

  const updates: Record<string, string | null> = {};

  if (patch.notes !== undefined) updates.notes = patch.notes;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.completedAt !== undefined) updates.completed_at = patch.completedAt;

  const { data, error } = await resolveLegacyDataClient(options)
    .from("reviewer_assignments")
    .update(updates)
    .eq("id", numericAssignmentId)
    .select("id,trip_id,reviewer_id,status,notes,created_at,completed_at,reviewers(name)")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parseAssignmentRow(data as RawReviewerAssignmentRow);
}

export async function markLatestAssignmentCompleted(tripId: string, notes?: string, options?: DataClientOptions): Promise<ReviewerAssignment | null> {
  const latestAssignment = await getLatestAssignmentForTrip(tripId, options);

  if (!latestAssignment) {
    return null;
  }

  return updateReviewerAssignment(
    latestAssignment.id,
    {
      completedAt: new Date().toISOString(),
      notes,
      status: "completed"
    },
    options
  );
}

export async function markReviewerTripAssignmentCompleted(
  tripId: string,
  reviewerId: string,
  notes?: string,
  options?: DataClientOptions
): Promise<ReviewerAssignment | null> {
  const latestAssignment = await getLatestAssignmentForReviewerTrip(tripId, reviewerId, options);

  if (!latestAssignment) {
    return null;
  }

  return updateReviewerAssignment(
    latestAssignment.id,
    {
      completedAt: new Date().toISOString(),
      notes,
      status: "completed"
    },
    options
  );
}
