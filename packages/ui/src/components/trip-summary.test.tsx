/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TripSummary } from "./trip-summary";

describe("TripSummary", () => {
  it("renders trip details with one primary action", () => {
    const onPrimaryAction = vi.fn();
    render(
      <TripSummary
        draft={{
          destination: "Portugal",
          days: 7,
          travelWindow: null,
          transport: "Train",
          vibe: "Balanced"
        }}
        primaryAction="Build my trip"
        onPrimaryAction={onPrimaryAction}
      />
    );

    expect(screen.getByText("Portugal")).toBeInTheDocument();
    expect(screen.getByText("Any time")).toBeInTheDocument();
    const action = screen.getByRole("button", { name: "Build my trip" });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(action);
    expect(onPrimaryAction).toHaveBeenCalledOnce();
  });

  it("uses singular day wording for a one-day trip", () => {
    const { container } = render(
      <TripSummary
        draft={{
          destination: "Porto",
          days: 1,
          travelWindow: "October",
          transport: "Train",
          vibe: "Relaxed"
        }}
        primaryAction="Build my trip"
        onPrimaryAction={vi.fn()}
      />
    );

    expect(container).toHaveTextContent("1 day");
  });
});
