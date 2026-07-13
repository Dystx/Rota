import "server-only";

import { z } from "zod";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { updatePostgresTripStatus } from "@repo/db";

const MovePayloadSchema = z.object({
  tripId: z.string().min(1).max(64),
  // The locally-displayed lane name. Mapped to a real trips.status
  // value inside the function. Kept narrow on purpose so a typo
  // here fails validation rather than writing a bad value to
  // the database.
  toStatus: z.enum(["draft", "in_revision", "active_chat"]),
});

export type MoveTripStageInput = z.infer<typeof MovePayloadSchema>;

export type MoveTripStageResult = {
  tripId: string;
  newStatus: string;
};

/**
 * Map the kanban-local stage to the real `trips.status` value.
 * The local stages are a UI concept; the DB enum is the source
 * of truth.
 */
function localToTripsStatus(local: MoveTripStageInput["toStatus"]): string {
  switch (local) {
    case "draft":
      return "draft";
    case "in_revision":
      return "in_review";
    case "active_chat":
      return "active";
  }
}

/**
 * Updates a trip's `status` column to reflect a kanban move. Only
 * the admin actor may call this — operators on the console.
 * Returns the new status string on success.
 */
export async function moveTripStage(
  rawInput: MoveTripStageInput
): Promise<MoveTripStageResult> {
  const input = MovePayloadSchema.parse(rawInput);
  const admin = await getAdminPageAuthContext();
  if (!isAdminPageAuthContext(admin)) {
    throw new Error(
      `moveTripStage requires an admin actor (got: ${admin.reason})`
    );
  }

  const newStatus = localToTripsStatus(input.toStatus);

  // Cheap pre-check: refuse to touch fallback items (their ids
  // start with "fallback-") so the board's offline placeholder
  // cards never get a write attempted against the real table.
  if (input.tripId.startsWith("fallback-")) {
    throw new Error(
      "Cannot persist a move for a fallback item (no such row in the database)."
    );
  }

  const updated = await updatePostgresTripStatus(input.tripId, newStatus as "draft" | "in_review" | "active", admin.actor);
  if (!updated) throw new Error("moveTripStage failed: trip not found or not authorized.");

  return { tripId: input.tripId, newStatus };
}
