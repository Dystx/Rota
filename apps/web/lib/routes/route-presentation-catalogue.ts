import type { SiteFooterMode } from "@/app/_components/site-footer";
import type { RouteSceneTone } from "@/app/_components/route-scene";
import type { HttpRoutePath } from "./http-route-catalogue";

export type RouteVisualState =
  | "ready"
  | "loading"
  | "empty"
  | "unavailable"
  | "unauthorized"
  | "forbidden"
  | "error"
  | "not-found"
  | "saved"
  | "populated"
  | "filtered-empty"
  | "conflict"
  | "paid"
  | "redirect"
  | "removed"
  | "disabled"
  | "ineligible"
  | "pending"
  | "selected"
  | "one-selection"
  | "multiple-selection";

export type RouteFixture =
  | { kind: "static"; path: string }
  | { kind: "activity"; activityId: "porto-ribeira-slow-walk" }
  | { kind: "traveler-trip"; suffix: "" | "/map" | "/export" }
  | { kind: "reviewer-trip" }
  | { kind: "organization"; slug: "e2e-organization" };

export type RouteSceneContract = {
  scene: RouteSceneTone | "redirect";
  shell: "public" | "traveler" | "operator" | "none";
  chrome: "public" | "task" | "immersive" | "operator" | "none";
  footerMode: SiteFooterMode;
  texture: "editorial" | "none";
  fixture: RouteFixture;
  states: readonly RouteVisualState[];
  redirectTo?: HttpRoutePath;
};

const staticRoute = (path: HttpRoutePath): RouteFixture => ({ kind: "static", path });

const publicStates = ["ready", "loading", "unavailable", "not-found", "error"] as const satisfies readonly RouteVisualState[];
const operatorStates = ["unauthorized", "forbidden", "empty", "populated", "loading", "unavailable", "error"] as const satisfies readonly RouteVisualState[];
const utilityStates = ["unauthorized", "empty", "populated", "filtered-empty", "loading", "unavailable", "error"] as const satisfies readonly RouteVisualState[];

