import { describe, expect, it } from "vitest";

import { ASSET_MANIFEST } from "./asset-manifest";

describe("ASSET_MANIFEST", () => {
  it("uses owned local editorial assets", () => {
    expect(ASSET_MANIFEST.every((asset) => asset.licence === "Rumia-owned" && asset.files.every((file) => file.src.startsWith("/")))).toBe(true);
  });
});
