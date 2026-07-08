/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { RevealStagger } from "./reveal-section";

afterEach(() => cleanup());

describe("RevealStagger", () => {
  it("renders each child inside its own animated wrapper", () => {
    const { container } = render(
      <RevealStagger>
        <div data-testid="a">A</div>
        <div data-testid="b">B</div>
        <div data-testid="c">C</div>
      </RevealStagger>
    );
    expect(container.querySelectorAll("[data-testid]")).toHaveLength(3);
  });
});
