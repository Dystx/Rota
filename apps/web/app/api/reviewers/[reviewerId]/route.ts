import { getReviewerById, updateReviewer , writeAuditTrail } from "@repo/db";
import { UpdateReviewerSchema } from "@repo/types";
import { internalError, isApiResponse, notFoundError, requireApiRole, validationError } from "@/lib/auth/api";

export async function GET(_request: Request, { params }: { params: Promise<{ reviewerId: string }> }) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const { reviewerId } = await params;

  try {
    const reviewer = await getReviewerById(reviewerId, { client: auth.client });

    if (!reviewer) {
      return notFoundError("Reviewer not found.");
    }

    return Response.json({ reviewer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reviewer.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to load reviewer.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ reviewerId: string }> }) {
  const auth = await requireApiRole(["admin"]);

  if (isApiResponse(auth)) {
    return auth;
  }

  const { reviewerId } = await params;
  const body = await request.json();
  const parsed = UpdateReviewerSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Reviewer update validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const reviewer = await updateReviewer(reviewerId, parsed.data, { client: auth.client });
    
    if (reviewer) {
      await writeAuditTrail({
        actorUserId: auth.userId,
        action: "update",
        entityType: "reviewers",
        entityId: reviewer.id,
        before: null,
        after: reviewer
      }, { client: auth.client });
    }

    if (!reviewer) {
      return notFoundError("Reviewer not found.");
    }

    return Response.json({ message: "Reviewer updated.", reviewer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update reviewer.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to update reviewer.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}
