import { cache } from "react";
import {
  createAuthenticatedUserDataClient,
  getReviewerIdForUser,
  getTrustedAppRoleFromClaims,
  getUserRoleProfile,
  type RotaDataClient
} from "@repo/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ReviewerPageAuthContext = {
  client: RotaDataClient;
  reviewerId: string;
  userId: string;
};

export const getReviewerPageAuthContext = cache(async (): Promise<ReviewerPageAuthContext | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  const client = createAuthenticatedUserDataClient(supabase);
  const claimsRole = getTrustedAppRoleFromClaims(data.claims);
  const profile = claimsRole === "none" ? await getUserRoleProfile(data.claims.sub, { client }) : null;
  const role = claimsRole === "none" ? profile?.appRole ?? "none" : claimsRole;
  const reviewerId = role === "reviewer" ? await getReviewerIdForUser(data.claims.sub, { client }) : null;

  if (!reviewerId) {
    return null;
  }

  return {
    client,
    reviewerId,
    userId: data.claims.sub
  };
});
