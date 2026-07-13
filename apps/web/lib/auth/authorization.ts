import "server-only";

import { loadPostgresAuthorizationContext } from "@repo/db";
import type { AppRole, AuthorizedActor, Capability } from "@repo/types";

import { getCurrentSession } from "./session";

export type AccessRequirement = {
  anyRole?: readonly AppRole[];
  allCapabilities?: readonly Capability[];
};

export type AuthorizationDependencies = {
  loadActor: () => Promise<AuthorizedActor | null>;
};

export async function loadCurrentAuthorizedActor(): Promise<AuthorizedActor | null> {
  const session = await getCurrentSession();
  if (!session?.user.id) {
    return null;
  }

  return loadPostgresAuthorizationContext(session.user.id);
}

export async function requireApiAccess(
  requirement: AccessRequirement,
  dependencies: AuthorizationDependencies = { loadActor: loadCurrentAuthorizedActor }
): Promise<AuthorizedActor | Response> {
  const actor = await dependencies.loadActor();

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
