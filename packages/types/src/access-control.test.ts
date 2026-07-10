import { describe, expect, it } from "vitest";

import { capabilitySchema } from "./access-control";

describe("capabilitySchema", () => {
  it.each([
    "access:manage",
    "content:manage",
    "operations:manage",
    "analytics:read",
    "configuration:deploy",
    "developer_docs:read",
    "specialists:verify"
  ])("accepts %s", (value) => {
    expect(capabilitySchema.parse(value)).toBe(value);
  });

  it("rejects an unapproved capability", () => {
    expect(() => capabilitySchema.parse("payments:manage")).toThrow();
  });
});
