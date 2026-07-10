import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityWorkspace } from "./activity-workspace";

describe("ActivityWorkspace", () => {
  it("keeps a chosen day specific and makes removing an activity reversible", () => {
    render(<ActivityWorkspace initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 2)} />);

    expect(screen.getByRole("heading", { name: /Your tentative day/i })).toBeTruthy();
    expect(screen.getByText("Ribeira and Miragaia at walking pace")).toBeTruthy();
    expect(screen.getAllByText(/Rumia's judgement/i).length).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", { name: /Remove Ribeira and Miragaia at walking pace/i })
    );

    expect(screen.queryByText("Ribeira and Miragaia at walking pace")).toBeNull();
    expect(screen.getByText(/Keep exploring/i)).toBeTruthy();
  });
});
