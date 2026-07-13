import { getReviewerAssignmentById, updateReviewerAssignment } from "@repo/db";
import { UpdateReviewerAssignmentSchema } from "@repo/types";
import { forbiddenError, internalError, isApiResponse, notFoundError, requireApiRole, validationError } from "@/lib/auth/api";

export async function PATCH(request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const auth = await requireApiRole(["reviewer", "admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const { assignmentId } = await params;
  const body = await request.json();
  const parsed = UpdateReviewerAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Reviewer assignment update validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const dataOptions = { actor: auth.actor };
    if (auth.role === "reviewer") {
      const existingAssignment = await getReviewerAssignmentById(assignmentId, dataOptions);

      if (!existingAssignment) {
        return notFoundError("Reviewer assignment not found.");
      }

      if (!auth.reviewerId || existingAssignment.reviewerId !== auth.reviewerId) {
        return forbiddenError("Reviewers may only update their own assignments.");
      }
    }

    const assignment = await updateReviewerAssignment(assignmentId, parsed.data, dataOptions);

    if (!assignment) {
      return notFoundError("Reviewer assignment not found.");
    }

    return Response.json({ assignment, message: "Reviewer assignment updated." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update reviewer assignment.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to update reviewer assignment.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}
