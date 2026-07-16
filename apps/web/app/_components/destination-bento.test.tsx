import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useMapStore } from "@/store/useMapStore";
import { DestinationBento } from "./destination-bento";

const push = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

vi.mock("@repo/spatial-engine", () => ({
  getDestinationPreset: (slug: string) => ({
    camera: { center: slug === "lisbon" ? [-9.1393, 38.7223] : [-8.0, 40.0] }
  })
}));

afterEach(() => {
  cleanup();
  push.mockReset();
  Reflect.deleteProperty(document, "startViewTransition");
  useMapStore.setState({ activeStopId: null, targetCoordinates: null });
});

describe("DestinationBento plan mode", () => {
  it("uses the visible Lisbon card as the route link and preserves map selection", () => {
    render(<DestinationBento mode="plan" />);

    const card = screen.getByTestId("bento-card-lisbon");
    expect(card.tagName).toBe("A");
    expect(card.getAttribute("href")).toBe(
      "/planner?destination=lisbon&days=7&transport=transit&vibe=balanced"
    );

    fireEvent.click(card);

    expect(push).toHaveBeenCalledWith(
      "/planner?destination=lisbon&days=7&transport=transit&vibe=balanced"
    );
    expect(useMapStore.getState().activeStopId).toBe("lisbon");
    expect(useMapStore.getState().targetCoordinates).toEqual([-9.1393, 38.7223]);
  });

  it("uses the same route when keyboard activation dispatches a link click", () => {
    render(<DestinationBento mode="plan" />);

    const card = screen.getByTestId("bento-card-lisbon");
    card.focus();
    fireEvent.click(card, { detail: 0 });

    expect(push).toHaveBeenCalledWith(
      "/planner?destination=lisbon&days=7&transport=transit&vibe=balanced"
    );
  });

  it("uses a supported view transition without making navigation depend on it", () => {
    const startViewTransition = vi.fn((update: () => void) => update());
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition
    });
    render(<DestinationBento mode="plan" />);

    fireEvent.click(screen.getByTestId("bento-card-lisbon"));

    expect(startViewTransition).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith(
      "/planner?destination=lisbon&days=7&transport=transit&vibe=balanced"
    );
  });
});

describe("DestinationBento activity mode", () => {
  it("takes a region card to reviewed activities, not a planner or map workspace", () => {
    render(<DestinationBento mode="explore" />);

    const card = screen.getByTestId("bento-card-lisbon");
    expect(card.getAttribute("href")).toBe("/explore?region=lisbon");
    expect(card.getAttribute("aria-label")).toMatch(/judged activities/i);
  });

  it("frames each region as a worthwhile activity decision", () => {
    render(<DestinationBento mode="explore" />);

    expect(screen.getByText("A slower Lisbon afternoon")).toBeTruthy();
    expect(screen.getByText("Walking, culture, and a better sense of when to stop.")).toBeTruthy();
    expect(screen.getAllByText("See worthwhile activities")).toHaveLength(3);
    expect(screen.getByText("A day shaped around the Douro")).toBeTruthy();
  });

  it("uses Lisbon artwork and does not mislabel the Porto street photo", () => {
    render(<DestinationBento mode="explore" />);

    expect(screen.getByRole("img", { name: /Lisbon and the Tagus light/i }).getAttribute("src")).toBe(
      "/trip-covers/lisbon-tagus.svg"
    );
    expect(screen.getByTestId("bento-card-lisbon").textContent).not.toMatch(/Porto/i);
  });

  it("uses the card image as the only requested media layer", () => {
    render(<DestinationBento mode="explore" />);

    for (const slug of ["lisbon", "douro", "azores"] as const) {
      const card = screen.getByTestId(`bento-card-${slug}`);
      expect(card.getAttribute("style") ?? "").not.toMatch(/background-image/i);
      expect(card.querySelector("img")?.getAttribute("src")).toBeTruthy();
    }
  });
});
