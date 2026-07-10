import { describe, expect, it } from "vitest";

import type { AuthorizedActor } from "@repo/types";

import { resolveRoleCompatibleNext } from "./role-compatible-next";

const travelerActor: AuthorizedActor = { userId: "traveler", roles: ["traveler"], capabilities: [], reviewerId: null };

describe("resolveRoleCompatibleNext", () => {
  it("rejects an admin return for a traveler", () => {
    expect(resolveRoleCompatibleNext("/admin/places", travelerActor)).toBe("/itineraries");
  });

  it("keeps an allowed planner draft return", () => {
    expect(resolveRoleCompatibleNext("/planner?draft=abc&stage=preview", travelerActor)).toBe("/planner?draft=abc&stage=preview");
  });
});
