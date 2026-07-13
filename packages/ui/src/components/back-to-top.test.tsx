/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BackToTop } from "./back-to-top";

describe("BackToTop", () => {
  afterEach(() => cleanup());

  it("uses the shared SVG icon instead of a font ligature", () => {
    render(<BackToTop />);

    const button = document.querySelector<HTMLButtonElement>('button[aria-label="Back to top"]');
    expect(button).not.toBeNull();
    expect(button!.querySelector("[data-icon='arrow-up']")).toBeInTheDocument();
    expect(button!).not.toHaveTextContent("arrow_upward");
  });

  it("returns to the top when activated", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    render(<BackToTop />);

    const button = document.querySelector<HTMLButtonElement>('button[aria-label="Back to top"]');
    expect(button).not.toBeNull();
    fireEvent.click(button!);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollTo.mockRestore();
  });
});
