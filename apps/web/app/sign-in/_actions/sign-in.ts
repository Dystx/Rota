"use server";

import { redirect } from "next/navigation";
import { auth } from "@repo/auth/server";
import { headers } from "next/headers";
import { safeNext } from "../../auth/safe-next";

/**
 * Sign in with Better Auth email/password and preserve the requested route.
 *
 * The `next` parameter preserves the user's intended destination
 * (e.g. `/admin`, `/reviewer`) after the session cookie is set.
 */
export async function signInAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safeNext(String(formData.get("next") ?? "/account"));

  if (typeof email !== "string" || !email.includes("@") || typeof password !== "string" || password.length < 8) {
    redirect(`/sign-in?error=${encodeURIComponent("Enter a valid email and password.")}&next=${encodeURIComponent(String(next))}`);
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: email.trim().toLowerCase(),
        password
      },
      headers: await headers()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign-in failed.";
    redirect(`/sign-in?error=${encodeURIComponent(message)}&next=${encodeURIComponent(String(next))}`);
  }

  redirect(String(next));
}