export const ROUTE_PRESENTATION_CATALOGUE = {
  "/": { scene: "cover", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/"), states: publicStates },
  "/portugal": { scene: "atlas", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/portugal"), states: publicStates },
  "/explore": { scene: "decision", shell: "public", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/explore"), states: ["ready", "empty", "loading", "one-selection", "multiple-selection", "saved", "removed", "error"] as const },
  "/explore/workspace": { scene: "decision", shell: "none", chrome: "immersive", footerMode: "none", texture: "none", fixture: staticRoute("/explore/workspace"), states: ["empty", "one-selection", "multiple-selection", "loading", "conflict", "saved", "unavailable", "not-found", "error"] as const },
  "/activities/[activityId]": { scene: "cover", shell: "public", chrome: "task", footerMode: "compact", texture: "none", fixture: { kind: "activity", activityId: "porto-ribeira-slow-walk" }, states: ["ready", "loading", "saved", "removed", "not-found", "error"] as const },
  "/feedback": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/feedback"), states: ["ready", "empty", "loading", "saved", "unavailable", "error"] as const },
  "/how-it-works": { scene: "cover", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/how-it-works"), states: publicStates },
  "/human-review": { scene: "redirect", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/human-review"), states: ["redirect"], redirectTo: "/local-expertise" },
  "/local-expertise": { scene: "cover", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/local-expertise"), states: publicStates },
  "/pricing": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/pricing"), states: publicStates },
  "/planner": { scene: "decision", shell: "traveler", chrome: "immersive", footerMode: "none", texture: "none", fixture: staticRoute("/planner"), states: ["ready", "loading", "saved", "error"] as const },
  "/plan": { scene: "redirect", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/plan"), states: ["redirect"], redirectTo: "/planner" },
  "/trip/new": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/trip/new"), states: ["unauthorized", "ready", "loading", "saved", "error"] as const },
  "/trip/[tripId]": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: { kind: "traveler-trip", suffix: "" }, states: ["unauthorized", "not-found", "empty", "one-selection", "multiple-selection", "loading", "conflict", "saved", "error"] as const },
  "/trip/[tripId]/map": { scene: "atlas", shell: "traveler", chrome: "immersive", footerMode: "none", texture: "none", fixture: { kind: "traveler-trip", suffix: "/map" }, states: ["unauthorized", "not-found", "empty", "one-selection", "multiple-selection", "selected", "loading", "conflict", "unavailable", "error"] as const },
  "/trip/[tripId]/export": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: { kind: "traveler-trip", suffix: "/export" }, states: ["unauthorized", "not-found", "empty", "loading", "pending", "saved", "error"] as const },
  "/checkout": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/checkout"), states: ["unauthorized", "not-found", "empty", "ready", "loading", "paid", "unavailable", "error"] as const },
  "/itineraries": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/itineraries"), states: utilityStates },
  "/vault": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/vault"), states: utilityStates },
  "/account": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/account"), states: utilityStates },
  "/logistics": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/logistics"), states: ["unauthorized", "not-found", "empty", "ready", "selected", "loading", "saved", "unavailable", "error"] as const },
  "/expert-chat": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/expert-chat"), states: ["unauthorized", "not-found", "disabled", "ineligible", "empty", "ready", "loading", "saved", "unavailable", "error"] as const },
  "/sign-in": { scene: "utility", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/sign-in"), states: ["ready", "loading", "unavailable", "error", "redirect"] as const },
  "/support": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/support"), states: publicStates },
  "/privacy": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/privacy"), states: publicStates },
  "/terms": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/terms"), states: publicStates },
  "/sustainability": { scene: "cover", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/sustainability"), states: publicStates },
  "/offline": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/offline"), states: ["ready", "unavailable", "error"] as const },
  "/reviewer/queue": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/queue"), states: operatorStates },
  "/reviewer/history": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/history"), states: operatorStates },
  "/reviewer/profile": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/profile"), states: operatorStates },
  "/reviewer/operations": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/operations"), states: operatorStates },
  "/reviewer/trips/[tripId]": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: { kind: "reviewer-trip" }, states: [...operatorStates, "not-found"] as const },
  "/admin/places": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/places"), states: operatorStates },
  "/admin/countries": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/countries"), states: operatorStates },
  "/admin/regions": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/regions"), states: operatorStates },
  "/admin/partners": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/partners"), states: operatorStates },
  "/admin/reviewers": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/reviewers"), states: operatorStates },
  "/admin/specialists": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/specialists"), states: operatorStates },
  "/admin/quality": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/quality"), states: operatorStates },
  "/admin/analytics": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/admin/analytics"), states: operatorStates },
  "/console": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console"), states: operatorStates },
  "/console/pipeline": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/pipeline"), states: operatorStates },
  "/console/workspace": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/workspace"), states: operatorStates },
  "/console/messages": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/messages"), states: operatorStates },
  "/console/graph": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/graph"), states: operatorStates },
  "/console/metrics": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/metrics"), states: operatorStates },
  "/console/config": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/console/config"), states: operatorStates },
  "/guide": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/guide"), states: ["unauthorized", "disabled", "ineligible", "unavailable", "ready", "error"] as const },
  "/guide/onboarding": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/guide/onboarding"), states: ["unauthorized", "disabled", "ineligible", "unavailable", "ready", "loading", "saved", "error"] as const },
  "/b2b": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/b2b"), states: ["ready", "disabled", "ineligible", "unavailable", "error"] as const },
  "/b2b/[orgSlug]": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: { kind: "organization", slug: "e2e-organization" }, states: ["unauthorized", "disabled", "ineligible", "unavailable", "error"] as const },
  "/api/v1/docs": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/api/v1/docs"), states: [...operatorStates, "disabled", "ready"] as const }
} as const satisfies Record<HttpRoutePath, RouteSceneContract>;

export type RoutePersona =
  | "public"
  | "anonymous"
  | "traveler"
  | "foreign-traveler"
  | "reviewer"
  | "admin"
  | "limited-admin"
  | "specialist-candidate";

export type RouteFeatureFlag =
  | "ENABLE_OPERATOR_CONSOLE"
  | "ENABLE_CONSOLE_CONFIG"
  | "ENABLE_API_DOCS"
  | "ENABLE_GUIDE_BETA"
  | "ENABLE_TRIP_MESSAGING"
  | "ENABLE_B2B_BETA";

export type ScenarioFixture =
  | RouteFixture
  | { kind: "traveler-trip"; variant: "draft" | "paid-reviewed" | "foreign"; suffix: "" | "/map" | "/export" }
  | { kind: "reviewer-trip"; variant: "assigned" | "completed" | "unassigned" }
  | { kind: "specialist"; variant: "new" | "draft" | "saved" }
  | { kind: "operator"; variant: "empty" | "populated" };

export type RouteVisualScenario = {
  id: string;
  state: RouteVisualState;
  persona: RoutePersona;
  fixture: ScenarioFixture;
  setup?: {
    query?: Readonly<Record<string, string>>;
    provider?: "ready" | "missing-config" | "unreachable";
    flags?: Partial<Record<RouteFeatureFlag, boolean>>;
    interaction?: "save" | "remove" | "select" | "filter" | "send" | "retry";
    preferences?: { reducedMotion?: true; reducedData?: true; lowPower?: true };
  };
  expected: {
    access: "render" | "redirect" | "not-found";
    transition?: string;
    noPrivateDisclosure?: true;
  };
  viewports: "all-four" | "desktop-mobile";
};

const flagsFor = (path: HttpRoutePath): Partial<Record<RouteFeatureFlag, boolean>> | undefined => {
  if (path === "/guide" || path === "/guide/onboarding") return { ENABLE_GUIDE_BETA: true };
  if (path === "/expert-chat") return { ENABLE_TRIP_MESSAGING: true };
  if (path === "/b2b" || path === "/b2b/[orgSlug]") return { ENABLE_B2B_BETA: true };
  if (path === "/api/v1/docs") return { ENABLE_API_DOCS: true };
  if (path.startsWith("/console")) return { ENABLE_OPERATOR_CONSOLE: true, ...(path === "/console/config" ? { ENABLE_CONSOLE_CONFIG: true } : {}) };
  return undefined;
};

const interactionFor = (state: RouteVisualState): NonNullable<RouteVisualScenario["setup"]>["interaction"] => {
  if (state === "saved" || state === "removed") return state === "saved" ? "save" : "remove";
  if (state === "selected" || state === "one-selection" || state === "multiple-selection") return "select";
  if (state === "filtered-empty") return "filter";
  if (state === "error" || state === "unavailable") return "retry";
  return undefined;
};

function scenario(
  id: string,
  state: RouteVisualState,
  persona: RoutePersona,
  fixture: ScenarioFixture,
  viewports: RouteVisualScenario["viewports"],
  expected: RouteVisualScenario["expected"],
  setup?: RouteVisualScenario["setup"]
): RouteVisualScenario {
  return { id, state, persona, fixture, viewports, expected, ...(setup ? { setup } : {}) };
}

function fixtureFor(path: HttpRoutePath, state: RouteVisualState, primary: RouteFixture): ScenarioFixture {
  if (path === "/b2b/[orgSlug]") return staticRoute(path);
  if (path === "/guide/onboarding") {
    if (state === "saved") return { kind: "specialist", variant: "saved" };
    if (state === "loading" || state === "ready") return { kind: "specialist", variant: "draft" };
    return { kind: "specialist", variant: "new" };
  }
  if (path === "/reviewer/trips/[tripId]") {
    return { kind: "reviewer-trip", variant: state === "empty" ? "unassigned" : state === "saved" ? "completed" : "assigned" };
  }
  if (path.includes("[tripId]") || path === "/checkout" || path === "/logistics" || path === "/expert-chat") {
    const suffix = path.endsWith("/map") ? "/map" : path.endsWith("/export") ? "/export" : "";
    if (state === "not-found") return { kind: "traveler-trip", variant: "foreign", suffix };
    if (state === "paid") return { kind: "traveler-trip", variant: "paid-reviewed", suffix };
    return { kind: "traveler-trip", variant: "draft", suffix };
  }
  return primary;
}

function setupFor(path: HttpRoutePath, state: RouteVisualState): RouteVisualScenario["setup"] {
  const flags = flagsFor(path);
  const interaction = interactionFor(state);
  const provider = state === "unavailable" ? "unreachable" : undefined;
  const query = state === "not-found" && (path.includes("[tripId]") || ["/checkout", "/logistics", "/expert-chat"].includes(path))
    ? { trip: "fixture:foreign" }
    : undefined;
  if (!flags && !interaction && !provider && !query) return undefined;
  return { ...(flags ? { flags } : {}), ...(interaction ? { interaction } : {}), ...(provider ? { provider } : {}), ...(query ? { query } : {}) };
}

function buildPublicScenarios(path: HttpRoutePath, contract: RouteSceneContract): readonly RouteVisualScenario[] {
  if (contract.redirectTo) {
    return [scenario(`${path.slice(1).replaceAll("/", "-") || "home"}--redirect`, "redirect", "public", contract.fixture, "all-four", { access: "redirect", transition: `308 to ${contract.redirectTo}` })];
  }
  return contract.states.map((state, index) => scenario(
    `${path.slice(1).replaceAll("/", "-") || "home"}--${state}`,
    state,
    "public",
    fixtureFor(path, state, contract.fixture),
    index === 0 ? "all-four" : "desktop-mobile",
    { access: state === "not-found" ? "not-found" : state === "redirect" ? "redirect" : "render" },
    setupFor(path, state)
  ));
}

function buildOwnerScenarios(path: HttpRoutePath, contract: RouteSceneContract): readonly RouteVisualScenario[] {
  const key = path.slice(1).replaceAll("/", "-") || "home";
  const states = [...contract.states];
  const scenarios: RouteVisualScenario[] = [];
  const primaryState = states.find((state) => state !== "unauthorized") ?? states[0];
  for (const state of states) {
    if (state === "unauthorized") {
      scenarios.push(scenario(`${key}--anonymous`, state, "anonymous", path === "/b2b/[orgSlug]" ? staticRoute(path) : contract.fixture, "desktop-mobile", { access: "redirect", noPrivateDisclosure: true }));
      continue;
    }
    const foreign = state === "not-found" && (path.includes("[tripId]") || ["/checkout", "/logistics", "/expert-chat"].includes(path));
    const persona: RoutePersona = foreign ? "foreign-traveler" : path === "/guide/onboarding" ? "specialist-candidate" : "traveler";
    const fixture = fixtureFor(path, state, contract.fixture);
    scenarios.push(scenario(
      `${key}--${state}${foreign ? "-foreign" : ""}`,
      state,
      persona,
      fixture,
      state === primaryState ? "all-four" : "desktop-mobile",
      { access: state === "not-found" ? "not-found" : "render", ...(foreign ? { noPrivateDisclosure: true } : {}) },
      setupFor(path, state)
    ));
  }
  if (path === "/guide/onboarding") {
    scenarios.push(scenario(`${key}--specialist-new`, "disabled", "specialist-candidate", { kind: "specialist", variant: "new" }, "desktop-mobile", { access: "render", transition: "onboarding is available only after eligibility" }, { flags: { ENABLE_GUIDE_BETA: true } }));
  }
  return scenarios;
}

function buildOperatorScenarios(path: HttpRoutePath, contract: RouteSceneContract): readonly RouteVisualScenario[] {
  const key = path.slice(1).replaceAll("/", "-") || "home";
  const flags = flagsFor(path);
  const scenarios: RouteVisualScenario[] = [];
  const primaryState = contract.states.includes("empty") ? "empty" : contract.states.find((state) => !["unauthorized", "forbidden"].includes(state)) ?? contract.states[0];
  for (const state of contract.states) {
    if (state === "unauthorized") {
      scenarios.push(scenario(`${key}--anonymous`, state, "anonymous", contract.fixture, "desktop-mobile", { access: "redirect", noPrivateDisclosure: true }, flags ? { flags } : undefined));
      continue;
    }
    if (state === "forbidden") {
      scenarios.push(scenario(`${key}--limited-capability`, state, "limited-admin", { kind: "operator", variant: "empty" }, "desktop-mobile", { access: "render", noPrivateDisclosure: true }, flags ? { flags } : undefined));
      continue;
    }
    const foreignResource = state === "not-found" && path.includes("[tripId]");
    const fixture: ScenarioFixture = foreignResource
      ? { kind: "traveler-trip", variant: "foreign", suffix: "" }
      : state === "populated"
        ? { kind: "operator", variant: "populated" }
        : { kind: "operator", variant: "empty" };
    scenarios.push(scenario(
      `${key}--${state}${foreignResource ? "-foreign" : ""}`,
      state,
      foreignResource ? "foreign-traveler" : "admin",
      fixture,
      state === primaryState ? "all-four" : "desktop-mobile",
      { access: state === "not-found" ? "not-found" : "render", ...(foreignResource ? { noPrivateDisclosure: true } : {}) },
      { ...(flags ? { flags } : {}), ...(setupFor(path, state) ?? {}) }
    ));
  }
  return scenarios;
}

function buildScenarios(path: HttpRoutePath, contract: RouteSceneContract): readonly RouteVisualScenario[] {
  if (contract.shell === "operator") return buildOperatorScenarios(path, contract);
  if (contract.shell === "traveler" && path !== "/planner") return buildOwnerScenarios(path, contract);
  return buildPublicScenarios(path, contract);
}

export const ROUTE_SCENARIO_CATALOGUE = Object.fromEntries(
  (Object.entries(ROUTE_PRESENTATION_CATALOGUE) as Array<[HttpRoutePath, RouteSceneContract]>).map(([path, contract]) => [path, buildScenarios(path, contract)])
) as { readonly [K in HttpRoutePath]: readonly RouteVisualScenario[] };
