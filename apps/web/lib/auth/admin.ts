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
      reason: "unauthenticated" | "forbidden" | "unavailable";
      status: 401 | 403 | 503;
    };

export function isAdminPageAuthContext(result: AdminPageAuthResult): result is AdminPageAuthContext {
  return "actor" in result;
}

export const getAdminPageAuthContext = cache(async (): Promise<AdminPageAuthResult> => {
  const outcome = await loadCurrentAuthorizedActor();

  if (outcome.kind === "unavailable") {
    return { reason: "unavailable", status: 503 };
  }

  if (outcome.kind === "anonymous") {
    return { reason: "unauthenticated", status: 401 };
  }

  const actor = outcome.actor;

  if (!actor.roles.includes("admin")) {
    return { reason: "forbidden", status: 403 };
  }

  return {
    actor,
    role: "admin",
    userId: actor.userId
  };
});
