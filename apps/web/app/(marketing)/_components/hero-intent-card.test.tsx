import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HeroIntentCard } from "./hero-intent-card";
import { StaticPortugalFallback } from "../hero-map";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@repo/spatial-engine", () => ({
  getDestinationPreset: () => null,
}));

afterEach(() => {
  cleanup();
  push.mockReset();
});

describe("HeroIntentCard", () => {
  it("renders fixed Portugal destination, duration, and travel-style choices", () => {
    render(<HeroIntentCard />);

    expect(screen.getByRole("radio", { name: /^Lisbon & Surrounds/ })).toBeDefined();
    expect(screen.getByRole("radio", { name: /^Porto & the North/ })).toBeDefined();
    expect(screen.getByRole("radio", { name: /^3 days/ })).toBeDefined();
    expect(screen.getByRole("radio", { name: /^10 days/ })).toBeDefined();
    expect(screen.getByRole("radio", { name: /^Restorative/ })).toBeDefined();
    expect(screen.getByRole("radio", { name: /^High energy/ })).toBeDefined();
  });

  it("changes visible selections and hands the draft to the planner URL", () => {
    render(<HeroIntentCard />);

    fireEvent.click(screen.getByRole("radio", { name: /^Porto & the North/ }));
    fireEvent.click(screen.getByRole("radio", { name: /^5 days/ }));
    fireEvent.click(screen.getByRole("radio", { name: /^Restorative/ }));

    expect(screen.getByRole("radio", { name: /^Porto & the North/ }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: /^5 days/ }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: /^Restorative/ }).getAttribute("aria-checked")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Build my route" }));

    expect(push).toHaveBeenCalledWith(
      "/planner?destination=porto&days=5&transport=transit&vibe=restorative",
    );
  });

  it("has no editable text input or dominant form", () => {
    const { container } = render(<HeroIntentCard />);

    expect(container.querySelector("input")).toBeNull();
    expect(container.querySelector("form")).toBeNull();
  });

  it("activates a choice with the keyboard as it does with the pointer", () => {
    render(<HeroIntentCard />);

    const azores = screen.getByRole("radio", { name: /^The Azores/ });
    fireEvent.keyDown(azores, { key: "Enter" });

    expect(azores.getAttribute("aria-checked")).toBe("true");
  });

  it("gives each static-map pin an accessible route action", () => {
    render(<StaticPortugalFallback />);

    const portoPin = screen.getByRole("button", {
      name: "Build a route for Porto & the North"
    });

    fireEvent.click(portoPin);

    expect(push).toHaveBeenCalledWith(
      "/planner?destination=porto&days=7&transport=transit&vibe=balanced"
    );
  });
});
