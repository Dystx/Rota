/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlannerSingleScreen } from "./planner-single-screen";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("PlannerSingleScreen", () => {
  beforeEach(() => { cleanup(); push.mockReset(); });

  it("composes choices, updates summary, and hands off the draft URL", () => {
    const { container } = render(<PlannerSingleScreen />);
    expect(container.querySelectorAll("input, textarea")).toHaveLength(0);
    fireEvent.click(screen.getByRole("radio", { name: /Lisbon Tile-lined/i }));
    fireEvent.click(screen.getByRole("radio", { name: /5 days A different/i }));
    fireEvent.click(screen.getByRole("radio", { name: "Rental car" }));
    expect(screen.getByRole("region", { name: "Trip summary" }).textContent).toContain("Lisbon");
    fireEvent.click(screen.getByRole("button", { name: "Build my itinerary" }));
    expect(push).toHaveBeenCalledWith(expect.stringContaining("destination=Lisbon"));
  });

  it("opens the travel window sheet and closes it with Escape", () => {
    render(<PlannerSingleScreen />);
    fireEvent.click(screen.getAllByRole("button", { name: "Choose travel window" })[0]!);
    expect(screen.getByRole("dialog", { name: /when will you go/i })).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: /when will you go/i })).toBeNull();
  });
});
