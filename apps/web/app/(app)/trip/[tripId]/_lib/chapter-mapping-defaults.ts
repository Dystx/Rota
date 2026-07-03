/**
 * Cinematic camera defaults for the trip surface. Extracted from
 * the deleted `packages/maps/cinematic-config.ts` — kept here so
 * the chapter-mapping helpers (in `chapter-mapping.ts`) stay a pure
 * module that doesn't import any spatial-engine or design-token
 * surface.
 */
export const CHAPTER_CAMERA_DEFAULTS = {
  zoom: 12,
  pitch: 60,
  bearing: 30,
  duration: 2400,
  curve: 1.42
} as const;
