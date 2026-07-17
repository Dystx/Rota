import manifest from "@/content/asset-manifest.json";

export type AssetManifestEntry = {
  id: string;
  files: readonly { src: string; width: number; height: number; bytes: number }[];
  alt: string;
  source: string;
  sourceUrl?: string;
  licence: string;
  licenceUrl?: string;
  attribution: string | null;
  caption?: string;
  focalPoint: { x: number; y: number };
  textSafeZone?: { x: number; y: number; width: number; height: number };
  owner: string;
  reviewedAt: string;
  expiresAt: string | null;
};

export const ASSET_MANIFEST = manifest as AssetManifestEntry[];
