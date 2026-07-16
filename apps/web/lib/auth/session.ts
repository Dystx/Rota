import "server-only";

import { headers } from "next/headers";

export async function getCurrentSession() {
  const { auth } = await import("@repo/auth/server");

  return auth.api.getSession({
    headers: await headers()
  });
}

/** Server-only Better Auth session shape used by UI-safe outcome wrappers. */
export type CurrentSession = Awaited<ReturnType<typeof getCurrentSession>>;
