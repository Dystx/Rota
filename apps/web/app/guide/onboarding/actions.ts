"use server";

/**
 * Specialist onboarding server action. Upserts the
 * current user's `specialist_profiles` row and replaces
 * the specialist_capabilities rows for skills and
 * languages. Validates the tier-4 license constraint at
 * the application layer (the DB has a CHECK constraint
 * that catches the same case as a backstop).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/supabase/server";
import {
  getSpecialistCapabilities,
  setSpecialistCapabilities,
  upsertSpecialistProfile
} from "@repo/db";

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
      .default(0),
    bio: z
      .string()
      .max(2000, "Bio must be 2000 characters or fewer")
      .nullable()
      .optional(),
    /** A path returned by uploadSpecialistPortrait. External URLs are not
     * accepted; portraits belong to the authenticated user's storage folder. */
    photoPath: z
      .string()
      .max(300, "Portrait path is too long")
      .regex(
        /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/i,
        "Upload a portrait from your device"
      )
      .nullable()
      .optional()
      .or(z.literal("")),
    skills: z
      .array(z.string().min(1).max(80))
      .max(20, "Pick at most 20 skills")
      .default([]),
    languages: z
      .array(z.string().min(1).max(5))
      .default([])
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
  )
  .refine(
    (input) => {
      // Application-layer mirror of the DB CHECK on
      // specialist_capabilities.value when type='language'.
      const allowed = ["pt", "en", "es", "fr", "it", "de"];
      return input.languages.every((l) => allowed.includes(l));
    },
    {
      message: "Language must be one of pt, en, es, fr, it, de",
      path: ["languages"]
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

  if (
    parsed.data.photoPath &&
    parsed.data.photoPath.length > 0 &&
    !parsed.data.photoPath.startsWith(`${userId}/`)
  ) {
    return { kind: "error", message: "Portrait path is not owned by this account" };
  }

  try {
    // 1. Upsert the profile (carries the private Storage object path in the
    // legacy photo_url column; no external URL is accepted or persisted).
    const result = await upsertSpecialistProfile(userId, {
      fullName: parsed.data.fullName,
      regionsCovered: parsed.data.regionsCovered,
      tier3OnCall: parsed.data.tier3OnCall,
      tier4LicensedGuide: parsed.data.tier4LicensedGuide,
      rnaatLicenseNumber:
        parsed.data.tier4LicensedGuide
          ? parsed.data.rnaatLicenseNumber ?? null
          : null,
      hourlyRate: parsed.data.hourlyRate,
      bio: parsed.data.bio?.length ? parsed.data.bio : null,
      photoUrl:
        parsed.data.photoPath && parsed.data.photoPath.length > 0
          ? parsed.data.photoPath
          : null
    });

    // 2. Replace the capabilities rows (skills + languages)
    //    if the profile upsert returned a row id. The
    //    onboarding flow is "always upsert the user_id" so
    //    `result.id` is the new specialist row's primary key.
    if (result?.id) {
      await setSpecialistCapabilities(result.id, "skill", parsed.data.skills);
      await setSpecialistCapabilities(
        result.id,
        "language",
        parsed.data.languages
      );
    }

    revalidatePath("/guide/onboarding");
    revalidatePath("/admin/specialists");
    return { kind: "ok", id: result?.id ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "error", message };
  }
}

/**
 * Server-side read of the current specialist's
 * capabilities. Used by the page (server component)
 * to seed the form state.
 */
export async function loadSpecialistCapabilities(): Promise<{
  skills: readonly string[];
  languages: readonly string[];
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { skills: [], languages: [] };
  const { getSpecialistProfileByUserId } = await import("@repo/db");
  const profile = await getSpecialistProfileByUserId(userId);
  if (!profile) return { skills: [], languages: [] };
  const caps = await getSpecialistCapabilities(profile.id);
  return { skills: caps.skills, languages: caps.languages };
}
