import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { ActivityWorkspace } from "./activity-workspace";

afterEach(cleanup);

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

  it("shares the current chosen activities through a stable workspace link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    render(<ActivityWorkspace initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 2)} />);

    fireEvent.click(screen.getByRole("button", { name: /Share this day/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/explore/workspace?activity=porto-ribeira-slow-walk")));
    expect(screen.getByRole("status").textContent).toMatch(/Share link copied/i);
  });
});
