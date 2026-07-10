import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PlannerPage from "./page";

vi.mock("./planner-client", () => ({
  PlannerClient: ({ initial }: { initial: unknown }) => (
    <output data-testid="planner-client">{JSON.stringify(initial)}</output>
  )
}));

describe("PlannerPage", () => {
  it("passes only reviewed explorer selections into the secondary planner", async () => {
    const page = await PlannerPage({
      searchParams: Promise.resolve({
        activity: ["porto-ribeira-slow-walk", "not-reviewed"],
        destination: "porto"
      })
    });
    render(page);

    const payload = screen.getByTestId("planner-client").textContent ?? "";
    expect(payload).toContain('"initialActivityIds":["porto-ribeira-slow-walk"]');
    expect(payload).toContain("Ribeira and Miragaia at walking pace");
  });
});
