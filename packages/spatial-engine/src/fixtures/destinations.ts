import type { CameraTarget } from "../core/types";

/**
 * Deterministic destination camera presets. The bento grid on the home
 * page deep-links to /explore/workspace?focus=<slug>; the workspace
 * client reads the slug and lands the camera here.
 *
 * Coordinates come from the same source the route fixture uses (Porto
 * → Lisbon stops in routes.ts) so the camera tracks the seeded
 * collection. The Azores preset covers the whole archipelago at
 * zoom 6 since no single island can represent it.
 */

export interface DestinationPreset {
  /** URL-safe slug; matches the ?focus= query parameter. */
  readonly slug: string;
  /** Human-readable label for accessibility / test output. */
  readonly name: string;
  /** Camera target the workspace (or globe) should land on. */
  readonly camera: CameraTarget;
}

export const DESTINATION_PRESETS: readonly DestinationPreset[] = [
  {
    slug: "lisbon",
    name: "Lisbon",
    camera: { center: [-9.1393, 38.7223], zoom: 11, pitch: 30 }
  },
  {
    slug: "porto",
    name: "Porto",
    camera: { center: [-8.6291, 41.1579], zoom: 11, pitch: 30 }
  },
  {
    slug: "douro",
    name: "Douro Valley",
    // Pinhão, heart of the wine country
    camera: { center: [-7.5458, 41.1832], zoom: 9.4, pitch: 20 }
  },
  {
    slug: "sintra",
    name: "Sintra",
    camera: { center: [-9.3893, 38.7972], zoom: 11.5, pitch: 40 }
  },
  {
    slug: "cascais",
    name: "Cascais",
    camera: { center: [-9.4218, 38.6979], zoom: 11.5, pitch: 30 }
  },
  {
    slug: "coimbra",
    name: "Coimbra",
    camera: { center: [-8.4291, 40.2033], zoom: 11, pitch: 30 }
  },
  {
    slug: "algarve",
    name: "Algarve",
    // Lagos / Ponta da Piedade — gold-cliff coast
    camera: { center: [-8.6693, 37.1029], zoom: 9.5, pitch: 25 }
  },
  {
    slug: "azores",
    name: "The Azores",
    // Sete Cidades on São Miguel — the iconic twin-lake vista
    camera: { center: [-25.7903, 37.8602], zoom: 10.5, pitch: 45 }
  }
] as const;

/** Lookup a preset by URL slug. Returns undefined when the slug is unknown. */
export function getDestinationPreset(slug: string | null | undefined): DestinationPreset | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  return DESTINATION_PRESETS.find((preset) => preset.slug === normalized);
}