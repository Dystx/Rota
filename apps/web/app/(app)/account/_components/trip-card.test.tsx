import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountTripCard } from "./trip-card";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

afterEach(cleanup);

describe("AccountTripCard", () => {
  it("uses the manifest-backed regional cover with a gradient fallback", () => {
    render(
      <AccountTripCard
        trip={{
          id: "trip-lisbon",
          title: "Lisbon slow plan",
          status: "DRAFT",
          createdAt: "2026-07-11T00:00:00.000Z",
          hasHumanReview: false,
          isPaid: false,
          brief: {
            regions: ["lisbon"],
            tripLengthDays: 5,
            interests: ["local-food"]
          }
        }}
      />
    );

    const cover = screen.getByTestId("account-trip-cover-image");
    expect(cover.getAttribute("src")).toBe("/trip-covers/lisbon-tagus.svg");
    expect(screen.getByTestId("account-trip-cover").getAttribute("style")).toContain("linear-gradient");
    expect(screen.getByRole("link", { name: "Open saved plan" }).getAttribute("href")).toBe("/trip/trip-lisbon");
  });
});
