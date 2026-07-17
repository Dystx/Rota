import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import NotFound from "./not-found";

afterEach(cleanup);

describe("NotFound", () => {
  it("puts truthful recovery actions on a texture-free utility surface", () => {
    render(<NotFound />);

    expect(screen.getByTestId("not-found-recovery")).toHaveAttribute("data-surface-texture", "none");
    expect(screen.getByRole("heading", { name: /haven.t placed this page yet/i })).toBeVisible();
    const recovery = within(screen.getByRole("main"));
    expect(recovery.getByRole("link", { name: /Explore activities/i })).toBeVisible();
    expect(recovery.getByRole("link", { name: /Back to home/i })).toBeVisible();
  });
});
