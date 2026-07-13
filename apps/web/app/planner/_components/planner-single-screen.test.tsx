/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";
import { PlannerSingleScreen } from "./planner-single-screen";

const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));

describe("PlannerSingleScreen", () => {
  beforeEach(() => { cleanup(); push.mockReset(); replace.mockReset(); });

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

  it("explains that direct entry starts with an activity decision", () => {
    render(<PlannerSingleScreen />);

    expect(screen.getByTestId("planner-editorial-shell")).toBeTruthy();
    expect(screen.getByTestId("planner-brief")).toBeTruthy();
    expect(screen.getByText("Start with an activity decision")).toBeTruthy();
    expect(screen.queryByText("Advanced day planning")).toBeNull();
    expect(screen.getByRole("button", { name: "Build my itinerary" })).toBeTruthy();
  });

  it("shapes explicitly chosen activities without replacing them with a generic route brief", () => {
    render(
      <PlannerSingleScreen
        initialActivityIds={["porto-ribeira-slow-walk"]}
        initialActivities={[
          REVIEWED_ACTIVITY_SEED[0]!
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: /Shape your chosen day/i })).toBeTruthy();
    expect(screen.getByText("Ribeira and Miragaia at walking pace")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Preview this day" })).toBeTruthy();
  });

  it("tests the timing of a chosen same-region day without showing the generic trip builder", () => {
    render(
      <PlannerSingleScreen
        initialActivityIds={["porto-ribeira-slow-walk", "porto-bombarda-art-walk"]}
        initialActivities={REVIEWED_ACTIVITY_SEED.slice(0, 2)}
      />
    );

    expect(screen.queryByRole("heading", { name: "Where to?" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Preview this day" }));

    expect(screen.getByRole("heading", { name: "Does this day fit?" })).toBeTruthy();
    expect(screen.getByText(/210 minutes of selected activity time/i)).toBeTruthy();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent?.includes("leaves only about 1 hour unallocated") === true)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Build my itinerary" })).toBeNull();
  });

  it("refuses to invent a single-day route from activities in different regions", () => {
    render(
      <PlannerSingleScreen
        initialActivityIds={["porto-ribeira-slow-walk", "lisbon-alfama-slow-walk"]}
        initialActivities={[REVIEWED_ACTIVITY_SEED[0]!, REVIEWED_ACTIVITY_SEED[2]!]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Preview this day" }));

    expect(screen.getByText(/span Porto and Lisbon/i)).toBeTruthy();
    expect(screen.getByText(/treat them as different days/i)).toBeTruthy();
  });

  it("keeps changed day preferences in the browser URL without claiming a saved trip", () => {
    render(
      <PlannerSingleScreen
        initialActivityIds={["porto-ribeira-slow-walk"]}
        initialActivities={[REVIEWED_ACTIVITY_SEED[0]!]}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "A full day" }));

    expect(replace).toHaveBeenCalledWith(
      "/planner?activity=porto-ribeira-slow-walk&dayTime=full-day&transport=transit",
      { scroll: false }
    );
  });

  it("offers a sign-in return path that preserves the anonymous day draft", () => {
    render(
      <PlannerSingleScreen
        initialActivityIds={["porto-ribeira-slow-walk"]}
        initialActivities={[REVIEWED_ACTIVITY_SEED[0]!]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Preview this day" }));

    expect(screen.getByRole("link", { name: "Sign in to keep this day" }).getAttribute("href"))
      .toBe("/sign-in?next=%2Fplanner%3Factivity%3Dporto-ribeira-slow-walk%26dayTime%3Dafternoon%26transport%3Dtransit");
  });
});
