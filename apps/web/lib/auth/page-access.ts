import "server-only";

import type { AuthorizedActor, AppRole } from "@repo/types";
import {
  HTTP_ROUTE_CATALOGUE,
  type HttpRouteDefinition
} from "@/lib/routes/http-route-catalogue";
import {
  loadCurrentAuthorizedActorOutcome,
  type AccessRequirement,
  type AuthorizedActorOutcome,
  type AuthorizationDependencies
} from "./authorization";

export type PageAccessResult =
  | { kind: "ready"; actor: AuthorizedActor }
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "unavailable" };

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] ?? pathname;
  if (!withoutQuery || withoutQuery === "/") return "/";
  return `/${withoutQuery.split("/").filter(Boolean).join("/")}`;
}

function matchesCataloguePath(pattern: string, pathname: string): boolean {
  const patternParts = normalizePathname(pattern).split("/").filter(Boolean);
  const pathnameParts = normalizePathname(pathname).split("/").filter(Boolean);
  if (patternParts.length !== pathnameParts.length) return false;

  return patternParts.every((part, index) => {
    const candidate = pathnameParts[index];
    return Boolean(candidate) && (part.startsWith("[") && part.endsWith("]") || part === candidate);
  });
}

/** Resolve a request pathname against the one HTTP route catalogue. */
export function resolveHttpRoute(pathname: string): HttpRouteDefinition | null {
  const normalized = normalizePathname(pathname);
  return HTTP_ROUTE_CATALOGUE.find((route) => matchesCataloguePath(route.path, normalized)) ?? null;
}

function rolesForRoute(route: HttpRouteDefinition): readonly AppRole[] | undefined {
  switch (route.auth) {
    case "admin":
      return ["admin"];
    case "reviewer":
      return ["reviewer"];
    case "owner":
      return ["traveler"];
    default:
      return undefined;
  }
}

/** Convert the catalogue's auth metadata into the shared page requirement. */
export function requirementForHttpRoute(pathname: string): AccessRequirement | null {
  const route = resolveHttpRoute(pathname);
  if (!route) return null;

  const anyRole = rolesForRoute(route);
  return {
    ...(anyRole ? { anyRole } : {}),
    ...(route.capability ? { allCapabilities: [route.capability] } : {})
  };
}

export type PageAccessDependencies = AuthorizationDependencies;

export async function requirePageAccess(
  requirement: AccessRequirement,
  dependencies: PageAccessDependencies = { loadActorOutcome: loadCurrentAuthorizedActorOutcome }
): Promise<PageAccessResult> {
  const outcome: AuthorizedActorOutcome = dependencies.loadActorOutcome
    ? await dependencies.loadActorOutcome()
    : dependencies.loadActor
      ? await dependencies.loadActor().then((actor) => actor ? { kind: "ready", actor } as const : { kind: "anonymous" } as const)
      : await loadCurrentAuthorizedActorOutcome();

  if (outcome.kind === "unavailable") return { kind: "unavailable" };
  if (outcome.kind === "anonymous") return { kind: "unauthenticated" };

  const { actor } = outcome;
  if (requirement.anyRole && !requirement.anyRole.some((role) => actor.roles.includes(role))) {
    return { kind: "forbidden" };
  }
  if (requirement.allCapabilities?.some((capability) => !actor.capabilities.includes(capability))) {
    return { kind: "forbidden" };
  }

  return { kind: "ready", actor };
}
