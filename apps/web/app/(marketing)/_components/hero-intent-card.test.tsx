import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HeroIntentCard } from "./hero-intent-card";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(() => cleanup());

describe("HeroIntentCard", () => {
  it("renders only three editable phrases and one action", () => {
    render(<HeroIntentCard />);
    expect(screen.getByRole("button", { name: /^Destination,/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Duration,/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Pace,/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /plan portugal/i })).toBeTruthy();
  });

  it("hands the edited phrase choices to the planner", () => {
    render(<HeroIntentCard />);
    fireEvent.click(screen.getByRole("button", { name: /^Destination,/i }));
    fireEvent.click(screen.getByRole("button", { name: "Porto & the North" }));
    fireEvent.click(screen.getByRole("button", { name: /plan portugal/i }));
    expect(push).toHaveBeenCalledWith(expect.stringContaining("destination=porto"));
  });
});
