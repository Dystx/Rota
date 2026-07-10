/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Icon } from "./icon";

afterEach(() => cleanup());

describe("Icon", () => {
  it("renders an inline svg without a font ligature", () => {
    const { container } = render(<Icon name="arrow-right" />);
    const svg = screen.getByTestId("icon");
    expect(svg.tagName).toBe("svg");
    expect(svg).toHaveAttribute("data-icon", "arrow-right");
    expect(container.querySelector(".ph, .material-symbols-outlined")).toBeNull();
  });

  it("supports a visual weight", () => {
    render(<Icon name="house" weight="bold" />);
    expect(screen.getByTestId("icon")).toHaveAttribute("stroke-width", "2.4");
  });

  it("is aria-hidden by default", () => {
    render(<Icon name="check" />);
    expect(screen.getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
  });
});
