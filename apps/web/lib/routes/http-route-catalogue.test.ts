import { describe, expect, it } from "vitest";

import { HTTP_ROUTE_CATALOGUE, PUBLIC_SITEMAP_PATHS } from "./http-route-catalogue";

describe("HTTP_ROUTE_CATALOGUE", () => {
  it("assigns every routed page a production purpose, access boundary, and shell", () => {
    expect(HTTP_ROUTE_CATALOGUE.map((entry) => entry.path)).toEqual(expect.arrayContaining([
      "/", "/portugal", "/explore", "/explore/workspace", "/how-it-works", "/human-review", "/pricing",
      "/planner", "/trip/new", "/trip/[tripId]", "/checkout", "/itineraries", "/vault", "/account",
      "/reviewer/queue", "/admin/places", "/console/pipeline", "/guide", "/b2b/[orgSlug]"
    ]));
  });

  it("indexes only the public acquisition and trust routes", () => {
    expect(PUBLIC_SITEMAP_PATHS).toEqual([
      "/", "/portugal", "/how-it-works", "/local-expertise", "/pricing", "/support", "/privacy", "/terms", "/sustainability"
    ]);
    expect(HTTP_ROUTE_CATALOGUE.filter((entry) => entry.indexable).map((entry) => entry.path)).toEqual(PUBLIC_SITEMAP_PATHS);
  });
});
