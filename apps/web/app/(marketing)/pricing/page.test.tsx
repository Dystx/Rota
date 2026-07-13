import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PricingPage from "./page";

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
});
