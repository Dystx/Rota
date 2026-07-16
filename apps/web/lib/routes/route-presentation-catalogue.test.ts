import { describe, expect, it } from "vitest";

import { HTTP_ROUTE_CATALOGUE } from "./http-route-catalogue";
import { ROUTE_PRESENTATION_CATALOGUE, ROUTE_SCENARIO_CATALOGUE, type RouteSceneContract } from "./route-presentation-catalogue";

describe("route presentation catalogue", () => {
  it("covers every HTTP route exactly once", () => {
    expect(Object.keys(ROUTE_PRESENTATION_CATALOGUE).sort()).toEqual(
      HTTP_ROUTE_CATALOGUE.map((route) => route.path).sort()
    );
  });

  it("keeps utility and operator routes texture-free", () => {
    for (const [path, routeValue] of Object.entries(ROUTE_PRESENTATION_CATALOGUE)) {
      const route = routeValue as RouteSceneContract;
      if (route.scene === "utility" || route.shell === "operator") {
        expect(route.texture, path).toBe("none");
      }
    }
  });

  it("renders no footer for redirects, immersive tasks, or operators", () => {
    for (const [path, routeValue] of Object.entries(ROUTE_PRESENTATION_CATALOGUE)) {
      const route = routeValue as RouteSceneContract;
      if (("redirectTo" in route && route.redirectTo) || route.shell === "operator" || route.chrome === "immersive") {
        expect(route.footerMode, path).toBe("none");
      }
    }
  });

  it("materializes every state obligation as a concrete scenario", () => {
    expect(Object.keys(ROUTE_SCENARIO_CATALOGUE).sort()).toEqual(
      HTTP_ROUTE_CATALOGUE.map((route) => route.path).sort()
    );
    const ids = new Set<string>();
    for (const [path, routeValue] of Object.entries(ROUTE_PRESENTATION_CATALOGUE)) {
      const route = routeValue as RouteSceneContract;
      const scenarios = ROUTE_SCENARIO_CATALOGUE[path as keyof typeof ROUTE_SCENARIO_CATALOGUE];
      expect(scenarios.length, path).toBeGreaterThan(0);
      expect(scenarios.filter((scenario) => scenario.viewports === "all-four"), path).toHaveLength(1);
      expect([...new Set(scenarios.map((scenario) => scenario.state))].sort(), path)
        .toEqual([...route.states].sort());
      for (const scenario of scenarios) {
        expect(ids.has(scenario.id), `duplicate scenario id ${scenario.id}`).toBe(false);
        ids.add(scenario.id);
        expect(route.states, `${path} ${scenario.id}`).toContain(scenario.state);
        if (scenario.state === "unauthorized") expect(scenario.expected.access, scenario.id).toBe("redirect");
      }
    }
  });

  it("covers protected access and resource non-disclosure", () => {
    for (const route of HTTP_ROUTE_CATALOGUE) {
      const scenarios = ROUTE_SCENARIO_CATALOGUE[route.path as keyof typeof ROUTE_SCENARIO_CATALOGUE];
      if (route.auth !== "public") {
        expect(scenarios.some((scenario) => scenario.persona === "anonymous" && scenario.state === "unauthorized" && scenario.expected.noPrivateDisclosure), route.path).toBe(true);
      }
      if (route.path.includes("[tripId]")) {
        expect(scenarios.some((scenario) => scenario.persona === "foreign-traveler" && scenario.state === "not-found" && scenario.expected.noPrivateDisclosure), route.path).toBe(true);
      }
    }
    for (const path of ["/checkout", "/logistics", "/expert-chat"] as const) {
      expect(ROUTE_SCENARIO_CATALOGUE[path].some((scenario) => scenario.persona === "foreign-traveler" && scenario.expected.noPrivateDisclosure), path).toBe(true);
    }
  });

  it("gives operators complete triage and capability coverage", () => {
    for (const route of HTTP_ROUTE_CATALOGUE.filter((entry) => entry.shell === "operator")) {
      const scenarios = ROUTE_SCENARIO_CATALOGUE[route.path as keyof typeof ROUTE_SCENARIO_CATALOGUE];
      for (const state of ["unauthorized", "forbidden", "empty", "populated", "loading", "unavailable", "error"] as const) {
        expect(scenarios.some((scenario) => scenario.state === state), `${route.path} ${state}`).toBe(true);
      }
      expect(scenarios.some((scenario) => scenario.persona === "limited-admin" && scenario.state === "forbidden"), route.path).toBe(true);
    }
  });

  it("keeps beta flags, specialist fixtures, and organization disclosure explicit", () => {
    expect(ROUTE_SCENARIO_CATALOGUE["/guide/onboarding"].some((scenario) => scenario.persona === "specialist-candidate" && scenario.fixture.kind === "specialist" && scenario.fixture.variant === "new")).toBe(true);
    expect(ROUTE_SCENARIO_CATALOGUE["/guide/onboarding"].some((scenario) => scenario.persona === "specialist-candidate" && scenario.fixture.kind === "specialist" && scenario.fixture.variant === "draft")).toBe(true);
    expect(ROUTE_SCENARIO_CATALOGUE["/guide/onboarding"].some((scenario) => scenario.persona === "specialist-candidate" && scenario.fixture.kind === "specialist" && scenario.fixture.variant === "saved")).toBe(true);
    for (const path of ["/guide", "/guide/onboarding", "/expert-chat", "/b2b", "/b2b/[orgSlug]"] as const) {
      expect(ROUTE_SCENARIO_CATALOGUE[path].some((scenario) => Object.keys(scenario.setup?.flags ?? {}).length > 0), path).toBe(true);
    }
    for (const scenario of ROUTE_SCENARIO_CATALOGUE["/b2b/[orgSlug]"]) {
      expect(scenario.state).not.toBe("ready");
      expect(scenario.fixture.kind).not.toBe("organization");
    }
  });
});
