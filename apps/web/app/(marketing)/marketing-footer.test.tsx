import { describe, expect, it } from "vitest";

import { resolveMarketingFooterMode } from "./marketing-footer";

describe("resolveMarketingFooterMode", () => {
  it.each([
    ["/", "full"],
    ["/portugal", "full"],
    ["/local-expertise", "full"],
    ["/explore", "none"],
    ["/explore/workspace", "none"],
    ["/activities/porto-ribeira-slow-walk", "none"],
    ["/how-it-works", "compact"],
    ["/pricing", "compact"],
    [null, "compact"]
  ] as const)("uses %s footer mode for %s", (pathname, expected) => {
    expect(resolveMarketingFooterMode(pathname)).toBe(expected);
  });
});
