import "server-only";

import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Result of getCurrentUser — the user (if signed in) plus the
 * underlying Supabase client so the caller can do additional
 * queries in the same request without re-creating the client.
 *
 * `user` is the canonical `supabase.auth.getUser()` result —
 * `null` when the visitor is anonymous. Note this is the
 * cookie-backed client, not the service-role client; for
 * privileged server-side work use `createPrivilegedServerDataClient`
 * from @repo/db instead.
 */
export type CurrentUserResult = {
  user: User | null;
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
};

/**
 * getCurrentUser — the single replacement for the
 * `createServerSupabaseClient() + supabase.auth.getUser()` pattern
 * that was duplicated across 10+ page.tsx files. Each call site
 * drops from 4 lines to 1:
 *
 *   const { user } = await getCurrentUser();
 *
 * Why a separate helper rather than just inlining: the SSR
 * Supabase client has subtle requirements (cookies, the
 * Next.js 16 async-cookies API) that callers frequently get
 * wrong. Centralising it means the cookie contract is enforced
 * in one place and callers can't drift.
 */
export async function getCurrentUser(): Promise<CurrentUserResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return { user, supabase };
}
