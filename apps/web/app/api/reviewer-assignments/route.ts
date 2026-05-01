import { createReviewerAssignment, listReviewerAssignments } from "@repo/db";
import { CreateReviewerAssignmentSchema } from "@repo/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reviewerId = searchParams.get("reviewerId") ?? undefined;

  try {
    const assignments = await listReviewerAssignments(100, reviewerId);

    return Response.json({ assignments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reviewer assignments.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateReviewerAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Reviewer assignment validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const assignment = await createReviewerAssignment(parsed.data);

    return Response.json(
      {
        assignment,
        message: "Reviewer assignment saved."
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create reviewer assignment.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
