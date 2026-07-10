import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ExplorePage from "./page";

vi.mock("./activity-explorer", () => ({
  ActivityExplorer: ({ initialIntent }: { initialIntent: unknown }) => (
    <output data-testid="activity-explorer">{JSON.stringify(initialIntent)}</output>
  )
}));

describe("ExplorePage", () => {
  it("passes the public activity query into the explorer instead of redirecting", async () => {
    const page = await ExplorePage({
      searchParams: Promise.resolve({
        region: "lisbon",
        time: "three hours",
        mood: ["a walk", "culture"],
        group: "with children",
        constraint: "rain"
      })
    });

    render(page);

    const explorer = screen.getByTestId("activity-explorer").textContent ?? "";
    expect(explorer).toContain('"region":"lisbon"');
    expect(explorer).toContain('"moods":["a walk","culture"]');
  });
});
