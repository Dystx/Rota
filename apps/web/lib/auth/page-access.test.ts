import { describe, expect, it } from "vitest";
import type { AuthorizedActor } from "@repo/types";
import { requirePageAccess, resolveHttpRoute } from "./page-access";

const adminActor: AuthorizedActor = {
  userId: "admin-1",
  roles: ["admin"],
  capabilities: ["operations:manage"],
  reviewerId: null
};

describe("catalogue-derived page access", () => {
  it("resolves exact and dynamic catalogue paths", () => {
    expect(resolveHttpRoute("/admin/places")).toMatchObject({
      path: "/admin/places",
      auth: "admin",
      capability: "content:manage"
    });
    expect(resolveHttpRoute("/reviewer/trips/trip-42")).toMatchObject({
      path: "/reviewer/trips/[tripId]",
      auth: "reviewer"
    });
    expect(resolveHttpRoute("/console/workspace?tab=timeline")).toMatchObject({
      path: "/console/workspace",
      capability: "operations:manage"
    });
    expect(resolveHttpRoute("/not-in-the-catalogue")).toBeNull();
  });

  it("requires both the role and the route capability", async () => {
    await expect(requirePageAccess(
      { anyRole: ["admin"], allCapabilities: ["analytics:read"] },
      { loadActorOutcome: async () => ({ kind: "ready", actor: adminActor }) }
    )).resolves.toEqual({ kind: "forbidden" });
  });

  it("keeps provider failure distinct from anonymous access", async () => {
    await expect(requirePageAccess(
      { anyRole: ["admin"] },
      { loadActorOutcome: async () => ({ kind: "unavailable" }) }
    )).resolves.toEqual({ kind: "unavailable" });

    await expect(requirePageAccess(
      { anyRole: ["admin"] },
      { loadActorOutcome: async () => ({ kind: "anonymous" }) }
    )).resolves.toEqual({ kind: "unauthenticated" });
  });

  it("returns the actor only after every requirement is satisfied", async () => {
    await expect(requirePageAccess(
      { anyRole: ["admin"], allCapabilities: ["operations:manage"] },
      { loadActorOutcome: async () => ({ kind: "ready", actor: adminActor }) }
    )).resolves.toEqual({ kind: "ready", actor: adminActor });
  });
});
