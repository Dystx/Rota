import { updateReviewerAssignment } from "@repo/db";
import { UpdateReviewerAssignmentSchema } from "@repo/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const body = await request.json();
  const parsed = UpdateReviewerAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Reviewer assignment update validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const assignment = await updateReviewerAssignment(assignmentId, parsed.data);

    if (!assignment) {
      return Response.json({ message: "Reviewer assignment not found." }, { status: 404 });
    }

    return Response.json({ assignment, message: "Reviewer assignment updated." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update reviewer assignment.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
