import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TripBriefReview } from "./trip-brief-review";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
afterEach(() => cleanup());

const brief = { destinationCountry: "portugal", regions: ["porto"], tripLengthDays: 5, startDate: "", endDate: "", travelersCount: 2, travelerType: "couple", budgetLevel: "mid-range", pace: "calm", interests: ["local-food"], foodPreferences: [], avoidances: [], transportMode: "train-and-transfers", accommodationLocation: "", rawBrief: "A calm Portugal trip with local food and time to wander old streets." } as const;

describe("TripBriefReview", () => {
  it("shows prefilled summary without main-path text inputs or selects", () => {
    const { container } = render(<TripBriefReview initialBrief={brief} />);
    expect(screen.getByText("Portugal")).toBeTruthy();
    expect(screen.getByText("5 days")).toBeTruthy();
    expect(container.querySelectorAll("input, select, textarea")).toHaveLength(0);
    expect(screen.getByRole("button", { name: /refine this plan/i }).getAttribute("aria-expanded")).toBe("false");
  });

  it("surfaces top-level API field errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        message: "Please fix the highlighted fields.",
        fieldErrors: { destinationCountry: ["Destination is unavailable."] }
      })
    }));

    render(<TripBriefReview initialBrief={brief} />);
    fireEvent.click(screen.getByRole("button", { name: /audit & polish plan/i }));

    await waitFor(() => expect(screen.getByText("Destination is unavailable.")).toBeTruthy());
    expect(screen.getByText("Please fix the highlighted fields.")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("keeps date and refinement sheets choice-only", () => {
    const { container } = render(<TripBriefReview initialBrief={brief} />);

    fireEvent.click(screen.getByRole("button", { name: /dates/i }));
    expect(screen.getByRole("radio", { name: /april 10/i })).toBeTruthy();
    expect(container.querySelectorAll("input, select, textarea")).toHaveLength(0);
    fireEvent.click(screen.getByRole("radio", { name: /april 10/i }));

    fireEvent.click(screen.getByRole("button", { name: /refine this plan/i }));
    expect(screen.getByRole("group", { name: /what should the route protect/i })).toBeTruthy();
    expect(container.querySelectorAll("input, select, textarea")).toHaveLength(0);
  });
});
