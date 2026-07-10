import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";

describe("sitemap", () => {
  it("does not leak app, operator, beta, or authentication routes", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://rumia.pt/", "https://rumia.pt/portugal", "https://rumia.pt/how-it-works", "https://rumia.pt/local-expertise",
      "https://rumia.pt/pricing", "https://rumia.pt/support", "https://rumia.pt/privacy", "https://rumia.pt/terms", "https://rumia.pt/sustainability"
    ]);
  });
});
