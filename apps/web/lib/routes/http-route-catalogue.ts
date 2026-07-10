import type { Capability } from "@repo/types";

export type HttpRouteDefinition = {
  path: string;
  responsibility: string;
  shell: "public" | "traveler" | "operator" | "none";
  indexable: boolean;
  auth: "public" | "owner" | "reviewer" | "admin" | "organization" | "token";
  capability?: Capability;
  redirect?: { status: 307 | 308; destination: string };
};

export const PUBLIC_SITEMAP_PATHS = [
  "/", "/portugal", "/how-it-works", "/local-expertise", "/pricing", "/support", "/privacy", "/terms", "/sustainability"
] as const;

export const HTTP_ROUTE_CATALOGUE: readonly HttpRouteDefinition[] = [
  { path: "/", responsibility: "Portugal-first acquisition", shell: "public", indexable: true, auth: "public" },
  { path: "/portugal", responsibility: "Curated Portugal discovery", shell: "public", indexable: true, auth: "public" },
  { path: "/explore", responsibility: "Visual destination exploration", shell: "public", indexable: false, auth: "public" },
  { path: "/explore/workspace", responsibility: "Map-first planning preview", shell: "public", indexable: false, auth: "public" },
  { path: "/how-it-works", responsibility: "Explain the planning ascension", shell: "public", indexable: true, auth: "public" },
  { path: "/human-review", responsibility: "Explain specialist review", shell: "public", indexable: false, auth: "public" },
  { path: "/local-expertise", responsibility: "Explain local specialist value", shell: "public", indexable: true, auth: "public" },
  { path: "/pricing", responsibility: "Pricing and tier comparison", shell: "public", indexable: true, auth: "public" },
  { path: "/planner", responsibility: "Natural trip brief", shell: "traveler", indexable: false, auth: "public" },
  { path: "/plan", responsibility: "Legacy planner entry", shell: "none", indexable: false, auth: "public", redirect: { status: 308, destination: "/planner" } },
  { path: "/trip/new", responsibility: "Resolve missing trip information", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/trip/[tripId]", responsibility: "Trip itinerary workspace", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/trip/[tripId]/map", responsibility: "Accessible route editor", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/trip/[tripId]/export", responsibility: "Export center", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/checkout", responsibility: "Checkout return state", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/itineraries", responsibility: "Saved itinerary archive", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/vault", responsibility: "Traveler assets and exports", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/account", responsibility: "Account settings", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/logistics", responsibility: "Trip-scoped route helper", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/expert-chat", responsibility: "Gated human-review messaging", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/sign-in", responsibility: "Authentication return point", shell: "none", indexable: false, auth: "public" },
  { path: "/support", responsibility: "Support routes and expectations", shell: "public", indexable: true, auth: "public" },
  { path: "/privacy", responsibility: "Privacy policy", shell: "public", indexable: true, auth: "public" },
  { path: "/terms", responsibility: "Terms of service", shell: "public", indexable: true, auth: "public" },
  { path: "/sustainability", responsibility: "Sustainability commitments", shell: "public", indexable: true, auth: "public" },
  { path: "/offline", responsibility: "Offline recovery", shell: "public", indexable: false, auth: "public" },
  { path: "/reviewer/queue", responsibility: "Reviewer assignment queue", shell: "operator", indexable: false, auth: "reviewer" },
  { path: "/reviewer/history", responsibility: "Reviewer history", shell: "operator", indexable: false, auth: "reviewer" },
  { path: "/reviewer/profile", responsibility: "Reviewer profile", shell: "operator", indexable: false, auth: "reviewer" },
  { path: "/reviewer/operations", responsibility: "Reviewer operations", shell: "operator", indexable: false, auth: "reviewer" },
  { path: "/reviewer/trips/[tripId]", responsibility: "Reviewer trip workspace", shell: "operator", indexable: false, auth: "reviewer" },
  { path: "/admin/places", responsibility: "Place management", shell: "operator", indexable: false, auth: "admin", capability: "content:manage" },
  { path: "/admin/countries", responsibility: "Country administration", shell: "operator", indexable: false, auth: "admin", capability: "content:manage" },
  { path: "/admin/regions", responsibility: "Region administration", shell: "operator", indexable: false, auth: "admin", capability: "content:manage" },
  { path: "/admin/partners", responsibility: "Partner administration", shell: "operator", indexable: false, auth: "admin", capability: "operations:manage" },
  { path: "/admin/reviewers", responsibility: "Reviewer administration", shell: "operator", indexable: false, auth: "admin", capability: "operations:manage" },
  { path: "/admin/specialists", responsibility: "Specialist verification", shell: "operator", indexable: false, auth: "admin", capability: "specialists:verify" },
  { path: "/admin/quality", responsibility: "Quality review", shell: "operator", indexable: false, auth: "admin", capability: "operations:manage" },
  { path: "/admin/analytics", responsibility: "Admin analytics", shell: "operator", indexable: false, auth: "admin", capability: "analytics:read" },
  { path: "/console", responsibility: "Console landing", shell: "operator", indexable: false, auth: "admin", capability: "operations:manage" },
  { path: "/console/pipeline", responsibility: "Operations pipeline", shell: "operator", indexable: false, auth: "admin", capability: "operations:manage" },
  { path: "/console/workspace", responsibility: "Operator workspace", shell: "operator", indexable: false, auth: "admin", capability: "operations:manage" },
  { path: "/console/messages", responsibility: "Console messaging", shell: "operator", indexable: false, auth: "admin", capability: "operations:manage" },
  { path: "/console/graph", responsibility: "Knowledge graph", shell: "operator", indexable: false, auth: "admin", capability: "content:manage" },
  { path: "/console/metrics", responsibility: "Console metrics", shell: "operator", indexable: false, auth: "admin", capability: "analytics:read" },
  { path: "/console/config", responsibility: "Console configuration", shell: "operator", indexable: false, auth: "admin", capability: "configuration:deploy" },
  { path: "/guide", responsibility: "Specialist beta", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/guide/onboarding", responsibility: "Specialist onboarding beta", shell: "traveler", indexable: false, auth: "owner" },
  { path: "/b2b", responsibility: "B2B beta interest", shell: "public", indexable: false, auth: "public" },
  { path: "/b2b/[orgSlug]", responsibility: "Organization workspace beta", shell: "traveler", indexable: false, auth: "organization" },
  { path: "/api/v1/docs", responsibility: "Developer API documentation", shell: "none", indexable: false, auth: "admin", capability: "developer_docs:read" }
];
