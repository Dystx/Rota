import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseAuthorizationContext } from "@repo/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveRoleCompatibleNext } from "@/lib/auth/role-compatible-next";
import { safeNext } from "../safe-next";

/**
 * /auth/callback — Supabase magic-link return URL.
 *
 * The user clicks the link in their email → Supabase redirects here
 * with `?code=<auth-code>` → we exchange the code for a session cookie,
 * then redirect to the `next` parameter (or `/account` by default).
 *
 * The auth code is single-use; Supabase clears it after this exchange.
 * If the exchange fails (expired, already used, network error), we
 * redirect to `/sign-in?error=<message>` so the user can retry.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getClaims();
      const actor = data?.claims?.sub ? await getDatabaseAuthorizationContext(data.claims.sub) : null;
      return NextResponse.redirect(new URL(actor ? resolveRoleCompatibleNext(next, actor) : "/itineraries", origin));
    }
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`, origin)
    );
  }

  // No code → malformed callback link. Send the user back to sign-in.
  return NextResponse.redirect(
    new URL(`/sign-in?error=${encodeURIComponent("Invalid or expired sign-in link.")}&next=${encodeURIComponent(next)}`, origin)
  );
}
