import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders with default cinematic variant", () => {
    const { container } = render(<EmptyState title="No items found" description="Try again later" />);
    expect(screen.getByText("No items found")).toBeDefined();
    expect(screen.getByText("Try again later")).toBeDefined();
    expect(container.firstChild).toHaveProperty("className");
    expect((container.firstChild as HTMLElement).className).toContain("min-h-[60vh]");
  });

  it("renders table variant correctly", () => {
    const { container } = render(<EmptyState variant="table" title="No items in table" />);
    expect(screen.getByText("No items in table")).toBeDefined();
    expect((container.firstChild as HTMLElement).className).toContain("border-b");
  });

  it("renders compact variant correctly", () => {
    const { container } = render(<EmptyState variant="compact" title="Compact empty" />);
    expect(screen.getByText("Compact empty")).toBeDefined();
    expect((container.firstChild as HTMLElement).className).toContain("py-8");
  });

  it("renders form variant correctly", () => {
    const { container } = render(<EmptyState variant="form" title="Form empty" />);
    expect(screen.getByText("Form empty")).toBeDefined();
    expect((container.firstChild as HTMLElement).className).toContain("border-dashed");
  });

  it("renders map variant correctly", () => {
    const { container } = render(<EmptyState variant="map" title="Map empty" />);
    expect(screen.getByText("Map empty")).toBeDefined();
    expect((container.firstChild as HTMLElement).className).toContain("absolute inset-0");
  });

  it("renders with action and icon", () => {
    render(
      <EmptyState 
        title="Title" 
        icon={<div data-testid="icon">Icon</div>} 
        action={<button data-testid="action">Action</button>} 
      />
    );
    expect(screen.getByTestId("icon")).toBeDefined();
    expect(screen.getByTestId("action")).toBeDefined();
  });
});
