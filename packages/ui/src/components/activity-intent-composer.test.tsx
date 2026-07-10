import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActivityIntentComposer } from "./activity-intent-composer";

afterEach(cleanup);

describe("ActivityIntentComposer", () => {
  it("replaces an inline phrase through its keyboard choice rail and submits a typed draft", () => {
    const onSubmit = vi.fn();
    render(<ActivityIntentComposer onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /Time available, an afternoon/i }));
    const threeHours = screen.getByRole("button", { name: "three hours" });
    fireEvent.keyDown(threeHours, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /show me what is worth doing/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ timeWindow: "three hours", region: "Porto", moods: ["good food"] })
    );
    expect(screen.queryByRole("form")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("clears a phrase and removes an optional typed detail", () => {
    render(<ActivityIntentComposer onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Add a detail/i }));
    const detail = screen.getByRole("textbox", { name: /A detail about this day/i });
    fireEvent.change(detail, { target: { value: "somewhere shaded" } });
    fireEvent.click(screen.getByRole("button", { name: /Remove detail/i }));
    fireEvent.click(screen.getByRole("button", { name: /Clear time available/i }));

    expect(screen.queryByRole("textbox", { name: /A detail about this day/i })).toBeNull();
    expect(screen.getByRole("button", { name: /Time available, choose a time/i })).toBeVisible();
  });
});
