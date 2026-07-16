import { cache } from "react";
import type { AuthorizedActor } from "@repo/types";
import { loadCurrentAuthorizedActor } from "./authorization";

export type ReviewerPageAuthContext = {
  actor: AuthorizedActor;
  reviewerId: string;
  userId: string;
};

export type ReviewerPageAuthResult =
  | ReviewerPageAuthContext
  | { reason: "unavailable"; status: 503 }
  | null;

export function isReviewerPageAuthContext(result: ReviewerPageAuthResult): result is ReviewerPageAuthContext {
  return Boolean(result && "actor" in result);
}

export const getReviewerPageAuthContext = cache(async (): Promise<ReviewerPageAuthResult> => {
  const outcome = await loadCurrentAuthorizedActor();

  if (outcome.kind === "unavailable") {
    return { reason: "unavailable", status: 503 };
  }

  if (outcome.kind !== "ready" || !outcome.actor.roles.includes("reviewer")) {
    return null;
  }

  const actor = outcome.actor;
  const reviewerId = actor.reviewerId;
  if (!reviewerId) return null;

  return {
    actor,
    reviewerId,
    userId: actor.userId
  };
});
