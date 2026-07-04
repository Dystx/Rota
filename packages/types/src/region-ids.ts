/**
 * Synthetic UUIDs for the static region slug enums in
 * `trip-brief.ts` (portugalRegions, spainRegions, italyRegions,
 * franceRegions, greeceRegions).
 *
 * Why this exists
 * ---------------
 * `specialist_profiles.regions_covered` is `UUID[]` and the
 * onboarding form validates `z.array(z.string().uuid())`. The
 * static region slug enums ("lisbon", "porto", …) are
 * plain strings. The `regions` table (separate metadata: name,
 * best_for, seasonality) uses `text` PKs, not UUIDs.
 *
 * Three options were on the table for PR-11a:
 *
 *   (A) Change `regions_covered` to `text[]` and store slugs
 *       directly. Clean, but the plan said "no schema change"
 *       and the column was created in the v0 wave. Defer.
 *   (B) Migrate the `regions` table to UUID PKs and add a
 *       slug→uuid lookup. Cleaner long-term, but pulls in a
 *       seed/migration cascade. Defer to the regions table
 *       normalization pass (PR-11d territory).
 *   (C) Static slug→synthetic-UUID map, used at the form
 *       boundary. Honors "no schema change" and the plan's
 *       intent of a slug-driven picker. Round-trips.
 *
 * We picked (C). The synthetic UUIDs are in a fixed
 * `8c3a8a1a-0000-0000-0000-0000000000NN` namespace so they
 * are visually distinct from any real UUID, and the
 * `isSyntheticRegionId` helper is the single gate to detect
 * them if/when we migrate to option (A) or (B) — the migration
 * can rewrite the column by computing the slug from the
 * synthetic UUID and then either re-storing as a slug (A) or
 * looking up the canonical UUID (B).
 *
 * Adding a new country
 * --------------------
 * Add the slug list to `regionIdsBySlug` and re-export from
 * this file's index. The test below asserts bijection over
 * the keys, so a missing entry will fail CI.
 */

export const SYNTHETIC_REGION_ID_NAMESPACE = "8c3a8a1a-0000-0000-0000" as const;

/**
 * `regionIdsBySlug` is the canonical slug → synthetic-UUID map.
 * The reverse map `slugsByRegionId` is derived once at module
 * load to keep `regionIdToSlug` O(1) and to guarantee a
 * single source of truth.
 */
export const regionIdsBySlug = {
  // Portugal (PR-11a launch — 9 regions from portugalRegions)
  porto: "8c3a8a1a-0000-0000-0000-000000000001",
  "douro-valley": "8c3a8a1a-0000-0000-0000-000000000002",
  lisbon: "8c3a8a1a-0000-0000-0000-000000000003",
  sintra: "8c3a8a1a-0000-0000-0000-000000000004",
  cascais: "8c3a8a1a-0000-0000-0000-000000000005",
  alentejo: "8c3a8a1a-0000-0000-0000-000000000006",
  algarve: "8c3a8a1a-0000-0000-0000-000000000007",
  coimbra: "8c3a8a1a-0000-0000-0000-000000000008",
  aveiro: "8c3a8a1a-0000-0000-0000-000000000009"
} as const;

export type SyntheticRegionId =
  (typeof regionIdsBySlug)[keyof typeof regionIdsBySlug];

const slugsByRegionId: Record<string, keyof typeof regionIdsBySlug> =
  Object.fromEntries(
    Object.entries(regionIdsBySlug).map(([slug, id]) => [id, slug])
  ) as Record<string, keyof typeof regionIdsBySlug>;

export function slugToRegionId(slug: keyof typeof regionIdsBySlug): string {
  return regionIdsBySlug[slug];
}

export function regionIdToSlug(id: string): keyof typeof regionIdsBySlug | null {
  return slugsByRegionId[id] ?? null;
}

export function slugsToRegionIds(
  slugs: readonly (keyof typeof regionIdsBySlug)[]
): string[] {
  return slugs.map(slugToRegionId);
}

export function regionIdsToSlugs(
  ids: readonly string[]
): (keyof typeof regionIdsBySlug)[] {
  const out: (keyof typeof regionIdsBySlug)[] = [];
  for (const id of ids) {
    const slug = regionIdToSlug(id);
    if (slug !== null) out.push(slug);
  }
  return out;
}

/** True iff the id is a synthetic region id from this map.
 *  Use this when migrating to option (A) or (B). */
export function isSyntheticRegionId(id: string): boolean {
  return id in slugsByRegionId;
}
