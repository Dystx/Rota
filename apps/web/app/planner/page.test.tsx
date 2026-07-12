import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import PlannerPage from "./page";

vi.mock("./planner-client", () => ({
  PlannerClient: ({ initial }: { initial: unknown }) => (
    <output data-testid="planner-client">{JSON.stringify(initial)}</output>
  )
}));

afterEach(cleanup);

describe("PlannerPage", () => {
  it("passes only reviewed explorer selections into the secondary planner", async () => {
    const page = await PlannerPage({
      searchParams: Promise.resolve({
        activity: ["porto-ribeira-slow-walk", "not-reviewed"],
        destination: "porto",
        dayTime: "full-day",
        transport: "car"
      })
    });
    render(page);

    const payload = screen.getByTestId("planner-client").textContent ?? "";
    expect(payload).toContain('"initialActivityIds":["porto-ribeira-slow-walk"]');
    expect(payload).toContain('"initialDayTime":"full-day"');
    expect(payload).toContain('"initialTransport":"car"');
    expect(payload).toContain("Ribeira and Miragaia at walking pace");
  });

  it("falls back to a safe browser-day preference when query values are unsupported", async () => {
    const page = await PlannerPage({
      searchParams: Promise.resolve({
        activity: "porto-ribeira-slow-walk",
        dayTime: "all-day",
        transport: "teleport"
      })
    });
    render(page);

    const payload = screen.getByTestId("planner-client").textContent ?? "";
    expect(payload).toContain('"initialDayTime":"afternoon"');
    expect(payload).toContain('"initialActivityTransport":"transit"');
  });
});
