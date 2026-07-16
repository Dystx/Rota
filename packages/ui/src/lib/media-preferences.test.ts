import { describe, expect, it } from "vitest";

import { DEFAULT_MEDIA_PREFERENCES } from "./media-preferences";

describe("media preference contract", () => {
  it("has poster-first SSR-safe defaults", () => {
    expect(DEFAULT_MEDIA_PREFERENCES).toEqual({
      prefersReducedMotion: false,
      prefersReducedData: false,
      isLowPower: false
    });
  });
});
