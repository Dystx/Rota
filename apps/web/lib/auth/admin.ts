import "server-only";

import type { AuthorizedActor } from "@repo/types";
import { cache } from "react";
import { loadCurrentAuthorizedActor } from "./authorization";

export type AdminPageAuthContext = {
  actor: AuthorizedActor;
  role: "admin";
  userId: string;
};

export type AdminPageAuthResult =
  | AdminPageAuthContext
  | {
      reason: "unauthenticated" | "forbidden";
      status: 401 | 403;
    };

export function isAdminPageAuthContext(result: AdminPageAuthResult): result is AdminPageAuthContext {
  return "actor" in result;
}

export const getAdminPageAuthContext = cache(async (): Promise<AdminPageAuthResult> => {
  const actor = await loadCurrentAuthorizedActor();

  if (!actor) {
    return { reason: "unauthenticated", status: 401 };
  }

  if (!actor.roles.includes("admin")) {
    return { reason: "forbidden", status: 403 };
  }

  return {
    actor,
    role: "admin",
    userId: actor.userId
  };
});
