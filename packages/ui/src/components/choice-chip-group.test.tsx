/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

function SingleChipHarness(props: { onChange: (values: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(["food", "history"]);

  function handleChange(values: string[]): void {
    props.onChange(values);
    setSelected(values);
  }

  return (
    <ChoiceChipGroup
      label="Transport"
      options={[
        { value: "food", label: "Food" },
        { value: "history", label: "History" }
      ]}
      selected={selected}
      onChange={handleChange}
      multiple={false}
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

  it("uses radiogroup semantics and keeps only the first selected value", () => {
    render(<SingleChipHarness onChange={vi.fn()} />);

    const group = screen.getByRole("radiogroup", { name: "Transport" });
    const food = screen.getByRole("radio", { name: "Food" });
    const history = screen.getByRole("radio", { name: "History" });

    expect(group).toBeInTheDocument();
    expect(food).toHaveAttribute("aria-checked", "true");
    expect(history).toHaveAttribute("aria-checked", "false");
    expect(
      screen
        .getAllByRole("radio")
        .filter((choice) => choice.getAttribute("aria-checked") === "true")
    ).toHaveLength(1);
    expect(food).not.toHaveAttribute("aria-pressed");
    expect(history).not.toHaveAttribute("aria-pressed");
  });

  it("selects with the keyboard and reports a one-value array", () => {
    const onChange = vi.fn();
    const { container } = render(<SingleChipHarness onChange={onChange} />);
    const queries = within(container);

    const food = queries.getByRole("radio", { name: "Food" });
    const history = queries.getByRole("radio", { name: "History" });
    fireEvent.keyDown(food, { key: "ArrowRight" });

    expect(history).toHaveFocus();
    expect(history).toHaveAttribute("aria-checked", "true");
    expect(food).toHaveAttribute("aria-checked", "false");
    expect(onChange).toHaveBeenCalledWith(["history"]);
  });
});
