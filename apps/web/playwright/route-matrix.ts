import { HTTP_ROUTE_CATALOGUE, type HttpRoutePath } from "@/lib/routes/http-route-catalogue";
import {
  ROUTE_PRESENTATION_CATALOGUE,
  ROUTE_SCENARIO_CATALOGUE,
  type RouteSceneContract,
  type RouteVisualScenario
} from "@/lib/routes/route-presentation-catalogue";

export type RouteMatrixViewport = "desktop-1440" | "tablet-landscape" | "tablet-portrait" | "mobile-390" | "redirect";

/** One executable scenario expanded to the viewport evidence it requires. */
export type RouteMatrixRow = RouteVisualScenario & {
  route: HttpRoutePath;
  scenario: RouteVisualScenario;
  scene: RouteSceneContract["scene"];
  shell: RouteSceneContract["shell"];
  chrome: RouteSceneContract["chrome"];
  footerMode: RouteSceneContract["footerMode"];
  texture: RouteSceneContract["texture"];
  viewport: RouteMatrixViewport;
  expectedRoleMarker?: "traveler" | "reviewer" | "admin" | "specialist-candidate";
  fixtureMode: "production" | "demo";
};

function viewportsFor(scenario: RouteVisualScenario): readonly RouteMatrixViewport[] {
  if (scenario.state === "redirect") return ["redirect"];
  return scenario.viewports === "all-four"
    ? ["desktop-1440", "tablet-landscape", "tablet-portrait", "mobile-390"]
    : ["desktop-1440", "mobile-390"];
}

function roleMarkerFor(persona: RouteVisualScenario["persona"]): RouteMatrixRow["expectedRoleMarker"] {
  if (persona === "traveler" || persona === "foreign-traveler") return "traveler";
  if (persona === "reviewer") return "reviewer";
  if (persona === "admin" || persona === "limited-admin") return "admin";
  if (persona === "specialist-candidate") return "specialist-candidate";
  return undefined;
}

export const ROUTE_MATRIX: readonly RouteMatrixRow[] = HTTP_ROUTE_CATALOGUE.flatMap((route) => {
  const contract = ROUTE_PRESENTATION_CATALOGUE[route.path as HttpRoutePath];
  const scenarios = ROUTE_SCENARIO_CATALOGUE[route.path as HttpRoutePath];
  return scenarios.flatMap((scenario) => viewportsFor(scenario).map((viewport) => ({
    ...scenario,
    route: route.path,
    scenario,
    scene: contract.scene,
    shell: contract.shell,
    chrome: contract.chrome,
    footerMode: contract.footerMode,
    texture: contract.texture,
    viewport,
    expectedRoleMarker: roleMarkerFor(scenario.persona),
    fixtureMode: "production" as const
  })));
});
