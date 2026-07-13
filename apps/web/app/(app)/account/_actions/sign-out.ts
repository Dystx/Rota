"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth/server";
import { headers } from "next/headers";

/**
 * Sign-out server action. Better Auth owns the cookie-backed session and
 * nextCookies() writes the clearing Set-Cookie response.
 */
export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  revalidatePath("/", "layout");
  redirect("/");
}
