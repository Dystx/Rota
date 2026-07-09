/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { ChoiceChipGroup } from "./choice-chip-group";

function ChipHarness() {
  const [selected, setSelected] = useState<string[]>(["food"]);

  return (
    <ChoiceChipGroup
      label="Interests"
      options={[
        { value: "food", label: "Food" },
        { value: "history", label: "History" }
      ]}
      selected={selected}
      onChange={setSelected}
    />
  );
}

describe("ChoiceChipGroup", () => {
  it("toggles choices with aria-pressed semantics", () => {
    render(<ChipHarness />);

    const food = screen.getByRole("button", { name: "Food" });
    const history = screen.getByRole("button", { name: "History" });
    expect(food).toHaveAttribute("aria-pressed", "true");
    expect(history).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(history);
    expect(history).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(food);
    expect(food).toHaveAttribute("aria-pressed", "false");
  });

  it.each(["Enter", " "])("toggles choices when %s is pressed", (key) => {
    const { container } = render(<ChipHarness />);

    const history = container.querySelector<HTMLButtonElement>('[data-chip="true"]:last-child');
    expect(history).not.toBeNull();
    fireEvent.keyDown(history!, { key });

    expect(history).toHaveAttribute("aria-pressed", "true");
  });
});
