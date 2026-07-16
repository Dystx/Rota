export type CinematicMediaEntry = {
  id: string;
  route: string;
  videoSrc: string;
  webmSrc?: string;
  mobileWebmSrc?: string;
  mobileSrc?: string;
  /** @deprecated Use mobileSrc; retained for older manifest readers. */
  mobileVideoSrc?: string;
  posterSrc: string;
  mobilePosterSrc?: string;
  fallbackSrc: string;
  width: number;
  height: number;
  durationMs: number;
  videoBytes: number;
  mobileBytes?: number;
  alt: string;
  caption?: string;
  source: string;
  sourceUrl: string;
  licence: string;
  licenceUrl: string;
  attribution: string;
  owner: string;
  reviewedAt: string;
  focalPoint: { x: number; y: number };
  textSafeZone: { x: number; y: number; width: number; height: number };
  mobileTextSafeZone?: { x: number; y: number; width: number; height: number };
  motionPolicy: "decorative-autoplay" | "poster-only" | "informative";
  loadStrategy?: "eager" | "near-viewport";
  pauseWhenHidden?: boolean;
};

/**
 * Only derivatives with a recorded source, licence, crop, and byte budget may
 * enter a route. The original still remains the poster and offline fallback.
 */
export const CINEMATIC_MEDIA = {
  portugalCover: {
    id: "cinematic-portugal-cover",
    route: "/",
    videoSrc: "/media/unsplash/portugal-coast-golden-hour-loop.mp4",
    posterSrc: "/media/unsplash/portugal-coast-golden-hour.webp",
    fallbackSrc: "/media/unsplash/portugal-coast-golden-hour.jpg",
    width: 1600,
    height: 1174,
    durationMs: 8000,
    videoBytes: 565629,
    mobileBytes: 565629,
    alt: "Atlantic seawall and surf at golden hour on the Portuguese coast.",
    caption: "A country of small decisions, held in a wider landscape.",
    source: "Unsplash photograph by Jacek Ulinski; Rumia motion derivative",
    sourceUrl: "https://unsplash.com/photos/seawall-during-golden-hour-ud_S41g-Y54",
    licence: "Unsplash License for the source still; Rumia-owned derivative",
    licenceUrl: "https://unsplash.com/license",
    attribution: "Photo by Jacek Ulinski on Unsplash; motion derivative by Rumia",
    owner: "Rumia content",
    reviewedAt: "2026-07-13",
    focalPoint: { x: 0.54, y: 0.55 },
    textSafeZone: { x: 0.04, y: 0.08, width: 0.46, height: 0.74 },
    mobileTextSafeZone: { x: 0.08, y: 0.52, width: 0.84, height: 0.4 },
    motionPolicy: "decorative-autoplay",
    loadStrategy: "eager",
    pauseWhenHidden: true
  },
  douroField: {
    id: "cinematic-douro-field",
    route: "/portugal",
    videoSrc: "/media/unsplash/douro-terraces-loop.mp4",
    posterSrc: "/media/unsplash/douro-terraces.webp",
    fallbackSrc: "/media/unsplash/douro-terraces.jpg",
    width: 1600,
    height: 996,
    durationMs: 8000,
    videoBytes: 1276925,
    mobileBytes: 1276925,
    alt: "Terraced vineyards descending toward the Douro River in northern Portugal.",
    caption: "A country is easier to choose when the day still has room around it.",
    source: "Unsplash photograph by Bruno Ferreira; Rumia motion derivative",
    sourceUrl: "https://unsplash.com/pt-br/fotografias/montanhas-verdes-sob-o-ceu-azul-durante-o-dia-3nYTPpTSbPE",
    licence: "Unsplash License for the source still; Rumia-owned derivative",
    licenceUrl: "https://unsplash.com/license",
    attribution: "Photo by Bruno Ferreira on Unsplash; motion derivative by Rumia",
    owner: "Rumia content",
    reviewedAt: "2026-07-13",
    focalPoint: { x: 0.58, y: 0.52 },
    textSafeZone: { x: 0.04, y: 0.08, width: 0.46, height: 0.72 },
    mobileTextSafeZone: { x: 0.08, y: 0.5, width: 0.84, height: 0.42 },
    motionPolicy: "decorative-autoplay",
    loadStrategy: "eager",
    pauseWhenHidden: true
  }
} as const satisfies Record<string, CinematicMediaEntry>;
