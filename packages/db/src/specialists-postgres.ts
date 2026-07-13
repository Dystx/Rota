import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { withActor, type DatabaseActor } from "./actor";
import { specialistCapabilities, specialistProfiles } from "./schema";
import type { SpecialistCapabilities, SpecialistProfile, SpecialistProfileInput } from "./specialists";

const languageValues = ["pt", "en", "es", "fr", "it", "de"] as const;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ensureUuid(value: string, label: string): string {
  const normalized = value.trim();
  if (!uuidPattern.test(normalized)) {
    throw new Error(`${label} must be a UUID.`);
  }
  return normalized;
}

function canVerify(actor: DatabaseActor): boolean {
  return actor.capabilities.includes("specialists:verify");
}

function parseProfile(row: typeof specialistProfiles.$inferSelect): SpecialistProfile {
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    regionsCovered: row.regionsCovered ?? [],
    tier3OnCall: row.tier3OnCall,
    tier4LicensedGuide: row.tier4LicensedGuide,
    rnaatLicenseNumber: row.rnaatLicenseNumber,
    isVerified: row.isVerified,
    hourlyRate: Number(row.hourlyRate),
    bio: row.bio,
    photoUrl: row.photoUrl,
    createdAt: row.createdAt.toISOString()
  };
}

function parseCapabilities(rows: Array<{ type: string; value: string }>): SpecialistCapabilities {
  const skills: string[] = [];
  const languages: string[] = [];
  for (const row of rows) {
    if (row.type === "skill") skills.push(row.value);
    if (row.type === "language") languages.push(row.value);
  }
  return { skills, languages };
}

function normalizeProfileInput(input: SpecialistProfileInput) {
  const parsed = z.object({
    fullName: z.string().min(1).max(255),
    regionsCovered: z.array(z.string().uuid()),
    tier3OnCall: z.boolean(),
    tier4LicensedGuide: z.boolean(),
    rnaatLicenseNumber: z.string().max(100).nullable().optional(),
    hourlyRate: z.number().min(0).max(9999.99),
    bio: z.string().max(2000).nullable().optional(),
    photoUrl: z.string().max(300).nullable().optional()
  }).parse(input);

  if (parsed.tier4LicensedGuide && !parsed.rnaatLicenseNumber?.trim()) {
    throw new Error("Tier 4 requires an RNAAT license number");
  }

  return {
    ...parsed,
    fullName: parsed.fullName.trim(),
    rnaatLicenseNumber: parsed.tier4LicensedGuide ? parsed.rnaatLicenseNumber?.trim() ?? null : null,
    bio: parsed.bio?.trim() || null,
    photoUrl: parsed.photoUrl?.trim() || null
  };
}

export async function getPostgresSpecialistProfileByUserId(
  userId: string,
  actor: DatabaseActor
): Promise<SpecialistProfile | null> {
  const normalizedUserId = ensureUuid(userId, "User ID");
  return withActor(actor, async ({ db }) => {
    const [row] = await db.select().from(specialistProfiles).where(eq(specialistProfiles.userId, normalizedUserId)).limit(1);
    return row ? parseProfile(row) : null;
  });
}

export async function upsertPostgresSpecialistProfile(
  userId: string,
  input: SpecialistProfileInput,
  actor: DatabaseActor
): Promise<SpecialistProfile | null> {
  const normalizedUserId = ensureUuid(userId, "User ID");
  if (normalizedUserId !== actor.userId && !canVerify(actor)) {
    return null;
  }
  const profile = normalizeProfileInput(input);

  return withActor(actor, async ({ db }) => {
    const [row] = await db
      .insert(specialistProfiles)
      .values({
        userId: normalizedUserId,
        fullName: profile.fullName,
        regionsCovered: profile.regionsCovered,
        tier3OnCall: profile.tier3OnCall,
        tier4LicensedGuide: profile.tier4LicensedGuide,
        rnaatLicenseNumber: profile.rnaatLicenseNumber,
        hourlyRate: profile.hourlyRate,
        bio: profile.bio,
        photoUrl: profile.photoUrl,
        isVerified: false
      })
      .onConflictDoUpdate({
        target: specialistProfiles.userId,
        set: {
          fullName: profile.fullName,
          regionsCovered: profile.regionsCovered,
          tier3OnCall: profile.tier3OnCall,
          tier4LicensedGuide: profile.tier4LicensedGuide,
          rnaatLicenseNumber: profile.rnaatLicenseNumber,
          hourlyRate: profile.hourlyRate,
          bio: profile.bio,
          photoUrl: profile.photoUrl
        }
      })
      .returning();

    return row ? parseProfile(row) : null;
  });
}

