import "server-only";

import type { AuthorizedActor } from "@repo/types";
import { createApiErrorEnvelope } from "@/lib/http/api-error";
import { requireApiAccess } from "./authorization";

export type ApiErrorCode = "unauthenticated" | "forbidden" | "validation_error" | "not_found" | "internal_error";

export type ApiActor = "traveler" | "reviewer" | "admin";

export type AuthorizedApiContext = {
  actor: AuthorizedActor;
  reviewerId: string | null;
  role: ApiActor;
  userId: string;
};

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  fieldErrors?: Record<string, readonly string[] | undefined>
) {
  const normalizedFieldErrors = fieldErrors
    ? Object.fromEntries(
        Object.entries(fieldErrors).filter((entry): entry is [string, readonly string[]] => Array.isArray(entry[1]))
      )
    : undefined;

  return Response.json(createApiErrorEnvelope(code, message, normalizedFieldErrors), { status });
}

export function unauthenticatedError(message = "Authentication required.") {
  return apiError("unauthenticated", message, 401);
}

export function forbiddenError(message = "Forbidden.") {
  return apiError("forbidden", message, 403);
}

export function validationError(message: string, fieldErrors?: Record<string, readonly string[] | undefined>) {
  return apiError("validation_error", message, 400, fieldErrors);
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
  const access = await requireApiAccess({ anyRole: allowedRoles });

  if (access instanceof Response) {
    return access;
  }

  const role = access.roles.find((candidate): candidate is ApiActor => allowedRoles.includes(candidate));

  if (!role) {
    return forbiddenError();
  }

  return {
    actor: access,
    reviewerId: access.reviewerId,
    role,
    userId: access.userId
  };
}

export function isApiResponse(value: AuthorizedApiContext | Response): value is Response {
  return value instanceof Response;
}
