import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HeroIntentCard } from "./hero-intent-card";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(() => cleanup());

describe("HeroIntentCard", () => {
  it("starts with an editable activity situation instead of a route brief", () => {
    render(<HeroIntentCard />);
    expect(screen.getByRole("button", { name: /^Time available,/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Region,/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Mood,/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Who is going,/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /show me what is worth doing/i })).toBeTruthy();
  });

  it("hands edited phrase choices to the explorer", () => {
    render(<HeroIntentCard />);
    fireEvent.click(screen.getByRole("button", { name: /^Region,/i }));
    fireEvent.click(screen.getByRole("button", { name: "Porto" }));
    fireEvent.click(screen.getByRole("button", { name: /show me what is worth doing/i }));
    expect(push).toHaveBeenCalledWith(expect.stringContaining("/explore?region=porto"));
  });
});
