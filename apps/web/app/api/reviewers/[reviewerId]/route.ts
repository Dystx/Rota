import { getReviewerById, updateReviewer } from "@repo/db";
import { UpdateReviewerSchema } from "@repo/types";

export async function GET(_request: Request, { params }: { params: Promise<{ reviewerId: string }> }) {
  const { reviewerId } = await params;

  try {
    const reviewer = await getReviewerById(reviewerId);

    if (!reviewer) {
      return Response.json({ message: "Reviewer not found." }, { status: 404 });
    }

    return Response.json({ reviewer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reviewer.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ reviewerId: string }> }) {
  const { reviewerId } = await params;
  const body = await request.json();
  const parsed = UpdateReviewerSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Reviewer update validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const reviewer = await updateReviewer(reviewerId, parsed.data);

    if (!reviewer) {
      return Response.json({ message: "Reviewer not found." }, { status: 404 });
    }

    return Response.json({ message: "Reviewer updated.", reviewer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update reviewer.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
