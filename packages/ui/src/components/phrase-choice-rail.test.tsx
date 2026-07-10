import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PhraseChoiceRail } from "./phrase-choice-rail";

describe("PhraseChoiceRail", () => {
  it("moves focus with arrow keys and selects with Enter", () => {
    const onSelect = vi.fn();
    render(<PhraseChoiceRail options={["five days", "one week"]} selected="five days" onSelect={onSelect} />);
    const first = screen.getByRole("button", { name: "five days" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    fireEvent.keyDown(screen.getByRole("button", { name: "one week" }), { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith("one week");
  });
});
