import "server-only";

import type { CurrentSession } from "./session";
import { loadSessionOutcome, type SessionOutcome } from "./session-outcome";

type CurrentUser = NonNullable<CurrentSession>["user"];
type CurrentSessionRecord = NonNullable<CurrentSession>["session"];

export type CurrentUserResult = {
  outcome: SessionOutcome["kind"];
  /** The exact probe result lets actor lookups reuse the same request outcome. */
  sessionOutcome: SessionOutcome;
  user: CurrentUser | null;
  session: CurrentSessionRecord | null;
};

export type CurrentUserIdOutcome =
  | { kind: "ready"; userId: string }
  | { kind: "anonymous" }
  | { kind: "unavailable" };

/** The single server-side session boundary for page and route consumers. */
export async function getCurrentUser(): Promise<CurrentUserResult> {
  const outcome = await loadSessionOutcome();

  if (outcome.kind !== "ready") {
    return {
      outcome: outcome.kind,
      sessionOutcome: outcome,
      session: null,
      user: null
    };
  }

  return {
    outcome: "ready",
    sessionOutcome: outcome,
    session: outcome.session.session ?? null,
    user: outcome.session.user ?? null
  };
}

export async function getCurrentUserId(): Promise<CurrentUserIdOutcome> {
  const current = await getCurrentUser();
  if (current.outcome === "unavailable") return { kind: "unavailable" };
  if (!current.user) return { kind: "anonymous" };
  return { kind: "ready", userId: current.user.id };
}
