import { describe, expect, it } from "vitest";
import {
  regionIdsBySlug,
  regionIdToSlug,
  regionIdsToSlugs,
  isSyntheticRegionId,
  slugToRegionId,
  slugsToRegionIds
} from "./region-ids";

describe("region-ids synthetic UUID map", () => {
  it("round-trips a slug through slugToRegionId → regionIdToSlug", () => {
    for (const slug of Object.keys(regionIdsBySlug) as Array<
      keyof typeof regionIdsBySlug
    >) {
      const id = slugToRegionId(slug);
      expect(regionIdToSlug(id)).toBe(slug);
    }
  });

  it("round-trips a list of slugs through slugsToRegionIds → regionIdsToSlugs", () => {
    const slugs = [
      "lisbon",
      "porto",
      "algarve"
    ] as const;
    const ids = slugsToRegionIds(slugs);
    expect(ids).toEqual([
      regionIdsBySlug.lisbon,
      regionIdsBySlug.porto,
      regionIdsBySlug.algarve
    ]);
    expect(regionIdsToSlugs(ids)).toEqual([...slugs]);
  });

  it("returns null for an unknown region id", () => {
    expect(regionIdToSlug("00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("drops unknown ids from regionIdsToSlugs", () => {
    const ids = [
      regionIdsBySlug.lisbon,
      "00000000-0000-0000-0000-000000000000",
      regionIdsBySlug.porto
    ];
    expect(regionIdsToSlugs(ids)).toEqual(["lisbon", "porto"]);
  });

  it("isSyntheticRegionId returns true only for known ids", () => {
    expect(isSyntheticRegionId(regionIdsBySlug.lisbon)).toBe(true);
    expect(isSyntheticRegionId("00000000-0000-0000-0000-000000000000")).toBe(
      false
    );
  });

  it("every synthetic id matches the v4 UUID shape", () => {
    const uuidShape =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    for (const id of Object.values(regionIdsBySlug)) {
      expect(id).toMatch(uuidShape);
    }
  });

  it("has no duplicate synthetic ids (bijection)", () => {
    const ids = Object.values(regionIdsBySlug);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
