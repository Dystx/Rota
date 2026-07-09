/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { OptionSheet } from "./option-sheet";

function SheetHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open options
      </button>
      <OptionSheet open={open} title="Choose a route" onClose={() => setOpen(false)}>
        <input aria-label="Route name" />
        <button type="button">Continue</button>
      </OptionSheet>
    </>
  );
}

describe("OptionSheet", () => {
  it("traps focus and restores it to the trigger after closing", () => {
    render(<SheetHarness />);
    const trigger = screen.getByRole("button", { name: "Open options" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Choose a route" });
    const closeButton = screen.getByRole("button", { name: "Close dialog" });
    expect(screen.getByLabelText("Route name")).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByLabelText("Route name")).toHaveFocus();

    fireEvent.click(closeButton);
    expect(dialog).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
