import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConsoleMobileViewSwitcher } from "./console-mobile-view-switcher";

describe("ConsoleMobileViewSwitcher", () => {
  it("exposes named tabs and reports the selected view", () => {
    const onChange = vi.fn();

    render(
      <ConsoleMobileViewSwitcher
        value="timeline"
        onChange={onChange}
        views={[
          { value: "anchors", label: "Anchors" },
          { value: "timeline", label: "Timeline" },
          { value: "validation", label: "Validation" }
        ]}
      />
    );

    expect(screen.getByRole("tab", { name: "Timeline" })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: "Validation" }));
    expect(onChange).toHaveBeenCalledWith("validation");
  });
});
