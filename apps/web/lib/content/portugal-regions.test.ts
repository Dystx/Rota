import { describe, expect, it } from "vitest";

import { getPublishedPortugalRegions } from "./portugal-regions";

describe("getPublishedPortugalRegions", () => {
  it("requires all eight complete Portugal groups", () => {
    expect(getPublishedPortugalRegions().map((region) => region.slug)).toEqual([
      "lisbon-sintra-cascais", "porto-north", "douro", "central-portugal-silver-coast", "alentejo", "algarve", "madeira", "azores"
    ]);
  });
});
