import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PipelineBoard } from "./pipeline-board";

describe("PipelineBoard data states", () => {
  it("renders unavailable instead of fallback operational data", () => {
    render(<PipelineBoard state={{ kind: "unavailable" }} />);

    expect(screen.getByRole("heading", { name: /pipeline is unavailable/i })).toBeVisible();
    expect(screen.queryByText(/demo|fallback item|saved successfully/i)).not.toBeInTheDocument();
  });

  it("renders an explicit empty state when the persisted feed has no items", () => {
    render(<PipelineBoard state={{ kind: "empty" }} />);

    expect(screen.getByRole("heading", { name: /no activity evidence/i })).toBeVisible();
    expect(screen.queryByTestId("pipeline-card")).not.toBeInTheDocument();
  });
});
