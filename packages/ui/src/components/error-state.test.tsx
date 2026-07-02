import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("renders with default props", () => {
    const { container } = render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("We encountered an unexpected issue while loading this content.")).toBeDefined();
    expect((container.firstChild as HTMLElement).className).toContain("min-h-[60vh]");
  });

  it("redacts raw error details by default for safety", () => {
    const sensitiveError = new Error("Database connection failed: user=admin pass=secret");
    render(<ErrorState error={sensitiveError} />);
    expect(screen.queryByText(/user=admin pass=secret/)).toBeNull();
  });

  it("shows explicit error details when showDetails is explicitly true", () => {
    const sensitiveError = new Error("Database connection failed: user=admin pass=secret");
    render(<ErrorState error={sensitiveError} showDetails={true} />);
    expect(screen.getByText("Database connection failed: user=admin pass=secret")).toBeDefined();
  });

  it("handles string error and object error format", () => {
    const { rerender } = render(<ErrorState error="Simple string error" showDetails={true} />);
    expect(screen.getByText("Simple string error")).toBeDefined();

    rerender(<ErrorState error={{ code: 500, detail: "Complex object" }} showDetails={true} />);
    expect(screen.getByText('{"code":500,"detail":"Complex object"}')).toBeDefined();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} retryText="Reload page" />);
    const btn = screen.getByText("Reload page");
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders compact variant correctly", () => {
    const { container } = render(<ErrorState variant="compact" />);
    expect((container.firstChild as HTMLElement).className).toContain("py-8");
  });

  it("renders table variant correctly", () => {
    const { container } = render(<ErrorState variant="table" />);
    expect((container.firstChild as HTMLElement).className).toContain("bg-[rgba(255,255,255,0.4)]");
  });

  it("renders form variant correctly", () => {
    const { container } = render(<ErrorState variant="form" />);
    expect((container.firstChild as HTMLElement).className).toContain("border-dashed");
  });

  it("renders map variant correctly", () => {
    const { container } = render(<ErrorState variant="map" />);
    expect((container.firstChild as HTMLElement).className).toContain("absolute inset-0");
  });
});
