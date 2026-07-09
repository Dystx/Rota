/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RouteConsequence } from "./route-consequence";

describe("RouteConsequence", () => {
  it("announces route updates while loading", () => {
    render(<RouteConsequence status="updating" />);
    expect(screen.getByRole("status")).toHaveTextContent("Updating route");
  });

  it("renders a retry action when updating the route fails", () => {
    const onRetry = vi.fn();
    render(<RouteConsequence status="error" onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("couldn't update the route");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("summarizes ready route consequences and warnings", () => {
    render(
      <RouteConsequence
        status="ready"
        stopCount={3}
        travelMinutes={95}
        transportLabel="Train"
        warnings={["One tight connection"]}
      />
    );

    expect(screen.getByText("3 stops")).toBeInTheDocument();
    expect(screen.getByText("95 min travel")).toBeInTheDocument();
    expect(screen.getByText("One tight connection")).toBeInTheDocument();
  });
});
