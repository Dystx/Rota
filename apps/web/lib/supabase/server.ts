import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createPublicSupabaseConfig } from "@repo/config/public";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const config = createPublicSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. Middleware refreshes sessions for request paths.
        }
      }
    }
  });
}

export async function getCurrentSupabaseClaims() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    return null;
  }

  return data.claims;
}

/** Read the current user's UUID from the session
 *  claims, or `null` when the user is not signed in.
 *  The page-level redirect to `/login?next=...` lives
 *  in the calling page; this helper is the read-only
 *  primitive that server actions + page server
 *  components share. */
export async function getCurrentUserId(): Promise<string | null> {
  const claims = await getCurrentSupabaseClaims();
  if (!claims) return null;
  // `sub` is the standard JWT subject claim — Supabase
  // sets it to the user's UUID.
  const sub = claims["sub"];
  return typeof sub === "string" ? sub : null;
}
