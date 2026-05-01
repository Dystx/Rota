import { createReviewer, listReviewers } from "@repo/db";
import { CreateReviewerSchema } from "@repo/types";

export async function GET() {
  try {
    const reviewers = await listReviewers();

    return Response.json({ reviewers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reviewers.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateReviewerSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        errors: parsed.error.flatten().fieldErrors,
        message: "Reviewer validation failed."
      },
      { status: 400 }
    );
  }

  try {
    const reviewer = await createReviewer(parsed.data);

    return Response.json(
      {
        message: "Reviewer saved.",
        reviewer
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create reviewer.";
    const status = message.startsWith("Missing required environment variable") ? 503 : 500;

    return Response.json({ message }, { status });
  }
}
