/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChoiceCard } from "./choice-card";

describe("ChoiceCard", () => {
  it("uses radio semantics and marks the selected choice", () => {
    const onSelect = vi.fn();

    render(
      <div role="radiogroup" aria-label="Transport">
        <ChoiceCard
          id="train"
          name="transport"
          value="train"
          label="Train"
          description="Relax between cities."
          consequence="More transfer time."
          selected
          onSelect={onSelect}
        />
      </div>
    );

    const choice = screen.getByRole("radio", { name: /Train/i });
    expect(choice).toHaveAttribute("aria-checked", "true");
    expect(choice).toHaveAttribute("data-selected", "true");
    expect(choice.className).toMatch(/shadow-focus/);

    fireEvent.click(choice);
    expect(onSelect).toHaveBeenCalledWith("train");
  });
});
