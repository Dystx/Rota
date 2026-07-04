/**
 * Shared cover-image resolution for trip surfaces (trip page, checkout, etc.).
 *
 * Trip briefs carry an array of region slugs (porto, lisbon, douro, ...). The
 * cover is the first region the trip touches — falling back to iberia when the
 * brief is empty, partially populated, or has an unknown region.
 */
const DEFAULT_COVERS = {
  porto: "/trip-covers/porto-ribeira.svg",
  lisbon: "/trip-covers/lisbon-tagus.svg",
  douro: "/trip-covers/douro-vineyards.svg",
  azores: "/trip-covers/azores-craters.svg",
  algarve: "/trip-covers/algarve-coast.svg",
  sintra: "/trip-covers/sintra-palace.svg",
  cascais: "/trip-covers/cascais-coast.svg",
  coimbra: "/trip-covers/coimbra-uni.svg",
  iberia: "/trip-covers/iberia-overview.svg",
} as const;

const FALLBACK_COVER: string = DEFAULT_COVERS.iberia;

export function resolveCoverImage(
  brief: import("@repo/types").TripBrief | undefined | null,
): string {
  const regions = brief?.regions;
  if (!regions || regions.length === 0) {
    return FALLBACK_COVER;
  }
  const first = regions[0];
  if (!first) return FALLBACK_COVER;
  const region = first.toLowerCase().replace(/\s+/g, "-");
  return (DEFAULT_COVERS as Record<string, string>)[region] ?? FALLBACK_COVER;
}

export const COVER_IMAGE_FALLBACK = FALLBACK_COVER;
