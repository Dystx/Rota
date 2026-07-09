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

  it("routes every context edit button to a live option sheet", () => {
    render(<PlannerSingleScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Edit destination" }));
    expect(screen.getByRole("dialog", { name: /choose a destination/i })).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Edit length" }));
    expect(screen.getByRole("dialog", { name: /how long/i })).toBeTruthy();
  });

  it("marks the primary action disabled while pending", () => {
    render(<PlannerSingleScreen />);
    const action = screen.getByRole("button", { name: "Build my itinerary" });
    expect((action as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(action);
    expect((screen.getByRole("button", { name: "Updating your route" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("keeps one focused option group on the mobile rail", () => {
    render(<PlannerSingleScreen />);
    expect(screen.getByRole("button", { name: "Where" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "How long" }));
    expect(screen.getByRole("button", { name: "How long" }).getAttribute("aria-pressed")).toBe("true");
  });
});
