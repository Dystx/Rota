/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { NavigationSheet } from "./navigation-sheet";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("NavigationSheet", () => {
  it("opens an accessible sheet, traps focus, and restores the trigger", async () => {
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <NavigationSheet
          open={open}
          onOpenChange={setOpen}
          title="Primary navigation"
          trigger={<button type="button">Open menu</button>}
        >
          <a href="/explore">What to do</a>
          <button type="button">Close menu</button>
        </NavigationSheet>
      );
    }

    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Open menu" });
    trigger.focus();
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Primary navigation" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Close navigation" })).toHaveFocus();
    });
    expect(screen.getByRole("button", { name: "Close navigation" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Primary navigation" })).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
