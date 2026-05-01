import {
  CreateReviewerAssignmentSchema,
  ReviewerAssignmentSchema,
  type CreateReviewerAssignmentInput,
  type ReviewerAssignment,
  type UpdateReviewerAssignmentInput
} from "@repo/types";
import { createAdminClient } from "./index";

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

export async function createReviewerAssignment(input: CreateReviewerAssignmentInput): Promise<ReviewerAssignment> {
  const assignment = CreateReviewerAssignmentSchema.parse(input);
  const numericTripId = toNumericTripId(assignment.tripId);

  if (numericTripId === null) {
    throw new Error("Trip assignment requires a numeric trip id.");
  }

  const { data, error } = await createAdminClient()
    .from("reviewer_assignments")
    .insert({
      notes: assignment.notes,
      reviewer_id: assignment.reviewerId,
      status: assignment.status,
      trip_id: numericTripId
    })
    .select("id,trip_id,reviewer_id,status,notes,created_at,completed_at,reviewers(name)")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create reviewer assignment.");
  }

  return parseAssignmentRow(data as RawReviewerAssignmentRow);
}

export async function listReviewerAssignments(limit = 100, reviewerId?: string): Promise<ReviewerAssignment[]> {
  let query = createAdminClient()
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

export async function listAssignmentsForTrip(tripId: string): Promise<ReviewerAssignment[]> {
  const numericTripId = toNumericTripId(tripId);

  if (numericTripId === null) {
    return [];
  }

  const { data, error } = await createAdminClient()
    .from("reviewer_assignments")
    .select("id,trip_id,reviewer_id,status,notes,created_at,completed_at,reviewers(name)")
    .eq("trip_id", numericTripId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawReviewerAssignmentRow[] | null) ?? []).map((row) => parseAssignmentRow(row));
}

export async function getLatestAssignmentForTrip(tripId: string): Promise<ReviewerAssignment | null> {
  const assignments = await listAssignmentsForTrip(tripId);

  return assignments[0] ?? null;
}

export async function updateReviewerAssignment(assignmentId: string, patch: UpdateReviewerAssignmentInput): Promise<ReviewerAssignment | null> {
  const numericAssignmentId = Number(assignmentId);

  if (!Number.isInteger(numericAssignmentId)) {
    return null;
  }

  const updates: Record<string, string | null> = {};

  if (patch.notes !== undefined) updates.notes = patch.notes;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.completedAt !== undefined) updates.completed_at = patch.completedAt;

  const { data, error } = await createAdminClient()
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

export async function markLatestAssignmentCompleted(tripId: string, notes?: string): Promise<ReviewerAssignment | null> {
  const latestAssignment = await getLatestAssignmentForTrip(tripId);

  if (!latestAssignment) {
    return null;
  }

  return updateReviewerAssignment(latestAssignment.id, {
    completedAt: new Date().toISOString(),
    notes,
    status: "completed"
  });
}
