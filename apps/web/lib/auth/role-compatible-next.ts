import type { AuthorizedActor } from "@repo/types";

import { safeNext } from "@/app/auth/safe-next";

function pathIsCompatible(pathname: string, actor: AuthorizedActor): boolean {
  if (pathname.startsWith("/admin") || pathname.startsWith("/console")) return actor.roles.includes("admin");
  if (pathname.startsWith("/reviewer")) return actor.roles.includes("reviewer");
  if (pathname.startsWith("/b2b/")) return false;
  return true;
}

export function resolveRoleCompatibleNext(next: string | null | undefined, actor: AuthorizedActor): string {
  const target = safeNext(next);
  const pathname = target.split("?", 1)[0] ?? "/itineraries";
  return pathIsCompatible(pathname, actor) ? target : actor.roles.includes("admin") ? "/admin/places" : actor.roles.includes("reviewer") ? "/reviewer/queue" : "/itineraries";
}
