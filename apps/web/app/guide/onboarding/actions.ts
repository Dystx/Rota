"use server";

/**
 * Specialist onboarding server action. Upserts the
 * current user's `specialist_profiles` row. Validates
 * the tier-4 license constraint at the application
 * layer (the DB has a CHECK constraint that catches
 * the same case as a backstop).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/supabase/server";
import { upsertSpecialistProfile } from "@repo/db";

const ProfileInputSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(255),
    regionsCovered: z
      .array(z.string().uuid("Region must be a UUID"))
      .default([]),
    tier3OnCall: z.boolean().default(false),
    tier4LicensedGuide: z.boolean().default(false),
    rnaatLicenseNumber: z
      .string()
      .max(100)
      .nullable()
      .optional(),
    hourlyRate: z
      .number()
      .min(0)
      .max(9999.99)
      .default(0)
  })
  .refine(
    (input) =>
      // Application-layer mirror of the DB CHECK
      // `specialist_profiles_tier4_requires_license`.
      // The DB catches violations too; the
      // application layer gives a friendlier error.
      !input.tier4LicensedGuide ||
      (input.rnaatLicenseNumber !== null &&
        input.rnaatLicenseNumber !== undefined &&
        input.rnaatLicenseNumber.length > 0),
    {
      message: "Tier 4 requires an RNAAT license number",
      path: ["rnaatLicenseNumber"]
    }
  );

export type ProfileInput = z.infer<typeof ProfileInputSchema>;

export type OnboardingResult =
  | { kind: "ok"; id: string }
  | { kind: "error"; message: string };

export async function submitSpecialistProfile(
  input: ProfileInput
): Promise<OnboardingResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { kind: "error", message: "Not signed in" };
  }

  const parsed = ProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      kind: "error",
      message: first?.message ?? "Invalid input"
    };
  }

  try {
    const result = await upsertSpecialistProfile(userId, {
      fullName: parsed.data.fullName,
      regionsCovered: parsed.data.regionsCovered,
      tier3OnCall: parsed.data.tier3OnCall,
      tier4LicensedGuide: parsed.data.tier4LicensedGuide,
      rnaatLicenseNumber:
        parsed.data.tier4LicensedGuide
          ? parsed.data.rnaatLicenseNumber ?? null
          : null,
      hourlyRate: parsed.data.hourlyRate
    });

    revalidatePath("/guide/onboarding");
    revalidatePath("/admin/specialists");
    return { kind: "ok", id: result?.id ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "error", message };
  }
}
