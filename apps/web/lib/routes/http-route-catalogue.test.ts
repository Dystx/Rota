import { describe, expect, it } from "vitest";

import { HTTP_ROUTE_CATALOGUE, PUBLIC_SITEMAP_PATHS } from "./http-route-catalogue";

describe("HTTP_ROUTE_CATALOGUE", () => {
  it("assigns every routed page a production purpose, access boundary, and shell", () => {
    expect(HTTP_ROUTE_CATALOGUE.map((entry) => entry.path)).toEqual(expect.arrayContaining([
      "/", "/portugal", "/explore", "/explore/workspace", "/activities/[activityId]", "/feedback", "/how-it-works", "/human-review", "/pricing",
      "/planner", "/trip/new", "/trip/[tripId]", "/checkout", "/itineraries", "/vault", "/account",
      "/reviewer/queue", "/admin/places", "/console/pipeline", "/guide", "/b2b/[orgSlug]"
    ]));
  });

  it("keeps the judged-results and chosen-day routes live", () => {
    const explore = HTTP_ROUTE_CATALOGUE.find((entry) => entry.path === "/explore");
    expect(explore?.shell).toBe("public");
    expect(explore && "redirect" in explore ? explore.redirect : undefined).toBeUndefined();
    const workspace = HTTP_ROUTE_CATALOGUE.find((entry) => entry.path === "/explore/workspace");
    expect(workspace?.shell).toBe("none");
    expect(workspace && "redirect" in workspace ? workspace.redirect : undefined).toBeUndefined();
  });

  it("records canonical legacy destinations", () => {
    expect(HTTP_ROUTE_CATALOGUE.find((entry) => entry.path === "/plan")).toMatchObject({
      redirect: { status: 308, destination: "/planner" }
    });
    expect(HTTP_ROUTE_CATALOGUE.find((entry) => entry.path === "/human-review")).toMatchObject({
      redirect: { status: 308, destination: "/local-expertise" }
    });
  });

  it("indexes only the public acquisition and trust routes", () => {
    expect(PUBLIC_SITEMAP_PATHS).toEqual([
      "/", "/portugal", "/how-it-works", "/local-expertise", "/pricing", "/support", "/privacy", "/terms", "/sustainability"
    ]);
    expect(HTTP_ROUTE_CATALOGUE.filter((entry) => entry.indexable).map((entry) => entry.path)).toEqual(PUBLIC_SITEMAP_PATHS);
  });
});
