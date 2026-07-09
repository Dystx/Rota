import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { TripBriefReview } from "./trip-brief-review";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const brief = { destinationCountry: "portugal", regions: ["porto"], tripLengthDays: 5, startDate: "", endDate: "", travelersCount: 2, travelerType: "couple", budgetLevel: "mid-range", pace: "calm", interests: ["local-food"], foodPreferences: [], avoidances: [], transportMode: "train-and-transfers", accommodationLocation: "", rawBrief: "A calm Portugal trip with local food and time to wander old streets." } as const;

describe("TripBriefReview", () => {
  it("shows prefilled summary without main-path text inputs or selects", () => {
    const { container } = render(<TripBriefReview initialBrief={brief} />);
    expect(screen.getByText("Portugal")).toBeTruthy();
    expect(screen.getByText("5 days")).toBeTruthy();
    expect(container.querySelectorAll("input, select, textarea")).toHaveLength(0);
    expect(screen.getByRole("button", { name: /refine this plan/i }).getAttribute("aria-expanded")).toBe("false");
  });
});
