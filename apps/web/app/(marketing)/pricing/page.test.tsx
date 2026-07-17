import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PricingPage from "./page";

afterEach(cleanup);

describe("PricingPage", () => {
  it("renders truthful one-time tiers and keeps concierge as a waitlist", () => {
    render(<PricingPage />);
    expect(screen.getByRole("heading", { level: 1, name: /Keep the decisions yours/i })).toBeTruthy();
    expect(screen.getByText("€19")).toBeTruthy();
    expect(screen.getByText("€49")).toBeTruthy();
    expect(screen.getByText(/Ask about future access/i)).toBeTruthy();
    expect(screen.getByRole("region", { name: /Free activity-day preview — Included/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /On-trip concierge — Future access/i })).toBeTruthy();
  });

  it("makes the free preview the only recommended pricing choice", () => {
    render(<PricingPage />);

    expect(screen.getAllByText(/recommended/i)).toHaveLength(1);
    expect(screen.getByTestId("pricing-place-image")).toBeVisible();
    expect(screen.getByTestId("pricing-free-preview")).toContainElement(
      screen.getByRole("link", { name: /start with the free preview/i })
    );
  });
});
