import { describe, expect, it } from "vitest";

import { ASSET_MANIFEST } from "./asset-manifest";

describe("ASSET_MANIFEST", () => {
  it("uses approved local editorial assets with provenance", () => {
    expect(
      ASSET_MANIFEST.every(
        (asset) =>
          ["Rumia-owned", "Unsplash License"].includes(asset.licence) &&
          asset.files.every((file) => file.src.startsWith("/")) &&
          (asset.licence === "Rumia-owned" || Boolean(asset.sourceUrl && asset.licenceUrl))
      )
    ).toBe(true);
  });

  it("keeps accessibility and refresh metadata with every asset", () => {
    expect(ASSET_MANIFEST.every((asset) => asset.alt.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/u.test(asset.reviewedAt))).toBe(true);
  });
});
