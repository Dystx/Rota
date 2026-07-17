/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

import { SideSheet, SideSheetClose } from "./side-sheet";

function Harness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open export
      </button>
      <SideSheet
        open={open}
        title="Export options"
        description="Choose an export format."
        onClose={() => setOpen(false)}
      >
        <button type="button">Download PDF</button>
        <SideSheetClose type="button" aria-label="Close export panel">
          Close
        </SideSheetClose>
      </SideSheet>
    </>
  );
}

describe("SideSheet", () => {
  afterEach(() => cleanup());

  it("opens as an accessible dialog, focuses the first control, and restores the opener", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open export" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Export options" });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Download PDF" })).toHaveFocus();
    });

    fireEvent.keyDown(document, { key: "Escape" });
    expect(dialog).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes through the shared close primitive", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open export" });
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Export options" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Close export panel" }));
    expect(screen.queryByRole("dialog", { name: "Export options" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
