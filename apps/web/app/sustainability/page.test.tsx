import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import SustainabilityPage from "./page";

afterEach(cleanup);

describe("SustainabilityPage", () => {
  it("uses a static landscape cover followed by measurable evidence", () => {
    render(<SustainabilityPage />);

    const media = screen.getByTestId("sustainability-place-media");
    expect(media).toHaveAttribute("data-motion-policy", "poster-only");
    expect(media.querySelector("video")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Commitments we can explain/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /What we do not claim/i })).toBeVisible();
  });
});
