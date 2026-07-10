import { describe, expect, it } from "vitest";

import { HTTP_ROUTE_CATALOGUE } from "@/lib/routes/http-route-catalogue";
import { ROUTE_MATRIX } from "./route-matrix";

describe("ROUTE_MATRIX", () => {
  it("covers every catalogue route with an applicable persona and state", () => {
    for (const route of HTTP_ROUTE_CATALOGUE) {
      const rows = ROUTE_MATRIX.filter((row) => row.route === route.path);
      expect(rows.length, route.path).toBeGreaterThan(0);
      expect(rows.every((row) => row.persona && row.state)).toBe(true);
    }
  });
});
