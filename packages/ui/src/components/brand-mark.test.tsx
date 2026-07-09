/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BrandMark } from "./brand-mark";

afterEach(() => cleanup());

describe("BrandMark", () => {
  it("renders with an accessible name of 'Rumia' by default", () => {
    render(<BrandMark />);
    const mark = screen.getByRole("img", { name: "Rumia" });
    expect(mark).toBeInTheDocument();
  });

  it("renders the inner SVG with a 64x64 viewBox", () => {
    const { container } = render(<BrandMark size="md" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 64 64");
  });

  it("honors the tone prop on the wrapper", () => {
    const { container } = render(<BrandMark tone="dark" />);
    const mark = container.querySelector("[data-testid='brand-mark']");
    expect(mark).toHaveAttribute("data-tone", "dark");
  });

  it("respects a custom label", () => {
    render(<BrandMark label="Rumia Planner" />);
    expect(
      screen.getByRole("img", { name: "Rumia Planner" })
    ).toBeInTheDocument();
  });
});
