/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Icon } from "./icon";

afterEach(() => cleanup());

describe("Icon", () => {
  it("renders the regular weight class for a named glyph", () => {
    render(<Icon name="arrow-right" />);
    const span = screen.getByTestId("icon");
    expect(span).toHaveClass("ph");
    expect(span).toHaveClass("ph-arrow-right");
    expect(span).toHaveAttribute("data-icon", "arrow-right");
    expect(span).toHaveAttribute("data-weight", "regular");
  });

  it("supports bold weight class", () => {
    render(<Icon name="house" weight="bold" />);
    const span = screen.getByTestId("icon");
    expect(span).toHaveClass("ph-bold");
    expect(span).toHaveClass("ph-house");
  });

  it("is aria-hidden by default", () => {
    render(<Icon name="check" />);
    expect(screen.getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
  });
});
