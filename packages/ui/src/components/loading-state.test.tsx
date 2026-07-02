import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingState, Skeleton } from "./loading-state";

describe("LoadingState", () => {
  it("renders spinner by default", () => {
    const { container } = render(<LoadingState text="Loading content..." />);
    expect(screen.getByText("Loading content...")).toBeDefined();
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.className.baseVal).toContain("animate-spin");
  });

  it("can hide spinner", () => {
    const { container } = render(<LoadingState hideSpinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeNull();
  });

  it("renders table variant correctly", () => {
    const { container } = render(<LoadingState variant="table" />);
    expect((container.firstChild as HTMLElement).className).toContain("bg-[rgba(255,255,255,0.4)]");
  });

  it("renders compact variant correctly", () => {
    const { container } = render(<LoadingState variant="compact" />);
    expect((container.firstChild as HTMLElement).className).toContain("py-8");
  });

  it("renders form variant correctly", () => {
    const { container } = render(<LoadingState variant="form" />);
    expect((container.firstChild as HTMLElement).className).toContain("border-dashed");
  });

  it("renders map variant correctly", () => {
    const { container } = render(<LoadingState variant="map" />);
    expect((container.firstChild as HTMLElement).className).toContain("absolute inset-0");
  });
});

describe("Skeleton", () => {
  it("renders pulse animation", () => {
    const { container } = render(<Skeleton className="w-10 h-10" />);
    expect((container.firstChild as HTMLElement).className).toContain("animate-pulse");
    expect((container.firstChild as HTMLElement).className).toContain("w-10 h-10");
  });
});
