/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Modal } from "./modal";

afterEach(() => cleanup());

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Confirm action"
      description="This will change your itinerary."
      footer={
        <button type="button" onClick={() => setOpen(false)}>
          OK
        </button>
      }
    >
      <p>Body content</p>
    </Modal>
  );
}

describe("Modal", () => {
  it("renders the title, description, and children when open", () => {
    render(<Harness />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm action")).toBeInTheDocument();
    expect(screen.getByText("This will change your itinerary.")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("closes when the close button is clicked", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
