import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HowItWorksPage from "./page";

afterEach(cleanup);

describe("HowItWorksPage", () => {
  it("orders the four How It Works chapters", () => {
    render(<HowItWorksPage />);

    expect(screen.getByTestId("how-sequence-cover")).toBeVisible();
    expect(
      screen.getAllByTestId("how-chapter").map((node) => node.getAttribute("data-step"))
    ).toEqual(["time", "judgement", "control", "review"]);
  });
});
