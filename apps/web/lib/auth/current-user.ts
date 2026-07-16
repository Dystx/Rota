import "server-only";

import type { CurrentSession } from "./session";
import { loadSessionOutcome, type SessionOutcome } from "./session-outcome";

type CurrentUser = NonNullable<CurrentSession>["user"];
type CurrentSessionRecord = NonNullable<CurrentSession>["session"];

export type CurrentUserResult = {
  outcome: SessionOutcome["kind"];
  user: CurrentUser | null;
  session: CurrentSessionRecord | null;
};

/** The single server-side session boundary for page and route consumers. */
export async function getCurrentUser(): Promise<CurrentUserResult> {
  const outcome = await loadSessionOutcome();

  if (outcome.kind !== "ready") {
    return {
      outcome: outcome.kind,
      session: null,
      user: null
    };
  }

  return {
    outcome: "ready",
    session: outcome.session.session ?? null,
    user: outcome.session.user ?? null
  };
}

export async function getCurrentUserId(): Promise<string | null> {
  const { user } = await getCurrentUser();
  return user?.id ?? null;
}
