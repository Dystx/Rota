import type { BrowserContextOptions } from "@playwright/test";

import { createAdminLimitedStorageState } from "./fixtures/admin-limited-auth";
import { createAdminStorageState } from "./fixtures/admin-auth";
import { createReviewerStorageState } from "./fixtures/reviewer-auth";
import { createSpecialistCandidateStorageState } from "./fixtures/specialist-candidate-auth";
import { reviewerTripPath, type ReviewerTripVariant } from "./fixtures/reviewer-trip";
import { reviewedTripPath } from "./fixtures/reviewed-trip";
import { foreignTravelerTripPath, travelerTripPath } from "./fixtures/traveler-trip";
import { ROUTE_MATRIX, type RouteMatrixRow, type RouteMatrixViewport } from "./route-matrix";

export const ACCEPTANCE_VIEWPORTS = {
  "desktop-1440": { width: 1440, height: 1000 },
  "tablet-landscape": { width: 1024, height: 768 },
  "tablet-portrait": { width: 768, height: 1024 },
  "mobile-390": { width: 390, height: 844 }
} as const;

export type ExecutableRouteScenario = RouteMatrixRow & {
  url: string;
  redirectTo?: string;
  storageState?: string;
};

function appendQuery(url: string, query: Readonly<Record<string, string>> | undefined): string {
  if (!query) return url;
  const search = new URLSearchParams(query).toString();
  return search ? `${url}${url.includes("?") ? "&" : "?"}${search}` : url;
}

function dynamicPath(row: RouteMatrixRow): string {
  const fixture = row.scenario.fixture;

  if (row.route === "/activities/[activityId]" && fixture.kind === "activity") {
    return `/activities/${encodeURIComponent(fixture.activityId)}`;
  }

  if (row.route === "/trip/[tripId]" || row.route === "/trip/[tripId]/map" || row.route === "/trip/[tripId]/export") {
    if (fixture.kind !== "traveler-trip") return travelerTripPath();
    if ("variant" in fixture && fixture.variant === "paid-reviewed") return reviewedTripPath(fixture.suffix);
    if ("variant" in fixture && fixture.variant === "foreign") return foreignTravelerTripPath(fixture.suffix);
    return travelerTripPath(fixture.suffix);
  }

  if (row.route === "/reviewer/trips/[tripId]" && fixture.kind === "reviewer-trip") {
    const variant: ReviewerTripVariant = "variant" in fixture ? fixture.variant : "assigned";
    return reviewerTripPath(variant);
  }

  if (row.route === "/b2b/[orgSlug]") {
    return `/b2b/${fixture.kind === "organization" ? encodeURIComponent(fixture.slug) : "e2e-organization"}`;
  }

  if (fixture.kind === "static") return fixture.path.replace("/[orgSlug]", "/e2e-organization");
  return row.route;
}

export function resolveScenarioUrl(row: RouteMatrixRow): string {
  // Checkout, logistics, and messaging intentionally use the route-level
  // fixture token in their query rather than navigating to the trip itself.
  return appendQuery(dynamicPath(row), row.scenario.setup?.query);
}

export function storageStateForPersona(persona: RouteMatrixRow["persona"]): string | undefined {
  switch (persona) {
    case "traveler":
    case "foreign-traveler":
      return createTravelerStorageState();
    case "reviewer":
      return createReviewerStorageState();
    case "admin":
      return createAdminStorageState();
    case "limited-admin":
      return createAdminLimitedStorageState();
    case "specialist-candidate":
      return createSpecialistCandidateStorageState();
    case "public":
    case "anonymous":
      return undefined;
  }
}

export function viewportForMatrix(row: Pick<RouteMatrixRow, "viewport">): BrowserContextOptions["viewport"] {
  if (row.viewport === "redirect") return ACCEPTANCE_VIEWPORTS["desktop-1440"];
  return ACCEPTANCE_VIEWPORTS[row.viewport];
}

export function resolveRouteScenarios(): readonly ExecutableRouteScenario[] {
  return ROUTE_MATRIX.map((row) => ({
    ...row,
    url: resolveScenarioUrl(row),
    ...(row.scene === "redirect" ? { redirectTo: row.route === "/human-review" ? "/local-expertise" : "/planner" } : {}),
    ...(storageStateForPersona(row.persona) ? { storageState: storageStateForPersona(row.persona) } : {})
  }));
}

export function primaryBaselineRows(): readonly ExecutableRouteScenario[] {
  const candidates = resolveRouteScenarios().filter(
    (row) => row.viewport === "desktop-1440" && row.viewports === "all-four" && row.expected.access === "render"
  );
  const seen = new Set<string>();
  return candidates.filter((row) => {
    if (seen.has(row.route)) return false;
    seen.add(row.route);
    return true;
  }).flatMap((row) => {
    const mobile = resolveRouteScenarios().find((candidate) => candidate.id === row.id && candidate.viewport === "mobile-390");
    return mobile ? [row, mobile] : [row];
  });
}

export function baselineSnapshotName(row: Pick<ExecutableRouteScenario, "id" | "viewport">): string {
  return `${row.id}--${row.viewport}.png`;
}

export function exactArtifactEnvironment(): { buildId?: string; digest?: string } {
  return {
    buildId: process.env.PLAYWRIGHT_BUILD_ID,
    digest: process.env.PLAYWRIGHT_BUILD_DIGEST
  };
}

export function assertExactArtifactReceipt(): void {
  if (process.env.PLAYWRIGHT_EXTERNAL_SERVER !== "1") return;
  const { buildId, digest } = exactArtifactEnvironment();
  if (!buildId || !/^[a-f0-9]{64}$/iu.test(digest ?? "")) {
    throw new Error("PLAYWRIGHT_EXTERNAL_SERVER=1 requires PLAYWRIGHT_BUILD_ID and a SHA-256 PLAYWRIGHT_BUILD_DIGEST");
  }
}
