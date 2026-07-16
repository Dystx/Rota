import { describe, expect, it } from "vitest";

import { HTTP_ROUTE_CATALOGUE } from "@/lib/routes/http-route-catalogue";
import { ROUTE_PRESENTATION_CATALOGUE, ROUTE_SCENARIO_CATALOGUE, type ScenarioFixture } from "@/lib/routes/route-presentation-catalogue";
import { readAdminLimitedAuthFixture } from "./fixtures/admin-limited-auth";
import { readReviewerTripFixture, reviewerTripPath, type ReviewerTripVariant } from "./fixtures/reviewer-trip";
import { readReviewedTripFixture, reviewedTripPath } from "./fixtures/reviewed-trip";
import { readSpecialistCandidateFixture, specialistCandidatePath } from "./fixtures/specialist-candidate-auth";
import { foreignTravelerTripPath, readTravelerTripFixture, travelerTripPath } from "./fixtures/traveler-trip";
import { ROUTE_MATRIX } from "./route-matrix";

type FixtureKey = "admin-limited" | "reviewed-trip" | "reviewer-trip" | "specialist-candidate" | "traveler-trip";

function resolveFixture(fixture: FixtureKey | ScenarioFixture, suffix = ""): string {
  if (typeof fixture === "string") {
    if (fixture === "admin-limited") return "/admin/analytics";
    if (fixture === "reviewed-trip") return reviewedTripPath(suffix);
    if (fixture === "reviewer-trip") return reviewerTripPath();
    if (fixture === "specialist-candidate") return specialistCandidatePath();
    return travelerTripPath(suffix);
  }

  switch (fixture.kind) {
    case "activity":
      return `/activities/${encodeURIComponent(fixture.activityId)}`;
    case "organization":
      return `/b2b/${encodeURIComponent(fixture.slug)}`;
    case "operator":
      return "/admin/analytics";
    case "specialist":
      return specialistCandidatePath();
    case "reviewer-trip":
      return reviewerTripPath(("variant" in fixture ? fixture.variant : "assigned") as ReviewerTripVariant);
    case "traveler-trip":
      if ("variant" in fixture && fixture.variant === "paid-reviewed") return reviewedTripPath(fixture.suffix);
      if ("variant" in fixture && fixture.variant === "foreign") return foreignTravelerTripPath(fixture.suffix);
      return travelerTripPath(fixture.suffix);
    case "static":
      return fixture.path.replace("/[orgSlug]", "/e2e-organization");
  }
}

describe("ROUTE_MATRIX", () => {
  it("covers every scenario with the required viewport evidence", () => {
    for (const route of HTTP_ROUTE_CATALOGUE) {
      const scenarios = ROUTE_SCENARIO_CATALOGUE[route.path];
      const rows = ROUTE_MATRIX.filter((row) => row.route === route.path);
      expect(rows.length, route.path).toBeGreaterThan(0);
      expect(new Set(rows.map((row) => row.id)).size, route.path).toBe(scenarios.length);
      for (const scenario of scenarios) {
        const scenarioRows = rows.filter((row) => row.id === scenario.id);
        expect(scenarioRows.every((row) => row.scenario === scenario), scenario.id).toBe(true);
        if (scenario.state === "redirect") {
          expect(scenarioRows.map((row) => row.viewport), scenario.id).toEqual(["redirect"]);
        } else if (scenario.viewports === "all-four") {
          expect(scenarioRows.map((row) => row.viewport), scenario.id).toEqual([
            "desktop-1440",
            "tablet-landscape",
            "tablet-portrait",
            "mobile-390"
          ]);
        } else {
          expect(scenarioRows.map((row) => row.viewport), scenario.id).toEqual(["desktop-1440", "mobile-390"]);
        }
      }
    }
  });

  it("preserves access transitions and scene metadata on every row", () => {
    for (const row of ROUTE_MATRIX) {
      expect(row.id).toBe(row.scenario.id);
      expect(row.expected.access).toMatch(/^(render|redirect|not-found)$/u);
      expect(row.scene).toBeTruthy();
      expect(row.shell).toBeTruthy();
      expect(row.footerMode).toBeTruthy();
      expect(row.texture).toBe("none");
    }
  });

  it("declares deterministic fixtures for every dynamic authorized state", () => {
    expect(resolveFixture("reviewer-trip")).toMatch(/^\/reviewer\/trips\/[0-9a-f-]+$/u);
    expect(resolveFixture("traveler-trip", "/map")).toMatch(/^\/trip\/[0-9a-f-]+\/map$/u);
    expect(resolveFixture("traveler-trip", "/export")).toMatch(/^\/trip\/[0-9a-f-]+\/export$/u);
    expect(resolveFixture("reviewed-trip")).toMatch(/^\/trip\/[0-9a-f-]+$/u);
    expect(resolveFixture("specialist-candidate")).toBe("/guide/onboarding");
    expect(resolveFixture("admin-limited")).toBe("/admin/analytics");

    expect(readReviewerTripFixture("assigned").tripId).toMatch(/^[0-9a-f-]+$/u);
    expect(readReviewerTripFixture("completed").tripId).toMatch(/^[0-9a-f-]+$/u);
    expect(readReviewedTripFixture().tripId).toMatch(/^[0-9a-f-]+$/u);
    expect(readSpecialistCandidateFixture().userId).toMatch(/^[0-9a-f-]+$/u);
    expect(readTravelerTripFixture().tripId).toMatch(/^[0-9a-f-]+$/u);
    expect(readAdminLimitedAuthFixture().userId).toMatch(/^[0-9a-f-]+$/u);
  });

  it("never declares an organization-ready fixture", () => {
    expect(ROUTE_PRESENTATION_CATALOGUE["/b2b/[orgSlug]"].states).not.toContain("ready");
    expect(ROUTE_SCENARIO_CATALOGUE["/b2b/[orgSlug]"].some((scenario) => scenario.state === "ready")).toBe(false);
  });

  it("does not use route catalogue placeholders for resolved capture paths", () => {
    for (const row of ROUTE_MATRIX) {
      const resolved = resolveFixture(row.scenario.fixture);
      expect(resolved, row.id).not.toMatch(/[\[\]]/u);
    }
  });
});
