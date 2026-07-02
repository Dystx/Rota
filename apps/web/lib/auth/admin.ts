import "server-only";

import {
  createAuthenticatedUserDataClient,
  getTrustedAppRoleFromClaims,
  getUserRoleProfile,
  type RotaDataClient
} from "@repo/db";
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return {
      reason: "unauthenticated",
      status: 401
    };
  }

  const client = createAuthenticatedUserDataClient(supabase);
  const claimsRole = getTrustedAppRoleFromClaims(data.claims);
  const profile = claimsRole === "none" ? await getUserRoleProfile(data.claims.sub, { client }) : null;
  const role = claimsRole === "none" ? profile?.appRole ?? "none" : claimsRole;

  if (role !== "admin") {
    return {
      reason: "forbidden",
      status: 403
    };
  }

  return {
    client,
    role,
    userId: data.claims.sub
  };
});
