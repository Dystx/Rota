import "server-only";

import { isPersistenceConfigError, loadPostgresAuthorizationContext } from "@repo/db";
import type { AppRole, AuthorizedActor, Capability } from "@repo/types";

import { isSessionProviderFailure, loadSessionOutcome, type SessionOutcome } from "./session-outcome";

export type AccessRequirement = {
  anyRole?: readonly AppRole[];
  allCapabilities?: readonly Capability[];
};

export type AuthorizationDependencies = {
  loadActor?: () => Promise<AuthorizedActor | null>;
  loadActorOutcome?: () => Promise<AuthorizedActorOutcome>;
};

export type AuthorizedActorOutcome =
  | { kind: "ready"; actor: AuthorizedActor }
  | { kind: "anonymous" }
  | { kind: "unavailable" };

/** Session + actor lookup for pages that must distinguish outage from access denial. */
export async function loadCurrentAuthorizedActorOutcome(
  sessionOutcome?: SessionOutcome
): Promise<AuthorizedActorOutcome> {
  const outcome = sessionOutcome ?? (await loadSessionOutcome());
  if (outcome.kind === "unavailable") return { kind: "unavailable" };
  if (outcome.kind === "anonymous") return { kind: "anonymous" };

  try {
    const actor = await loadPostgresAuthorizationContext(outcome.session.user.id);
    return actor ? { kind: "ready", actor } : { kind: "anonymous" };
  } catch (error) {
    if (isPersistenceConfigError(error) || isSessionProviderFailure(error)) {
      return { kind: "unavailable" };
    }
    throw error;
  }
}

/** Compatibility actor helper that preserves unavailable instead of mapping it to anonymous. */
export async function loadCurrentAuthorizedActor(
  sessionOutcome?: SessionOutcome
): Promise<AuthorizedActorOutcome> {
  return loadCurrentAuthorizedActorOutcome(sessionOutcome);
}

export async function requireApiAccess(
  requirement: AccessRequirement,
  dependencies: AuthorizationDependencies = {}
): Promise<AuthorizedActor | Response> {
  const outcome = dependencies.loadActorOutcome
    ? await dependencies.loadActorOutcome()
    : dependencies.loadActor
      ? await dependencies.loadActor().then((actor) => actor ? { kind: "ready", actor } as const : { kind: "anonymous" } as const)
      : await loadCurrentAuthorizedActorOutcome();

  if (outcome.kind === "unavailable") {
    return Response.json({ code: "unavailable", message: "This service is temporarily unavailable." }, { status: 503 });
  }

  const actor = outcome.kind === "ready" ? outcome.actor : null;

  if (!actor) {
    return Response.json({ code: "unauthenticated", message: "Authentication required." }, { status: 401 });
  }

  if (requirement.anyRole && !requirement.anyRole.some((role) => actor.roles.includes(role))) {
    return Response.json({ code: "forbidden", message: "Forbidden." }, { status: 403 });
  }

  if (requirement.allCapabilities?.some((capability) => !actor.capabilities.includes(capability))) {
    return Response.json({ code: "forbidden", message: "Forbidden." }, { status: 403 });
  }

  return actor;
}

export function resourceNotFound() {
  return Response.json({ code: "not_found", message: "Resource not found." }, { status: 404 });
}
