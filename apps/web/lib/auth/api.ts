import "server-only";

import {
  createAuthenticatedUserDataClient,
  getReviewerIdForUser,
  getTrustedAppRoleFromClaims,
  getUserRoleProfile,
  type RotaDataClient
} from "@repo/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ApiErrorCode = "unauthenticated" | "forbidden" | "validation_error" | "not_found" | "internal_error";

export type ApiActor = "traveler" | "reviewer" | "admin";

export type AuthorizedApiContext = {
  client: RotaDataClient;
  reviewerId: string | null;
  role: ApiActor;
  userId: string;
};

export function apiError(code: ApiErrorCode, message: string, status: number, details?: unknown) {
  return Response.json(
    {
      error: {
        code,
        details,
        message
      }
    },
    { status }
  );
}

export function unauthenticatedError(message = "Authentication required.") {
  return apiError("unauthenticated", message, 401);
}

export function forbiddenError(message = "Forbidden.") {
  return apiError("forbidden", message, 403);
}

export function validationError(message: string, details?: unknown) {
  return apiError("validation_error", message, 400, details);
}

export function notFoundError(message: string) {
  return apiError("not_found", message, 404);
}

export function internalError(message = "Unexpected server error.", status = 500) {
  return apiError("internal_error", message, status);
}

export function persistenceError(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const status = message.startsWith("Missing required environment variable") ? 503 : 500;

  return internalError(status === 503 ? "Persistence is not configured." : fallbackMessage, status);
}

export async function requireApiRole(allowedRoles: ApiActor[]): Promise<AuthorizedApiContext | Response> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return unauthenticatedError();
  }

  const client = createAuthenticatedUserDataClient(supabase);
  const claimsRole = getTrustedAppRoleFromClaims(data.claims);
  const profile = claimsRole === "none" ? await getUserRoleProfile(data.claims.sub, { client }) : null;
  const role = claimsRole === "none" ? profile?.appRole ?? "none" : claimsRole;

  if (role === "none" || !allowedRoles.includes(role)) {
    return forbiddenError();
  }

  return {
    client,
    reviewerId: role === "reviewer" ? await getReviewerIdForUser(data.claims.sub, { client }) : null,
    role,
    userId: data.claims.sub
  };
}

export function isApiResponse(value: AuthorizedApiContext | Response): value is Response {
  return value instanceof Response;
}
