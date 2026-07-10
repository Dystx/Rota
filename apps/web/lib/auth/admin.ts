import "server-only";

import {
  createAuthenticatedUserDataClient,
  type RotaDataClient
} from "@repo/db";
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadCurrentAuthorizedActor } from "./authorization";

export type AdminPageAuthContext = {
  client: RotaDataClient;
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
  return "client" in result;
}

export const getAdminPageAuthContext = cache(async (): Promise<AdminPageAuthResult> => {
  const actor = await loadCurrentAuthorizedActor();

  if (!actor) {
    return { reason: "unauthenticated", status: 401 };
  }

  if (!actor.roles.includes("admin")) {
    return { reason: "forbidden", status: 403 };
  }

  const supabase = await createServerSupabaseClient();
  const client = createAuthenticatedUserDataClient(supabase);

  return {
    client,
    role: "admin",
    userId: actor.userId
  };
});
