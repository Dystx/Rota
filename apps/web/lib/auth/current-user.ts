import "server-only";

import { getCurrentSession } from "./session";

export type CurrentUserResult = {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>["user"] | null;
  session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>["session"] | null;
};

/** The single server-side session boundary for page and route consumers. */
export async function getCurrentUser(): Promise<CurrentUserResult> {
  const current = await getCurrentSession();

  return {
    session: current?.session ?? null,
    user: current?.user ?? null
  };
}

export async function getCurrentUserId(): Promise<string | null> {
  const { user } = await getCurrentUser();
  return user?.id ?? null;
}
