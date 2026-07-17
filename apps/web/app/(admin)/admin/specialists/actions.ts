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
import { isPersistenceConfigError, isSchemaDriftError, setSpecialistVerified } from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { isSessionProviderFailure } from "@/lib/auth/session-outcome";

const FlipInputSchema = z.object({
  specialistId: z.string().uuid("specialistId must be a UUID"),
  verified: z.boolean()
});

export type FlipInput = z.infer<typeof FlipInputSchema>;

export type FlipResult =
  | { kind: "ok"; id: string }
  | { kind: "unauthenticated"; message: "Authentication required." }
  | { kind: "forbidden"; message: "Forbidden." }
  | { kind: "error"; message: string }
  | { kind: "unavailable"; message: string; retryable: true; status: 503 };

const unavailableResult: FlipResult = {
  kind: "unavailable",
  message: "This service is temporarily unavailable. Please try again.",
  retryable: true,
  status: 503
};

export async function flipVerification(
  input: FlipInput
): Promise<FlipResult> {
  const auth = await getAdminPageAuthContext({ allCapabilities: ["specialists:verify"] });
  if ("reason" in auth && auth.reason === "unavailable") {
    return unavailableResult;
  }
  if (!isAdminPageAuthContext(auth)) {
    return auth.reason === "unauthenticated"
      ? { kind: "unauthenticated", message: "Authentication required." }
      : { kind: "forbidden", message: "Forbidden." };
  }

  const parsed = FlipInputSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { kind: "error", message: first?.message ?? "Invalid input" };
  }

  try {
    const updated = await setSpecialistVerified(parsed.data.specialistId, parsed.data.verified, {
      actor: auth.actor
    });
    if (!updated) {
      return { kind: "error", message: "Specialist not found" };
    }
    revalidatePath("/admin/specialists");
    revalidatePath("/guide/onboarding");
    return { kind: "ok", id: updated.id };
  } catch (error) {
    if (isPersistenceConfigError(error) || isSchemaDriftError(error) || isSessionProviderFailure(error)) {
      return unavailableResult;
    }
    return { kind: "error", message: "Could not update specialist verification." };
  }
}
