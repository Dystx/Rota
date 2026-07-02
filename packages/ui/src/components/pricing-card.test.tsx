import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PricingCard } from "./pricing-card";

describe("PricingCard", () => {
  const defaultProps = {
    title: "Standard Unlock",
    price: "$99",
    fulfillment: "Immediate digital access",
    features: ["Full itinerary", "Interactive maps"],
    action: <button>Purchase</button>,
  };

  it("renders correctly with minimum props", () => {
    render(<PricingCard {...defaultProps} />);
    expect(screen.getByText("Standard Unlock")).toBeDefined();
    expect(screen.getByText("$99")).toBeDefined();
    expect(screen.getByText("Full itinerary")).toBeDefined();
    expect(screen.getByText("Purchase")).toBeDefined();
  });

  it("renders highlighted state and badge", () => {
    render(
      <PricingCard
        {...defaultProps}
        highlighted
        highlightBadge={<span>Most Popular</span>}
        data-testid="pricing-card"
      />
    );
    expect(screen.getByText("Most Popular")).toBeDefined();
    const card = screen.getByTestId("pricing-card");
    expect(card.className).toContain("border-[var(--color-accent)]");
    expect(card.className).toContain("shadow-[var(--shadow-elevated)]");
  });

  it("renders description if provided", () => {
    render(<PricingCard {...defaultProps} description="A great plan" />);
    expect(screen.getByText("A great plan")).toBeDefined();
  });
});
