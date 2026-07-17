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
        if (scenario.state === "unauthorized" && !["/vault", "/b2b/[orgSlug]"].includes(path)) {
          expect(scenario.expected.access, scenario.id).toBe("redirect");
        }
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

  it("keeps checkout and Expert Chat state contracts concrete", () => {
    const checkout = ROUTE_SCENARIO_CATALOGUE["/checkout"];
    expect(checkout.find((scenario) => scenario.id === "checkout--anonymous")).toMatchObject({
      state: "unauthorized",
      persona: "anonymous",
      fixture: { kind: "traveler-trip", variant: "foreign" },
      setup: { query: { trip: "fixture:foreign" } },
      expected: { access: "redirect", noPrivateDisclosure: true }
    });
    expect(checkout.find((scenario) => scenario.id === "checkout--no-trip")).toMatchObject({
      state: "empty",
      persona: "traveler",
      fixture: { kind: "static", path: "/checkout" },
      viewports: "all-four"
    });
    expect(checkout.find((scenario) => scenario.id === "checkout--foreign-trip")).toMatchObject({
      state: "not-found",
      persona: "foreign-traveler",
      fixture: { kind: "traveler-trip", variant: "foreign" },
      expected: { access: "not-found", noPrivateDisclosure: true }
    });
    expect(checkout.find((scenario) => scenario.id === "checkout--provider-unavailable")).toMatchObject({
      state: "unavailable",
      fixture: { kind: "static", path: "/checkout" },
      setup: { provider: "unreachable" }
    });

    const expertChat = ROUTE_SCENARIO_CATALOGUE["/expert-chat"];
    expect(expertChat.find((scenario) => scenario.id === "expert-chat--disabled")).toMatchObject({ setup: { flags: { ENABLE_TRIP_MESSAGING: false } } });
    expect(expertChat.find((scenario) => scenario.id === "expert-chat--no-trip")).toMatchObject({ fixture: { kind: "static", path: "/expert-chat" }, setup: { flags: { ENABLE_TRIP_MESSAGING: true } }, viewports: "all-four" });
    expect(expertChat.find((scenario) => scenario.id === "expert-chat--foreign-trip")).toMatchObject({ expected: { access: "redirect", noPrivateDisclosure: true }, setup: { query: { trip: "fixture:foreign" } } });
    expect(expertChat.find((scenario) => scenario.id === "expert-chat--sending")).toMatchObject({ setup: { interaction: "send" }, expected: { transition: "composer announces sending" } });
    expect(expertChat.find((scenario) => scenario.id === "expert-chat--saved")).toMatchObject({ setup: { interaction: "send" }, expected: { transition: "message appears once and composer clears" } });
    expect(expertChat.find((scenario) => scenario.id === "expert-chat--send-error")).toMatchObject({ setup: { interaction: "send" }, expected: { transition: "draft is retained and retry is offered" } });
  });

  it("uses normal ready/empty states as dynamic primaries", () => {
    for (const path of ["/trip/[tripId]", "/trip/[tripId]/map", "/trip/[tripId]/export", "/checkout", "/logistics", "/expert-chat"] as const) {
      const primary = ROUTE_SCENARIO_CATALOGUE[path].find((scenario) => scenario.viewports === "all-four");
      expect(primary?.state, path).toBe("empty");
      expect(primary?.persona, path).not.toBe("foreign-traveler");
    }
  });

  it("uses foreign trip fixtures for every dynamic trip resource", () => {
    const expectedSuffixes = {
      "/trip/[tripId]": "",
      "/trip/[tripId]/map": "/map",
      "/trip/[tripId]/export": "/export",
      "/reviewer/trips/[tripId]": ""
    } as const;
    for (const [path, suffix] of Object.entries(expectedSuffixes)) {
      const foreign = ROUTE_SCENARIO_CATALOGUE[path as keyof typeof ROUTE_SCENARIO_CATALOGUE].find(
        (scenario) => scenario.persona === "foreign-traveler" && scenario.state === "not-found"
      );
      expect(foreign, path).toMatchObject({
        fixture: { kind: "traveler-trip", variant: "foreign", suffix },
        setup: { query: { trip: "fixture:foreign" } },
        expected: {
          access: path === "/trip/[tripId]" || path === "/trip/[tripId]/map" ? "redirect" : "not-found",
          noPrivateDisclosure: true
        }
      });
    }
  });

  it("uses reviewer personas and reviewer fixtures on reviewer routes", () => {
    for (const path of ["/reviewer/queue", "/reviewer/history", "/reviewer/profile", "/reviewer/operations", "/reviewer/trips/[tripId]"] as const) {
      const scenarios = ROUTE_SCENARIO_CATALOGUE[path];
      expect(scenarios.some((scenario) => scenario.persona === "reviewer" && scenario.state === "populated"), path).toBe(true);
      expect(scenarios.filter((scenario) => scenario.persona === "reviewer").every((scenario) => scenario.fixture.kind === "reviewer-trip"), path).toBe(true);
    }
    expect(ROUTE_SCENARIO_CATALOGUE["/reviewer/queue"].some((scenario) => scenario.fixture.kind === "reviewer-trip" && "variant" in scenario.fixture && scenario.fixture.variant === "unassigned")).toBe(true);
    expect(ROUTE_SCENARIO_CATALOGUE["/reviewer/queue"].some((scenario) => scenario.fixture.kind === "reviewer-trip" && "variant" in scenario.fixture && scenario.fixture.variant === "assigned")).toBe(true);
    expect(ROUTE_SCENARIO_CATALOGUE["/reviewer/history"].some((scenario) => scenario.fixture.kind === "reviewer-trip" && "variant" in scenario.fixture && scenario.fixture.variant === "completed")).toBe(true);
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
