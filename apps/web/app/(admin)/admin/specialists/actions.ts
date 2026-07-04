"use server";

/**
 * Server action: admin flips a specialist's `is_verified`
 * flag. The admin layout (`apps/web/app/(admin)/admin/layout.tsx`)
 * already gates the page on `getAdminPageAuthContext`; this
 * action re-checks the role server-side because server
 * actions can be invoked outside of a page render and the
 * client-side layout is not a security boundary.
 *
 * Revalidates `/admin/specialists` (this page) and
 * `/guide/onboarding` (the specialist's own page reads
 * `is_verified` to decide between "Pending" and "Verified"
 * banners).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { setSpecialistVerified } from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

const FlipInputSchema = z.object({
  specialistId: z.string().uuid("specialistId must be a UUID"),
  verified: z.boolean()
});

export type FlipInput = z.infer<typeof FlipInputSchema>;

export type FlipResult =
  | { kind: "ok"; id: string }
  | { kind: "error"; message: string };

export async function flipVerification(
  input: FlipInput
): Promise<FlipResult> {
  const auth = await getAdminPageAuthContext();
  if (!isAdminPageAuthContext(auth)) {
    return { kind: "error", message: "Admin only" };
  }

  const parsed = FlipInputSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { kind: "error", message: first?.message ?? "Invalid input" };
  }

  try {
    const updated = await setSpecialistVerified(parsed.data.specialistId, parsed.data.verified, {
      client: auth.client
    });
    if (!updated) {
      return { kind: "error", message: "Specialist not found" };
    }
    revalidatePath("/admin/specialists");
    revalidatePath("/guide/onboarding");
    return { kind: "ok", id: updated.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "error", message };
  }
}
