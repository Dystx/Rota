import {
  createReviewerAssignment,
  DuplicateActiveReviewerAssignmentDatabaseError,
  DuplicateActiveReviewerAssignmentError,
  listReviewerAssignments,
  type DataClientOptions
} from "@repo/db";
import { CreateReviewerAssignmentSchema } from "@repo/types";
import { apiError, forbiddenError, internalError, isApiResponse, requireApiRole, validationError, type AuthorizedApiContext } from "@/lib/auth/api";

type ReviewerAssignmentRouteDependencies = {
  createAssignment?: (input: Parameters<typeof createReviewerAssignment>[0], options?: DataClientOptions) => ReturnType<typeof createReviewerAssignment>;
  listAssignments?: typeof listReviewerAssignments;
  requireAdmin?: () => Promise<AuthorizedApiContext | Response>;
  requireReader?: () => Promise<AuthorizedApiContext | Response>;
};

export async function handleReviewerAssignmentsGetRequest(request: Request, dependencies: ReviewerAssignmentRouteDependencies = {}) {
  const requireReader = dependencies.requireReader ?? (() => requireApiRole(["reviewer", "admin"]));
  const listAssignments = dependencies.listAssignments ?? listReviewerAssignments;
  const auth = await requireReader();

  if (isApiResponse(auth)) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const reviewerId = searchParams.get("reviewerId") ?? undefined;
  const effectiveReviewerId = auth.role === "reviewer" ? auth.reviewerId : reviewerId;

  if (auth.role === "reviewer" && (!effectiveReviewerId || (reviewerId && reviewerId !== effectiveReviewerId))) {
    return forbiddenError("Reviewers may only access their own assignments.");
  }

  try {
    const assignments = await listAssignments(100, effectiveReviewerId ?? undefined, { client: auth.client });

    return Response.json({ assignments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reviewer assignments.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to load reviewer assignments.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function handleReviewerAssignmentsPostRequest(request: Request, dependencies: ReviewerAssignmentRouteDependencies = {}) {
  const requireAdmin = dependencies.requireAdmin ?? (() => requireApiRole(["admin"]));
  const createAssignment = dependencies.createAssignment ?? createReviewerAssignment;
  const auth = await requireAdmin();

  if (isApiResponse(auth)) {
    return auth;
  }

  const body = await request.json();
  const parsed = CreateReviewerAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Reviewer assignment validation failed.", parsed.error.flatten().fieldErrors);
  }

  try {
    const assignment = await createAssignment(parsed.data, { client: auth.client });

    return Response.json(
      {
        assignment,
        message: "Reviewer assignment saved."
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof DuplicateActiveReviewerAssignmentError) {
      return apiError("validation_error", "Trip already has an active reviewer assignment.", 409);
    }

    if (error instanceof DuplicateActiveReviewerAssignmentDatabaseError) {
      return apiError("validation_error", "Trip already has an active reviewer assignment.", 409);
    }

    const message = error instanceof Error ? error.message : "Failed to create reviewer assignment.";
    return internalError(message.startsWith("Missing required environment variable") ? "Persistence is not configured." : "Failed to create reviewer assignment.", message.startsWith("Missing required environment variable") ? 503 : 500);
  }
}

export async function GET(request: Request) {
  return handleReviewerAssignmentsGetRequest(request);
}

export async function POST(request: Request) {
  return handleReviewerAssignmentsPostRequest(request);
}
