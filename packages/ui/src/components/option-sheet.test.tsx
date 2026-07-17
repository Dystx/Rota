/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
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

function RerenderingSheetHarness(props: {
  onInitialClose: () => void;
  onLatestClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [closeVersion, setCloseVersion] = useState(0);
  const onClose =
    closeVersion === 0
      ? () => {
          props.onInitialClose();
          setOpen(false);
        }
      : () => {
          props.onLatestClose();
          setOpen(false);
        };
  const initialOnClose = useRef(onClose);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open rerendering options
      </button>
      <button type="button" onClick={() => setCloseVersion((version) => version + 1)}>
        Replace close callback
      </button>
      <OptionSheet open={open} title="Choose a route" onClose={onClose}>
        <span>
          Close callback {initialOnClose.current === onClose ? "original" : "replaced"} version {closeVersion}
        </span>
      </OptionSheet>
    </>
  );
}

describe("OptionSheet", () => {
  it("traps focus and restores it to the trigger after closing", async () => {
    render(<SheetHarness />);
    const trigger = screen.getByRole("button", { name: "Open options" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Choose a route" });
    const closeButton = screen.getByRole("button", { name: "Close dialog" });
    await waitFor(() => {
      expect(screen.getByLabelText("Route name")).toHaveFocus();
    });

    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: "Tab" });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    fireEvent.click(closeButton);
    expect(dialog).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("restores the opening trigger after its parent replaces onClose", async () => {
    const onInitialClose = vi.fn();
    const onLatestClose = vi.fn();
    render(
      <RerenderingSheetHarness
        onInitialClose={onInitialClose}
        onLatestClose={onLatestClose}
      />
    );
    const trigger = screen.getByRole("button", { name: "Open rerendering options" });
    trigger.focus();
    const restoreFocus = vi.spyOn(trigger, "focus");
    fireEvent.click(trigger);
    restoreFocus.mockClear();

    // Base UI makes the page inert while the modal is open, so the trigger
    // remains in the DOM but is intentionally excluded from the accessible
    // tree. Query the rendered control by text before moving focus to it.
    const replaceCloseCallback = screen.getByText("Replace close callback", {
      selector: "button"
    }) as HTMLButtonElement;
    replaceCloseCallback.focus();
    fireEvent.click(replaceCloseCallback);

    await waitFor(() => {
      expect(screen.getByText("Close callback replaced version 1")).toBeInTheDocument();
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(onInitialClose).not.toHaveBeenCalled();
    expect(onLatestClose).toHaveBeenCalledOnce();
    expect(restoreFocus).toHaveBeenCalledOnce();
    expect(trigger).toHaveFocus();
  });
});
