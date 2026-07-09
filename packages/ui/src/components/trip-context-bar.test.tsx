/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TripContextBar } from "./trip-context-bar";

describe("TripContextBar", () => {
  it("renders each context value with an edit button", () => {
    const onEdit = vi.fn();

    render(
      <TripContextBar
        draft={{
          destination: "Portugal",
          days: 7,
          travelWindow: "October",
          transport: "Train",
          vibe: "Balanced"
        }}
        onEdit={onEdit}
        tripState="draft"
      />
    );

    expect(screen.getByText("Portugal")).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit transport" }));
    expect(onEdit).toHaveBeenCalledWith("transport");
  });
});
