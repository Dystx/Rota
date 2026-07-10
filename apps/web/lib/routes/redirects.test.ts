import { describe, expect, it } from "vitest";

import { resolveLegacyRedirect } from "./redirects";

describe("resolveLegacyRedirect", () => {
  it("permanently redirects the legacy plan route to planner", () => {
    expect(resolveLegacyRedirect("/plan")).toEqual({ destination: "/planner", status: 308 });
  });

  it("leaves live routes untouched", () => {
    expect(resolveLegacyRedirect("/planner")).toBeNull();
  });

  it("normalizes legacy discovery fixtures", () => {
    expect(resolveLegacyRedirect("/explore")).toEqual({ destination: "/portugal", status: 308 });
    expect(resolveLegacyRedirect("/explore/workspace")).toEqual({ destination: "/planner", status: 308 });
  });
});
