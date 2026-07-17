"use server";

import { auth } from "@repo/auth/server";
import { headers } from "next/headers";
import { safeNext } from "../../auth/safe-next";

export type SignInActionResult =
  | { ok: true; next: string }
  | { ok: false; message: string };

const GENERIC_SIGN_IN_ERROR = "We couldn’t sign you in. Check your email and password and try again.";

/**
 * Sign in with Better Auth email/password and preserve the requested route.
 *
 * The `next` parameter preserves the user's intended destination
 * (e.g. `/admin`, `/reviewer`) after the session cookie is set.
 */
export async function signInAction(formData: FormData): Promise<SignInActionResult> {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safeNext(String(formData.get("next") ?? "/account"));

  if (typeof email !== "string" || !email.includes("@") || typeof password !== "string" || password.length < 8) {
    return { ok: false, message: "Enter a valid email and password." };
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
    // Never reflect provider, database, or redirect internals into the form.
    // Authentication failures should be safe to show in production even when
    // the backing service is unavailable.
    void error;
    return { ok: false, message: GENERIC_SIGN_IN_ERROR };
  }

  return { ok: true, next: String(next) };
}
