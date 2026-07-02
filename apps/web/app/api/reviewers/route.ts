import { createReviewer, listReviewers , writeAuditTrail } from "@repo/db";
import { CreateReviewerSchema } from "@repo/types";
import { internalError, isApiResponse, requireApiRole, validationError } from "@/lib/auth/api";

export async function GET() {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  try {
    const reviewers = await listReviewers(100, { client: auth.client });

    return Response.json({ reviewers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reviewers.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to load reviewers.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const body = await request.json();
  const parsed = CreateReviewerSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Reviewer validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const reviewer = await createReviewer(parsed.data, { client: auth.client });
    
    await writeAuditTrail({
      actorUserId: auth.userId,
      action: "create",
      entityType: "reviewers",
      entityId: reviewer.id,
      after: reviewer
    }, { client: auth.client });

    return Response.json(
      {
        message: "Reviewer saved.",
        reviewer
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create reviewer.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to create reviewer.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}
