import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StopFilmstrip } from "./stop-filmstrip";
import { TripContextBarClient } from "./trip-context-bar-client";
import { useMapStore } from "../../../../../store/useMapStore";
import { deriveSelectedDayFromChapter } from "./chapter-day-sync";

afterEach(() => {
  cleanup();
  useMapStore.setState({ activeStopId: null, targetCoordinates: null });
});

describe("trip route synchronization", () => {
  it("selects a stop for the map and exposes an equivalent list", () => {
    render(<StopFilmstrip stops={[{ id: "day-1-stop-0", dayIndex: 1, startTime: "09:00", placeName: "Ribeira", coordinates: [-8.61, 41.14] }]} />);
    fireEvent.click(screen.getByTestId("stop-card-day-1-stop-0"));
    expect(useMapStore.getState().activeStopId).toBe("day-1-stop-0");
    expect(useMapStore.getState().targetCoordinates).toEqual([-8.61, 41.14]);
    expect(screen.getByRole("list", { name: /Stops list/ })).toBeTruthy();
  });

  it("keeps mobile cards single-card snap sized and labels the filmstrip", () => {
    render(<StopFilmstrip stops={[{ id: "stop", dayIndex: 1, startTime: "10:00", placeName: "Clerigos", coordinates: [-8.61, 41.15] }]} />);
    expect(screen.getByTestId("filmstrip-track").className).toContain("snap-mandatory");
    expect(screen.getByRole("region", { name: /Stop filmstrip/ })).toBeTruthy();
    expect(screen.getByRole("list", { name: /Stops list/ }).className).not.toContain("sr-only");
    expect(screen.getByRole("button", { name: /Stop 1 of 1/ })).toBeTruthy();
  });

  it("syncs a selected day from a geocoded chapter but preserves it for an unresolved day", () => {
    const days = [
      { dayIndex: 1, stops: [{ placeName: "Porto", lng: -8.6, lat: 41.1 }] },
      { dayIndex: 2, stops: [{ placeName: "Pending" }] },
    ];
    expect(deriveSelectedDayFromChapter("day-1-stop-0", days, 2)).toBe(1);
    expect(deriveSelectedDayFromChapter("day-2-stop-0", days, 1)).toBe(1);
  });

  it("opens context edits from the shared context bar", () => {
    render(<TripContextBarClient draft={{ destination: "Porto", days: 5, travelWindow: null, transport: "Transit", vibe: "Balanced" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit destination" }));
    expect(screen.getByRole("dialog", { name: "Edit destination" })).toBeTruthy();
  });

  it("routes each context edit to the matching planner editor", () => {
    render(<TripContextBarClient draft={{ destination: "Porto", days: 5, travelWindow: null, transport: "Transit", vibe: "Balanced" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit transport" }));
    expect(screen.getByRole("link", { name: "Edit transport in planner" }).getAttribute("href")).toBe("/planner?edit=transport");
  });
});
