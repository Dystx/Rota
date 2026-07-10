import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AcceptedPhrase } from "./accepted-phrase";

describe("AcceptedPhrase", () => {
  it("opens an inline choice rail and restores focus on Escape", () => {
    render(
      <AcceptedPhrase
        label="Duration"
        value="one week"
        options={["five days", "one week", "ten days"]}
        onAccept={vi.fn()}
        onClear={vi.fn()}
      />
    );
    const phrase = screen.getByRole("button", { name: /duration, one week/i });
    fireEvent.click(phrase);
    fireEvent.keyDown(screen.getByRole("button", { name: "five days" }), { key: "Escape" });

    expect(document.activeElement).toBe(phrase);
  });
});
