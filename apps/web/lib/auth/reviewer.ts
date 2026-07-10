import { cache } from "react";
import {
  createAuthenticatedUserDataClient,
  type RotaDataClient
} from "@repo/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadCurrentAuthorizedActor } from "./authorization";

export type ReviewerPageAuthContext = {
  client: RotaDataClient;
  reviewerId: string;
  userId: string;
};

export const getReviewerPageAuthContext = cache(async (): Promise<ReviewerPageAuthContext | null> => {
  const actor = await loadCurrentAuthorizedActor();

  if (!actor?.roles.includes("reviewer") || !actor.reviewerId) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const client = createAuthenticatedUserDataClient(supabase);

  return {
    client,
    reviewerId: actor.reviewerId,
    userId: actor.userId
  };
});
