import { describe, expect, it } from "vitest";

import { resolveLegacyRedirect } from "./redirects";

describe("resolveLegacyRedirect", () => {
  it("permanently redirects the legacy plan route to planner", () => {
    expect(resolveLegacyRedirect("/plan")).toEqual({ destination: "/planner", status: 308 });
  });

  it("leaves live routes untouched", () => {
    expect(resolveLegacyRedirect("/planner")).toBeNull();
  });

  it("keeps the active decision routes live", () => {
    expect(resolveLegacyRedirect("/explore")).toBeNull();
    expect(resolveLegacyRedirect("/explore/workspace")).toBeNull();
  });

  it("normalizes the retired human-review route", () => {
    expect(resolveLegacyRedirect("/human-review")).toEqual({ destination: "/local-expertise", status: 308 });
  });
});
