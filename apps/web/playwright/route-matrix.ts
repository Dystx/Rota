import { HTTP_ROUTE_CATALOGUE } from "@/lib/routes/http-route-catalogue";

export type RouteMatrixRow = {
  route: string;
  persona: "anonymous" | "traveler" | "specialist_candidate" | "reviewer" | "admin" | "organization_member";
  state: string;
  viewport: "desktop" | "mobile";
  expectedRoleMarker?: string;
  fixtureMode: "production" | "demo";
};

function personaFor(auth: (typeof HTTP_ROUTE_CATALOGUE)[number]["auth"]): RouteMatrixRow["persona"] {
  if (auth === "owner") return "traveler";
  if (auth === "reviewer") return "reviewer";
  if (auth === "admin") return "admin";
  if (auth === "organization") return "organization_member";
  return "anonymous";
}

export const ROUTE_MATRIX: readonly RouteMatrixRow[] = HTTP_ROUTE_CATALOGUE.flatMap((route) => {
  const persona = personaFor(route.auth);
  const state = route.redirect ? "redirect" : persona === "anonymous" ? "ready" : "authorized";
  const marker = persona === "traveler" ? "traveler" : persona === "reviewer" ? "reviewer" : persona === "admin" ? "admin" : undefined;

  return [
    { route: route.path, persona, state, viewport: "desktop", expectedRoleMarker: marker, fixtureMode: "production" },
    { route: route.path, persona, state, viewport: "mobile", expectedRoleMarker: marker, fixtureMode: "production" }
  ];
});
