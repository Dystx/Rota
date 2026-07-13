import manifest from "@/content/asset-manifest.json";

export type AssetManifestEntry = {
  id: string;
  files: readonly { src: string; width: number; height: number; bytes: number }[];
  alt: string;
  source: string;
  licence: string;
  attribution: string | null;
  focalPoint: { x: number; y: number };
  owner: string;
  reviewedAt: string;
  expiresAt: string | null;
};

export const ASSET_MANIFEST = manifest as AssetManifestEntry[];
