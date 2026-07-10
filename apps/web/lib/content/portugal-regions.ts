import content from "@/content/portugal-regions.json";

export type PortugalRegionContent = {
  slug: string;
  assetIds: { primary: string; detail: string; routeThumbnail: string; mapFallback: string };
  bestSeason: string;
  idealDuration: string;
  transportConsequence: string;
  routeArchetype: string;
  verifiedNote: string;
  evidenceSource: string;
  reviewedAt: string;
  published: boolean;
};

export function getPublishedPortugalRegions(): PortugalRegionContent[] {
  return (content as PortugalRegionContent[]).filter((region) => region.published);
}
