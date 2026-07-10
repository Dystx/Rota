import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PricingPage from "./page";

describe("PricingPage", () => {
  it("renders truthful one-time tiers and keeps concierge as a waitlist", () => {
    render(<PricingPage />);
    expect(screen.getByRole("heading", { level: 1, name: /Choose the level of certainty/i })).toBeTruthy();
    expect(screen.getByText("€19")).toBeTruthy();
    expect(screen.getByText("€49")).toBeTruthy();
    expect(screen.getByText(/Join concierge waitlist/i)).toBeTruthy();
  });
});
