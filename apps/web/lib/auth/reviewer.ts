import { cache } from "react";
import type { AuthorizedActor } from "@repo/types";
import { loadCurrentAuthorizedActor } from "./authorization";

export type ReviewerPageAuthContext = {
  actor: AuthorizedActor;
  reviewerId: string;
  userId: string;
};

export const getReviewerPageAuthContext = cache(async (): Promise<ReviewerPageAuthContext | null> => {
  const actor = await loadCurrentAuthorizedActor();

  if (!actor?.roles.includes("reviewer") || !actor.reviewerId) {
    return null;
  }

  return {
    actor,
    reviewerId: actor.reviewerId,
    userId: actor.userId
  };
});
