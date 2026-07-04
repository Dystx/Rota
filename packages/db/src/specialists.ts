/**
 * Specialist profile persistence (PR-11).
 *
 * One row per human specialist in `public.specialist_profiles`.
 * Unifies the v2 split between `reviewers` (Tier 2) and
 * `partners` (Tier 4) — see migration
 * 202607022110_create_specialist_profiles.sql.
 *
 * Three operations:
 *
 *  - `getSpecialistProfileByUserId(userId, options?)` —
 *    reads the current user's row (or null if the user
 *    hasn't onboarded yet).
 *
 *  - `upsertSpecialistProfile(userId, input, options?)` —
 *    writes a draft row with `is_verified = false`. An
 *    admin flips that flag after KYC + license check
 *    (the spec mandates a 48h SLA on this review).
 *
 *  - `listSpecialists(limit?, options?)` — admin-only
 *    listing for the verification queue.
 *
 *  - `setSpecialistVerified(specialistId, verified, options?)` —
 *    admin-only flag flip with an application-layer guard
 *    against the `specialist_profiles_tier4_must_be_verified`
 *    CHECK constraint (a tier 4 row cannot drop
 *    `is_verified` to false).
 *
 * The DB has two CHECK constraints
 * (`specialist_profiles_tier4_requires_license`,
 * `specialist_profiles_tier4_must_be_verified`) that backstop
 * the application-layer checks; the friendly error path lives
 * in the server actions.
 */

import { z } from "zod";
import type { DataClientOptions } from "./index";
import { resolveDataClient } from "./index";

export const SpecialistProfileInputSchema = z.object({
  fullName: z.string().min(1).max(255),
  regionsCovered: z.array(z.string().uuid()).default([]),
  tier3OnCall: z.boolean().default(false),
  tier4LicensedGuide: z.boolean().default(false),
  rnaatLicenseNumber: z.string().max(100).nullable().optional(),
  hourlyRate: z.number().min(0).max(9999.99).default(0)
});

export type SpecialistProfileInput = z.infer<typeof SpecialistProfileInputSchema>;

export interface SpecialistProfile {
  id: string;
  userId: string;
  fullName: string;
  regionsCovered: readonly string[];
  tier3OnCall: boolean;
  tier4LicensedGuide: boolean;
  rnaatLicenseNumber: string | null;
  isVerified: boolean;
  hourlyRate: number;
  createdAt: string;
}

type RawSpecialistRow = {
  id: string;
  user_id: string;
  full_name: string;
  regions_covered: string[];
  tier_3_on_call: boolean;
  tier_4_licensed_guide: boolean;
  rnaat_license_number: string | null;
  is_verified: boolean;
  hourly_rate: number;
  created_at: string;
};

const SELECT_COLUMNS =
  "id,user_id,full_name,regions_covered,tier_3_on_call,tier_4_licensed_guide,rnaat_license_number,is_verified,hourly_rate,created_at" as const;

function parseSpecialistRow(row: RawSpecialistRow): SpecialistProfile {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    regionsCovered: row.regions_covered ?? [],
    tier3OnCall: row.tier_3_on_call,
    tier4LicensedGuide: row.tier_4_licensed_guide,
    rnaatLicenseNumber: row.rnaat_license_number,
    isVerified: row.is_verified,
    hourlyRate: Number(row.hourly_rate),
    createdAt: row.created_at
  };
}

export async function getSpecialistProfileByUserId(
  userId: string,
  options?: DataClientOptions
): Promise<SpecialistProfile | null> {
  const { data, error } = await resolveDataClient(options)
    .from("specialist_profiles")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return parseSpecialistRow(data as RawSpecialistRow);
}

export async function upsertSpecialistProfile(
  userId: string,
  input: SpecialistProfileInput,
  options?: DataClientOptions
): Promise<SpecialistProfile | null> {
  // DB CHECK constraint mirror: tier 4 requires a license.
  if (
    input.tier4LicensedGuide &&
    (!input.rnaatLicenseNumber || input.rnaatLicenseNumber.length === 0)
  ) {
    throw new Error("Tier 4 requires an RNAAT license number");
  }

  const { data, error } = await resolveDataClient(options)
    .from("specialist_profiles")
    .upsert(
      {
        user_id: userId,
        full_name: input.fullName,
        regions_covered: input.regionsCovered,
        tier_3_on_call: input.tier3OnCall,
        tier_4_licensed_guide: input.tier4LicensedGuide,
        rnaat_license_number: input.tier4LicensedGuide
          ? input.rnaatLicenseNumber ?? null
          : null,
        hourly_rate: input.hourlyRate,
        is_verified: false
      },
      { onConflict: "user_id" }
    )
    .select(SELECT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return parseSpecialistRow(data as RawSpecialistRow);
}

/** Admin: list every specialist, newest first. */
export async function listSpecialists(
  limit = 100,
  options?: DataClientOptions
): Promise<SpecialistProfile[]> {
  const { data, error } = await resolveDataClient(options)
    .from("specialist_profiles")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as RawSpecialistRow[] | null) ?? []).map((row) =>
    parseSpecialistRow(row)
  );
}

/**
 * Admin: flip `is_verified` for one specialist.
 *
 * Application-layer guard: a tier-4 row cannot drop
 * `is_verified` to false. The DB CHECK
 * `specialist_profiles_tier4_must_be_verified` is the
 * backstop; we surface the friendlier error first.
 *
 * Returns the updated row, or `null` if no row was
 * affected (specialist not found).
 */
export async function setSpecialistVerified(
  specialistId: string,
  verified: boolean,
  options?: DataClientOptions
): Promise<SpecialistProfile | null> {
  // Pre-flight read so we can fail with a friendly message
  // before the DB CHECK rejects the write.
  const current = await getSpecialistProfileById(specialistId, options);
  if (!current) {
    return null;
  }
  if (current.tier4LicensedGuide && !verified) {
    throw new Error(
      "Cannot unverify a Tier 4 specialist. Drop the Tier 4 flag from the profile first or set hourlyRate/license to 0 via /api/admin."
    );
  }

  const { data, error } = await resolveDataClient(options)
    .from("specialist_profiles")
    .update({ is_verified: verified })
    .eq("id", specialistId)
    .select(SELECT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return parseSpecialistRow(data as RawSpecialistRow);
}

async function getSpecialistProfileById(
  id: string,
  options?: DataClientOptions
): Promise<SpecialistProfile | null> {
  const { data, error } = await resolveDataClient(options)
    .from("specialist_profiles")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return parseSpecialistRow(data as RawSpecialistRow);
}
