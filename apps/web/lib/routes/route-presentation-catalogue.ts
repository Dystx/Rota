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

const publicReady = ["ready", "loading", "error"] as const satisfies readonly RouteVisualState[];
const operatorStates = ["unauthorized", "forbidden", "empty", "populated", "loading", "unavailable", "error"] as const satisfies readonly RouteVisualState[];
const utilityStates = ["unauthorized", "empty", "populated", "filtered-empty", "loading", "unavailable", "error"] as const satisfies readonly RouteVisualState[];

export const ROUTE_PRESENTATION_CATALOGUE = {
  "/": { scene: "cover", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/"), states: publicReady },
  "/portugal": { scene: "atlas", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/portugal"), states: publicReady },
  "/explore": { scene: "decision", shell: "public", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/explore"), states: ["ready", "empty", "loading", "one-selection", "multiple-selection", "saved", "removed", "error"] as const },
  "/explore/workspace": { scene: "decision", shell: "none", chrome: "immersive", footerMode: "none", texture: "none", fixture: staticRoute("/explore/workspace"), states: ["empty", "one-selection", "multiple-selection", "loading", "conflict", "saved", "unavailable", "not-found", "error"] as const },
  "/activities/[activityId]": { scene: "cover", shell: "public", chrome: "task", footerMode: "compact", texture: "none", fixture: { kind: "activity", activityId: "porto-ribeira-slow-walk" }, states: ["ready", "loading", "saved", "removed", "not-found", "error"] as const },
  "/feedback": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/feedback"), states: ["ready", "empty", "loading", "saved", "unavailable", "error"] as const },
  "/how-it-works": { scene: "cover", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/how-it-works"), states: publicReady },
  "/human-review": { scene: "redirect", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/human-review"), states: ["redirect"], redirectTo: "/local-expertise" },
  "/local-expertise": { scene: "cover", shell: "public", chrome: "public", footerMode: "full", texture: "none", fixture: staticRoute("/local-expertise"), states: publicReady },
  "/pricing": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/pricing"), states: publicReady },
  "/planner": { scene: "decision", shell: "traveler", chrome: "immersive", footerMode: "none", texture: "none", fixture: staticRoute("/planner"), states: ["ready", "loading", "saved", "error"] as const },
  "/plan": { scene: "redirect", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/plan"), states: ["redirect"], redirectTo: "/planner" },
  "/trip/new": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/trip/new"), states: ["unauthorized", "ready", "loading", "saved", "error"] as const },
  "/trip/[tripId]": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: { kind: "traveler-trip", suffix: "" }, states: ["unauthorized", "not-found", "empty", "one-selection", "multiple-selection", "loading", "conflict", "saved", "error"] as const },
  "/trip/[tripId]/map": { scene: "atlas", shell: "traveler", chrome: "immersive", footerMode: "none", texture: "none", fixture: { kind: "traveler-trip", suffix: "/map" }, states: ["unauthorized", "empty", "one-selection", "multiple-selection", "selected", "loading", "conflict", "unavailable", "error"] as const },
  "/trip/[tripId]/export": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: { kind: "traveler-trip", suffix: "/export" }, states: ["unauthorized", "empty", "loading", "pending", "saved", "error"] as const },
  "/checkout": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/checkout"), states: ["unauthorized", "not-found", "empty", "ready", "loading", "paid", "unavailable", "error"] as const },
  "/itineraries": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/itineraries"), states: utilityStates },
  "/vault": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/vault"), states: utilityStates },
  "/account": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "utility", texture: "none", fixture: staticRoute("/account"), states: utilityStates },
  "/logistics": { scene: "decision", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/logistics"), states: ["unauthorized", "not-found", "empty", "ready", "selected", "loading", "saved", "unavailable", "error"] as const },
  "/expert-chat": { scene: "utility", shell: "traveler", chrome: "task", footerMode: "none", texture: "none", fixture: staticRoute("/expert-chat"), states: ["unauthorized", "not-found", "disabled", "ineligible", "empty", "ready", "loading", "saved", "unavailable", "error"] as const },
  "/sign-in": { scene: "utility", shell: "none", chrome: "none", footerMode: "none", texture: "none", fixture: staticRoute("/sign-in"), states: ["ready", "loading", "unavailable", "error", "redirect"] as const },
  "/support": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/support"), states: publicReady },
  "/privacy": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/privacy"), states: publicReady },
  "/terms": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/terms"), states: publicReady },
  "/sustainability": { scene: "cover", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/sustainability"), states: publicReady },
  "/offline": { scene: "utility", shell: "public", chrome: "public", footerMode: "compact", texture: "none", fixture: staticRoute("/offline"), states: ["ready", "unavailable", "error"] as const },
  "/reviewer/queue": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/queue"), states: operatorStates },
  "/reviewer/history": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/history"), states: operatorStates },
  "/reviewer/profile": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/profile"), states: operatorStates },
  "/reviewer/operations": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/reviewer/operations"), states: operatorStates },
  "/reviewer/trips/[tripId]": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: { kind: "reviewer-trip" }, states: operatorStates },
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
  "/api/v1/docs": { scene: "utility", shell: "operator", chrome: "operator", footerMode: "none", texture: "none", fixture: staticRoute("/api/v1/docs"), states: ["unauthorized", "forbidden", "disabled", "ready", "loading", "unavailable", "error"] as const }
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

const flagsForState = (path: HttpRoutePath, state: RouteVisualState): Partial<Record<RouteFeatureFlag, boolean>> | undefined => {
  const flags = flagsFor(path);
  if (!flags || state !== "disabled") return flags;
  const disabledFlag: RouteFeatureFlag | undefined =
    path === "/expert-chat" ? "ENABLE_TRIP_MESSAGING" :
      path === "/api/v1/docs" ? "ENABLE_API_DOCS" :
        path === "/b2b" || path === "/b2b/[orgSlug]" ? "ENABLE_B2B_BETA" :
          path === "/guide" || path === "/guide/onboarding" ? "ENABLE_GUIDE_BETA" :
            undefined;
  return disabledFlag ? { ...flags, [disabledFlag]: false } : flags;
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

const checkoutScenarios: readonly RouteVisualScenario[] = [
  scenario("checkout--anonymous", "unauthorized", "anonymous", staticRoute("/checkout"), "desktop-mobile", { access: "redirect", noPrivateDisclosure: true }),
  scenario("checkout--no-trip", "empty", "traveler", staticRoute("/checkout"), "all-four", { access: "render", transition: "no trip is explained with one coherent planner action" }),
  scenario("checkout--foreign-trip", "not-found", "foreign-traveler", { kind: "traveler-trip", variant: "foreign", suffix: "" }, "desktop-mobile", { access: "not-found", noPrivateDisclosure: true }, { query: { trip: "fixture:foreign" } }),
  scenario("checkout--draft", "ready", "traveler", { kind: "traveler-trip", variant: "draft", suffix: "" }, "desktop-mobile", { access: "render" }, { query: { trip: "fixture:draft" } }),
  scenario("checkout--loading", "loading", "traveler", staticRoute("/checkout"), "desktop-mobile", { access: "render", transition: "checkout status is announced while the provider response is pending" }),
  scenario("checkout--paid", "paid", "traveler", { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, "desktop-mobile", { access: "render", transition: "paid status and the next refinement action remain visible" }, { query: { trip: "fixture:paid-reviewed" } }),
  scenario("checkout--provider-unavailable", "unavailable", "traveler", staticRoute("/checkout"), "desktop-mobile", { access: "render", transition: "provider recovery and one safe retry action are visible" }, { provider: "unreachable" }),
  scenario("checkout--error", "error", "traveler", staticRoute("/checkout"), "desktop-mobile", { access: "render", transition: "checkout failure preserves the trip summary and offers retry" }, { interaction: "retry" })
];

const expertChatScenarios: readonly RouteVisualScenario[] = [
  scenario("expert-chat--anonymous", "unauthorized", "anonymous", staticRoute("/expert-chat"), "desktop-mobile", { access: "redirect", noPrivateDisclosure: true }),
  scenario("expert-chat--disabled", "disabled", "traveler", staticRoute("/expert-chat"), "desktop-mobile", { access: "render", transition: "messaging is truthfully unavailable while the feature flag is off" }, { flags: { ENABLE_TRIP_MESSAGING: false } }),
  scenario("expert-chat--no-trip", "empty", "traveler", staticRoute("/expert-chat"), "all-four", { access: "render", transition: "the trip context required for messaging is explained" }, { flags: { ENABLE_TRIP_MESSAGING: true } }),
  scenario("expert-chat--foreign-trip", "not-found", "foreign-traveler", { kind: "traveler-trip", variant: "foreign", suffix: "" }, "desktop-mobile", { access: "redirect", noPrivateDisclosure: true, transition: "foreign trip context is not disclosed and returns to a safe route" }, { query: { trip: "fixture:foreign" }, flags: { ENABLE_TRIP_MESSAGING: true } }),
  scenario("expert-chat--ineligible", "ineligible", "traveler", { kind: "traveler-trip", variant: "draft", suffix: "" }, "desktop-mobile", { access: "render", transition: "draft trips receive the eligibility boundary before messaging" }, { query: { trip: "fixture:draft" }, flags: { ENABLE_TRIP_MESSAGING: true } }),
  scenario("expert-chat--ready", "ready", "traveler", { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, "desktop-mobile", { access: "render" }, { query: { trip: "fixture:paid-reviewed" }, flags: { ENABLE_TRIP_MESSAGING: true } }),
  scenario("expert-chat--sending", "loading", "traveler", { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, "desktop-mobile", { access: "render", transition: "composer announces sending" }, { query: { trip: "fixture:paid-reviewed" }, flags: { ENABLE_TRIP_MESSAGING: true }, interaction: "send" }),
  scenario("expert-chat--saved", "saved", "traveler", { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, "desktop-mobile", { access: "render", transition: "message appears once and composer clears" }, { query: { trip: "fixture:paid-reviewed" }, flags: { ENABLE_TRIP_MESSAGING: true }, interaction: "send" }),
  scenario("expert-chat--send-error", "error", "traveler", { kind: "traveler-trip", variant: "paid-reviewed", suffix: "" }, "desktop-mobile", { access: "render", transition: "draft is retained and retry is offered" }, { query: { trip: "fixture:paid-reviewed" }, flags: { ENABLE_TRIP_MESSAGING: true }, interaction: "send" }),
  scenario("expert-chat--unavailable", "unavailable", "traveler", staticRoute("/expert-chat"), "desktop-mobile", { access: "render", transition: "messaging recovery explains availability and offers a safe retry" }, { flags: { ENABLE_TRIP_MESSAGING: true }, provider: "unreachable" })
];

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
  const flags = flagsForState(path, state);
  const interaction = interactionFor(state);
  const provider = state === "unavailable" ? "unreachable" : undefined;
  const query = state === "not-found" && (path.includes("[tripId]") || ["/checkout", "/logistics", "/expert-chat"].includes(path))
    ? { trip: "fixture:foreign" }
    : undefined;
  if (!flags && !interaction && !provider && !query) return undefined;
  return { ...(flags ? { flags } : {}), ...(interaction ? { interaction } : {}), ...(provider ? { provider } : {}), ...(query ? { query } : {}) };
}

function primaryStateFor(path: HttpRoutePath, states: readonly RouteVisualState[]): RouteVisualState {
  const normal = states.find((state) => ["ready", "empty", "one-selection", "multiple-selection", "populated"].includes(state));
  if (normal) return normal;
  if (path === "/b2b/[orgSlug]") return "disabled";
  return states.find((state) => !["unauthorized", "forbidden", "not-found", "unavailable", "error"].includes(state)) ?? states[0] ?? "ready";
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
  const primaryState = primaryStateFor(path, states);
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
    scenarios.push(scenario(`${key}--specialist-new`, "disabled", "specialist-candidate", { kind: "specialist", variant: "new" }, "desktop-mobile", { access: "render", transition: "onboarding is available only after eligibility" }, { flags: { ENABLE_GUIDE_BETA: false } }));
  }
  return scenarios;
}

function buildOperatorScenarios(path: HttpRoutePath, contract: RouteSceneContract): readonly RouteVisualScenario[] {
  const key = path.slice(1).replaceAll("/", "-") || "home";
  const scenarios: RouteVisualScenario[] = [];
  const primaryState = primaryStateFor(path, contract.states);
  for (const state of contract.states) {
    if (state === "unauthorized") {
      const flags = flagsForState(path, state);
      scenarios.push(scenario(`${key}--anonymous`, state, "anonymous", contract.fixture, "desktop-mobile", { access: "redirect", noPrivateDisclosure: true }, flags ? { flags } : undefined));
      continue;
    }
    if (state === "forbidden") {
      const flags = flagsForState(path, state);
      scenarios.push(scenario(`${key}--limited-capability`, state, "limited-admin", { kind: "operator", variant: "empty" }, "desktop-mobile", { access: "render", noPrivateDisclosure: true }, flags ? { flags } : undefined));
      continue;
    }
    const flags = flagsForState(path, state);
    const foreignResource = state === "not-found" && path.includes("[tripId]");
    const reviewerRoute = path.startsWith("/reviewer/");
    const reviewerFixture: ScenarioFixture = {
      kind: "reviewer-trip",
      variant: path === "/reviewer/history" || state === "saved" ? "completed" : state === "empty" ? "unassigned" : "assigned"
    };
    const fixture: ScenarioFixture = foreignResource
      ? { kind: "traveler-trip", variant: "foreign", suffix: "" }
      : reviewerRoute
        ? reviewerFixture
        : state === "populated"
          ? { kind: "operator", variant: "populated" }
          : { kind: "operator", variant: "empty" };
    scenarios.push(scenario(
      `${key}--${state}${foreignResource ? "-foreign" : ""}`,
      state,
      foreignResource ? "foreign-traveler" : reviewerRoute ? "reviewer" : "admin",
      fixture,
      state === primaryState ? "all-four" : "desktop-mobile",
      { access: state === "not-found" ? "not-found" : "render", ...(foreignResource ? { noPrivateDisclosure: true } : {}) },
      { ...(flags ? { flags } : {}), ...(setupFor(path, state) ?? {}) }
    ));
  }
  return scenarios;
}

function buildScenarios(path: HttpRoutePath, contract: RouteSceneContract): readonly RouteVisualScenario[] {
  if (path === "/checkout") return checkoutScenarios;
  if (path === "/expert-chat") return expertChatScenarios;
  if (contract.shell === "operator") return buildOperatorScenarios(path, contract);
  if (contract.shell === "traveler" && path !== "/planner") return buildOwnerScenarios(path, contract);
  return buildPublicScenarios(path, contract);
}

/**
 * Concrete scenario arrays are intentionally keyed out here instead of being
 * inferred from a route-directory glob. A missing route is therefore a
 * compile-time parity failure and remains visible in review.
 */
export const ROUTE_SCENARIO_CATALOGUE = {
  "/": buildScenarios("/", ROUTE_PRESENTATION_CATALOGUE["/"]),
  "/portugal": buildScenarios("/portugal", ROUTE_PRESENTATION_CATALOGUE["/portugal"]),
  "/explore": buildScenarios("/explore", ROUTE_PRESENTATION_CATALOGUE["/explore"]),
  "/explore/workspace": buildScenarios("/explore/workspace", ROUTE_PRESENTATION_CATALOGUE["/explore/workspace"]),
  "/activities/[activityId]": buildScenarios("/activities/[activityId]", ROUTE_PRESENTATION_CATALOGUE["/activities/[activityId]"]),
  "/feedback": buildScenarios("/feedback", ROUTE_PRESENTATION_CATALOGUE["/feedback"]),
  "/how-it-works": buildScenarios("/how-it-works", ROUTE_PRESENTATION_CATALOGUE["/how-it-works"]),
  "/human-review": buildScenarios("/human-review", ROUTE_PRESENTATION_CATALOGUE["/human-review"]),
  "/local-expertise": buildScenarios("/local-expertise", ROUTE_PRESENTATION_CATALOGUE["/local-expertise"]),
  "/pricing": buildScenarios("/pricing", ROUTE_PRESENTATION_CATALOGUE["/pricing"]),
  "/planner": buildScenarios("/planner", ROUTE_PRESENTATION_CATALOGUE["/planner"]),
  "/plan": buildScenarios("/plan", ROUTE_PRESENTATION_CATALOGUE["/plan"]),
  "/trip/new": buildScenarios("/trip/new", ROUTE_PRESENTATION_CATALOGUE["/trip/new"]),
  "/trip/[tripId]": buildScenarios("/trip/[tripId]", ROUTE_PRESENTATION_CATALOGUE["/trip/[tripId]"]),
  "/trip/[tripId]/map": buildScenarios("/trip/[tripId]/map", ROUTE_PRESENTATION_CATALOGUE["/trip/[tripId]/map"]),
  "/trip/[tripId]/export": buildScenarios("/trip/[tripId]/export", ROUTE_PRESENTATION_CATALOGUE["/trip/[tripId]/export"]),
  "/checkout": buildScenarios("/checkout", ROUTE_PRESENTATION_CATALOGUE["/checkout"]),
  "/itineraries": buildScenarios("/itineraries", ROUTE_PRESENTATION_CATALOGUE["/itineraries"]),
  "/vault": buildScenarios("/vault", ROUTE_PRESENTATION_CATALOGUE["/vault"]),
  "/account": buildScenarios("/account", ROUTE_PRESENTATION_CATALOGUE["/account"]),
  "/logistics": buildScenarios("/logistics", ROUTE_PRESENTATION_CATALOGUE["/logistics"]),
  "/expert-chat": buildScenarios("/expert-chat", ROUTE_PRESENTATION_CATALOGUE["/expert-chat"]),
  "/sign-in": buildScenarios("/sign-in", ROUTE_PRESENTATION_CATALOGUE["/sign-in"]),
  "/support": buildScenarios("/support", ROUTE_PRESENTATION_CATALOGUE["/support"]),
  "/privacy": buildScenarios("/privacy", ROUTE_PRESENTATION_CATALOGUE["/privacy"]),
  "/terms": buildScenarios("/terms", ROUTE_PRESENTATION_CATALOGUE["/terms"]),
  "/sustainability": buildScenarios("/sustainability", ROUTE_PRESENTATION_CATALOGUE["/sustainability"]),
  "/offline": buildScenarios("/offline", ROUTE_PRESENTATION_CATALOGUE["/offline"]),
  "/reviewer/queue": buildScenarios("/reviewer/queue", ROUTE_PRESENTATION_CATALOGUE["/reviewer/queue"]),
  "/reviewer/history": buildScenarios("/reviewer/history", ROUTE_PRESENTATION_CATALOGUE["/reviewer/history"]),
  "/reviewer/profile": buildScenarios("/reviewer/profile", ROUTE_PRESENTATION_CATALOGUE["/reviewer/profile"]),
  "/reviewer/operations": buildScenarios("/reviewer/operations", ROUTE_PRESENTATION_CATALOGUE["/reviewer/operations"]),
  "/reviewer/trips/[tripId]": buildScenarios("/reviewer/trips/[tripId]", ROUTE_PRESENTATION_CATALOGUE["/reviewer/trips/[tripId]"]),
  "/admin/places": buildScenarios("/admin/places", ROUTE_PRESENTATION_CATALOGUE["/admin/places"]),
  "/admin/countries": buildScenarios("/admin/countries", ROUTE_PRESENTATION_CATALOGUE["/admin/countries"]),
  "/admin/regions": buildScenarios("/admin/regions", ROUTE_PRESENTATION_CATALOGUE["/admin/regions"]),
  "/admin/partners": buildScenarios("/admin/partners", ROUTE_PRESENTATION_CATALOGUE["/admin/partners"]),
  "/admin/reviewers": buildScenarios("/admin/reviewers", ROUTE_PRESENTATION_CATALOGUE["/admin/reviewers"]),
  "/admin/specialists": buildScenarios("/admin/specialists", ROUTE_PRESENTATION_CATALOGUE["/admin/specialists"]),
  "/admin/quality": buildScenarios("/admin/quality", ROUTE_PRESENTATION_CATALOGUE["/admin/quality"]),
  "/admin/analytics": buildScenarios("/admin/analytics", ROUTE_PRESENTATION_CATALOGUE["/admin/analytics"]),
  "/console": buildScenarios("/console", ROUTE_PRESENTATION_CATALOGUE["/console"]),
  "/console/pipeline": buildScenarios("/console/pipeline", ROUTE_PRESENTATION_CATALOGUE["/console/pipeline"]),
  "/console/workspace": buildScenarios("/console/workspace", ROUTE_PRESENTATION_CATALOGUE["/console/workspace"]),
  "/console/messages": buildScenarios("/console/messages", ROUTE_PRESENTATION_CATALOGUE["/console/messages"]),
  "/console/graph": buildScenarios("/console/graph", ROUTE_PRESENTATION_CATALOGUE["/console/graph"]),
  "/console/metrics": buildScenarios("/console/metrics", ROUTE_PRESENTATION_CATALOGUE["/console/metrics"]),
  "/console/config": buildScenarios("/console/config", ROUTE_PRESENTATION_CATALOGUE["/console/config"]),
  "/guide": buildScenarios("/guide", ROUTE_PRESENTATION_CATALOGUE["/guide"]),
  "/guide/onboarding": buildScenarios("/guide/onboarding", ROUTE_PRESENTATION_CATALOGUE["/guide/onboarding"]),
  "/b2b": buildScenarios("/b2b", ROUTE_PRESENTATION_CATALOGUE["/b2b"]),
  "/b2b/[orgSlug]": buildScenarios("/b2b/[orgSlug]", ROUTE_PRESENTATION_CATALOGUE["/b2b/[orgSlug]"]),
  "/api/v1/docs": buildScenarios("/api/v1/docs", ROUTE_PRESENTATION_CATALOGUE["/api/v1/docs"])
} satisfies Record<HttpRoutePath, readonly RouteVisualScenario[]>;
