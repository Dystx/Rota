import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ItinerarySearch } from "./itinerary-search";

vi.mock("./itinerary-export-drawer", () => ({
  ItineraryExportDrawer: () => null
}));

vi.mock("@repo/ui", () => ({
  Icon: ({ name, ...props }: { name: string } & React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-icon={name} {...props} />
  ),
  DecisionStatePanel: ({
    kind,
    tone,
    title,
    description,
    primaryAction,
    secondaryAction,
    ...props
  }: {
    kind: string;
    tone?: string;
    title?: string;
    description?: string;
    primaryAction?: React.ReactNode;
    secondaryAction?: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} data-kind={kind} data-tone={tone}>
      {title}
      {description}
      {primaryAction}
      {secondaryAction}
    </div>
  )
}));

afterEach(cleanup);

const trips = [
  {
    id: "trip-porto",
    title: "Porto by the river",
    status: "draft",
    brief: {
      destinationCountry: "Portugal",
      regions: ["Porto"],
      interests: ["walking"]
    }
  }
] as never[];

describe("ItinerarySearch", () => {
  it("gives a saved archive a clear next action beside the results", () => {
    render(<ItinerarySearch trips={trips} />);

    expect(screen.getByTestId("itinerary-next-action")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open saved plan" }).getAttribute("href")).toBe("/trip/trip-porto");
    expect(screen.getByRole("link", { name: "Shape another day" }).getAttribute("href")).toBe("/explore");
    expect(screen.getByRole("list").className).toContain("md:grid-cols-1");
    expect(screen.getByTestId("itinerary-card-cover-image-trip-porto").getAttribute("src")).toBe("/trip-covers/porto-ribeira.svg");
    expect(screen.getByTestId("itinerary-search-input").getAttribute("placeholder")).toBe("Search itineraries…");
  });

  it("provides a direct reset action for filtered empty results", () => {
    render(<ItinerarySearch trips={trips} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search itineraries" }), {
      target: { value: "Madeira" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Drafts" }));

    expect(screen.getByTestId("itinerary-filtered-empty")).toBeTruthy();
    expect(screen.getByTestId("itinerary-filtered-empty").getAttribute("data-kind")).toBe("empty");
    expect(screen.getByTestId("itinerary-filtered-empty").getAttribute("data-tone")).toBe("inverse");
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.queryByTestId("itinerary-filtered-empty")).toBeNull();
    expect(screen.getByTestId("itinerary-card-trip-porto")).toBeTruthy();
    expect((screen.getByRole("searchbox", { name: "Search itineraries" }) as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("itinerary-search-input").className).toContain("min-h-11");
    expect(screen.getByTestId("itinerary-filter-all").className).toContain("min-h-11");
  });
});
