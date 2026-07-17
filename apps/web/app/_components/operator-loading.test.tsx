import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { OperatorLoading } from "./operator-loading";

afterEach(cleanup);

describe("OperatorLoading", () => {
  it("keeps the admin stream inside the operator surface", () => {
    render(<OperatorLoading section="admin" />);

    const root = screen.getByTestId("operator-loading");
    expect(root.getAttribute("data-operator-section")).toBe("admin");
    expect(root.classList.contains("rumia-operator-shell")).toBe(true);
    expect(root.classList.contains("rumia-surface-linen")).toBe(true);
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
  });

  it("uses a smaller reviewer navigation skeleton", () => {
    render(<OperatorLoading section="reviewer" />);

    expect(screen.getByTestId("operator-loading").getAttribute("data-operator-section")).toBe("reviewer");
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("keeps the console loading content wide", () => {
    render(<OperatorLoading section="console" />);

    expect(screen.getByTestId("operator-loading").querySelector(".max-w-\\[1440px\\]")).toBeTruthy();
  });
});
