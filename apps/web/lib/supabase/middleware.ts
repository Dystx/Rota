import { createServerClient } from "@supabase/ssr";
import { createPublicSupabaseConfig } from "@repo/config/public";
import type { ValidatedAuthClaims } from "@/lib/auth/routes";
import { NextResponse, type NextRequest } from "next/server";

type SessionRefreshResult = {
  claims: ValidatedAuthClaims | null;
  response: NextResponse;
};

export async function refreshSupabaseSession(request: NextRequest): Promise<SessionRefreshResult> {
  let response = NextResponse.next({ request });
  const config = createPublicSupabaseConfig();
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headersToSet).forEach(([header, value]) => {
          response.headers.set(header, value);
        });
      }
    }
  });

  const { data, error } = await supabase.auth.getClaims();

  return {
    claims: error || !data ? null : data.claims,
    response,
  };
}
