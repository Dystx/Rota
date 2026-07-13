import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PortugalPage from "./page";

vi.mock("./portugal-atlas", () => ({
  PortugalAtlas: () => <section data-testid="activity-collections" />
}));

describe("PortugalPage", () => {
  it("introduces Portugal through activity decisions, not a trip route", () => {
    render(<PortugalPage />);

    expect(screen.getByRole("heading", { name: /What deserves your time in Portugal/i })).toBeTruthy();
    expect(screen.getByTestId("portugal-atlas-intro")).toBeTruthy();
    expect(screen.getByText("5 regions, one activity-first lens")).toBeTruthy();
    expect(screen.getByTestId("activity-collections")).toBeTruthy();
    expect(screen.queryByText(/Build a route/i)).toBeNull();
  });
});
