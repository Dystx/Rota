import { describe, expect, it } from "vitest";

import { HTTP_ROUTE_CATALOGUE } from "@/lib/routes/http-route-catalogue";
import { ROUTE_SCENARIO_CATALOGUE } from "@/lib/routes/route-presentation-catalogue";
import { ROUTE_MATRIX } from "./route-matrix";

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
});
