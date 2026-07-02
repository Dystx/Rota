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
