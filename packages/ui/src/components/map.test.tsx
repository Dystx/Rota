/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapPanel, RouteMap } from "./map";

describe("MapPanel", () => {
  it("makes the scrollable details surface keyboard discoverable", () => {
    render(
      <MapPanel>
        <p>Selected activities</p>
      </MapPanel>
    );

    const panel = screen.getByRole("region", { name: "Selected day details" });
    expect(panel).toHaveAttribute("tabindex", "0");
    expect(panel).toHaveTextContent("Selected activities");
  });

  it("preserves explicit accessibility props", () => {
    render(
      <MapPanel role="complementary" tabIndex={-1} aria-label="Day one activities">
        <p>Day one</p>
      </MapPanel>
    );

    const panel = screen.getByRole("complementary", { name: "Day one activities" });
    expect(panel).toHaveAttribute("tabindex", "-1");
  });
});

describe("RouteMap", () => {
  it("can suppress the generic fallback notice when the host provides contextual status", () => {
    render(<RouteMap showFallbackNotice={false} />);

    expect(screen.queryByText("Schematic route map shown while interactive map is unavailable")).toBeNull();
  });
});