export async function listPostgresSpecialists(limit = 100, actor: DatabaseActor): Promise<SpecialistProfile[]> {
  if (!canVerify(actor)) return [];
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  return withActor(actor, async ({ db }) => {
    const rows = await db.select().from(specialistProfiles).orderBy(desc(specialistProfiles.createdAt)).limit(safeLimit);
    return rows.map(parseProfile);
  });
}

export async function setPostgresSpecialistVerified(
  specialistId: string,
  verified: boolean,
  actor: DatabaseActor
): Promise<SpecialistProfile | null> {
  if (!canVerify(actor)) {
    throw new Error("Specialist verification requires specialists:verify.");
  }
  const normalizedId = ensureUuid(specialistId, "Specialist ID");

  return withActor(actor, async ({ db }) => {
    const [current] = await db.select().from(specialistProfiles).where(eq(specialistProfiles.id, normalizedId)).limit(1);
    if (!current) return null;
    if (current.tier4LicensedGuide && !verified) {
      throw new Error(
        "Cannot unverify a Tier 4 specialist. Drop the Tier 4 flag from the profile first or set hourlyRate/license to 0 via /api/admin."
      );
    }
    const [updated] = await db
      .update(specialistProfiles)
      .set({ isVerified: verified })
      .where(eq(specialistProfiles.id, normalizedId))
      .returning();
    return updated ? parseProfile(updated) : null;
  });
}

export async function getPostgresSpecialistCapabilities(
  specialistId: string,
  actor: DatabaseActor
): Promise<SpecialistCapabilities> {
  const normalizedId = ensureUuid(specialistId, "Specialist ID");
  return withActor(actor, async ({ db }) => {
    const rows = await db
      .select({ type: specialistCapabilities.type, value: specialistCapabilities.value })
      .from(specialistCapabilities)
      .where(eq(specialistCapabilities.specialistId, normalizedId))
      .orderBy(asc(specialistCapabilities.type), asc(specialistCapabilities.value));
    return parseCapabilities(rows);
  });
}

export async function setPostgresSpecialistCapabilities(
  specialistId: string,
  type: "skill" | "language",
  values: readonly string[],
  actor: DatabaseActor
): Promise<void> {
  const normalizedId = ensureUuid(specialistId, "Specialist ID");
  const normalizedValues = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  if (type === "language" && normalizedValues.some((value) => !languageValues.includes(value as (typeof languageValues)[number]))) {
    throw new Error("Language must be one of pt, en, es, fr, it, de");
  }
  if (type === "skill" && normalizedValues.some((value) => value.length > 80)) {
    throw new Error("Skill must be 80 characters or fewer");
  }

  return withActor(actor, async ({ db }) => {
    const [profile] = await db.select({ id: specialistProfiles.id }).from(specialistProfiles).where(eq(specialistProfiles.id, normalizedId)).limit(1);
    if (!profile) return;
    await db
      .delete(specialistCapabilities)
      .where(and(eq(specialistCapabilities.specialistId, normalizedId), eq(specialistCapabilities.type, type)));
    if (normalizedValues.length > 0) {
      await db.insert(specialistCapabilities).values(
        normalizedValues.map((value) => ({ specialistId: normalizedId, type, value }))
      );
    }
  });
}
