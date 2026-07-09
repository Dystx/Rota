"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNext } from "../../auth/safe-next";

/**
 * signInWithMagicLinkAction — sends a one-time sign-in link to the
 * submitted email via Supabase Auth's `signInWithOtp` flow.
 *
 * On success, redirects to `/sign-in?sent=1&next=<next>` so the page
 * can show a "check your inbox" confirmation. On failure, redirects
 * with `error=<message>` so the page can show an error banner.
 *
 * The `next` parameter preserves the user's intended destination
 * (e.g. `/admin`, `/reviewer`) so the middleware can route them back
 * after they click the magic link.
 */
export async function signInWithMagicLinkAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const next = safeNext(String(formData.get("next") ?? "/account"));

  if (typeof email !== "string" || !email.includes("@")) {
    redirect(`/sign-in?error=${encodeURIComponent("Please enter a valid email address.")}&next=${encodeURIComponent(String(next))}`);
  }

  const supabase = await createServerSupabaseClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3105";

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(String(next))}`
    }
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(String(next))}`);
  }

  redirect(`/sign-in?sent=1&next=${encodeURIComponent(String(next))}`);
}
