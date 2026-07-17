import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import LocalExpertisePage from "./page";

afterEach(cleanup);

describe("LocalExpertisePage", () => {
  it("explains evidence, boundaries, turnaround, and keeps one next action", () => {
    render(<LocalExpertisePage />);

    expect(screen.getByTestId("local-expertise-evidence")).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: /What reviewers check/i })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: /What they do not promise/i })).toBeVisible();
    expect(screen.getByText(/Most review requests return within 24 hours/i)).toBeVisible();
    expect(screen.getAllByRole("link", { name: /See review access/i })).toHaveLength(1);
  });
});
