import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FeatureGrid, FeatureGridItem } from "./feature-grid";

describe("FeatureGrid", () => {
  it("renders grid container and children", () => {
    render(
      <FeatureGrid data-testid="feature-grid">
        <div data-testid="child-item">Child Component</div>
      </FeatureGrid>
    );
    expect(screen.getByTestId("feature-grid")).toBeDefined();
    expect(screen.getByTestId("child-item")).toBeDefined();
  });
});

describe("FeatureGridItem", () => {
  it("renders title and content", () => {
    render(
      <FeatureGridItem title="Curated Stays">
        Handpicked luxury hotels.
      </FeatureGridItem>
    );
    expect(screen.getByText("Curated Stays")).toBeDefined();
    expect(screen.getByText("Handpicked luxury hotels.")).toBeDefined();
  });

  it("renders icon when provided", () => {
    render(
      <FeatureGridItem title="Logistics" icon={<span data-testid="test-icon">🚗</span>}>
        Seamless logistics.
      </FeatureGridItem>
    );
    expect(screen.getByTestId("test-icon")).toBeDefined();
  });
});
