import "server-only";

import { headers } from "next/headers";

export async function getCurrentSession() {
  const { auth } = await import("@repo/auth/server");

  return auth.api.getSession({
    headers: await headers()
  });
}
