import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../_components/pipeline-board", () => ({
  PipelineBoard: () => <div data-testid="pipeline-board" />
}));

vi.mock("./pipeline-header", () => ({
  PipelineHeader: () => <div data-testid="pipeline-header" />
}));

import { PipelinePageClient } from "./pipeline-page-client";

describe("PipelinePageClient", () => {
  it("frames the operator surface around editorial activity review", () => {
    render(<PipelinePageClient />);

    expect(screen.getByRole("heading", { name: "Activity review" })).toBeTruthy();
    expect(screen.getByText("Triage verdicts, source freshness, and reviewer follow-up.")).toBeTruthy();
    expect(screen.getByRole("region", { name: "Activity review board" }).className).toContain("rumia-pipeline-board-field");
  });
});
