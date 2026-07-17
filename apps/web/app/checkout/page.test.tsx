import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CheckoutPage from "./page";

const { getOwnedTrip } = vi.hoisted(() => ({
  getOwnedTrip: vi.fn()
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

vi.mock("@/app/lib/trip-access", () => ({
  getOwnedTrip
}));

vi.mock("../_components/public-route-layout", () => ({
  PublicRouteLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-route-layout">{children}</div>
  )
}));

afterEach(() => cleanup());

describe("CheckoutPage", () => {
  it("keeps an unlinked checkout route to one truthful saved-day handoff", async () => {
    const page = await CheckoutPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByRole("heading", { level: 1, name: /Checkout follows a considered day/i })).toBeTruthy();
    expect(screen.getByTestId("checkout-no-trip").getAttribute("data-kind")).toBe("empty");
    expect(screen.getByRole("link", { name: "Shape a day" }).getAttribute("href")).toBe("/planner");
    expect(screen.getByRole("link", { name: "Explore activities" }).getAttribute("href")).toBe("/explore");
    expect(screen.queryByTestId("checkout-package-selector")).toBeNull();
  });

  it("turns an already paid trip into a handoff instead of another purchase", async () => {
    getOwnedTrip.mockResolvedValue({
      kind: "ok",
      trip: {
        brief: {
          accommodationLocation: "Porto historic center",
          avoidances: [],
          budgetLevel: "mid-range",
          destinationCountry: "portugal",
          endDate: "",
          foodPreferences: [],
          interests: [],
          pace: "calm",
          rawBrief: "A calm Portugal day.",
          regions: ["porto"],
          startDate: "",
          transportMode: "train-and-transfers",
          travelerType: "couple",
          travelersCount: 2,
          tripLengthDays: 3
        },
        hasHumanReview: false,
        id: "trip-paid",
        isPaid: true,
        ownerUserId: "traveler-1",
        status: "paid",
        title: "A calm Porto day"
      }
    });

    render(await CheckoutPage({ searchParams: Promise.resolve({ trip: "trip-paid" }) }));

    expect(screen.getByTestId("checkout-paid-state")).toBeInTheDocument();
    expect(screen.getByText("This day is already unlocked.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open your day" }).getAttribute("href")).toBe("/trip/trip-paid");
    expect(screen.queryByTestId("checkout-package-selector")).toBeNull();
    expect(screen.queryByTestId("checkout-upgrade-finalize")).toBeNull();
  });
});
