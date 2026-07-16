/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DecisionStatePanel } from "./decision-state-panel";

describe("DecisionStatePanel", () => {
  afterEach(() => cleanup());

  it("renders a light empty decision with an illustration and both actions", () => {
    const onPrimary = vi.fn();
    render(
      <DecisionStatePanel
        kind="empty"
        tone="light"
        title="Your day is still open"
        description="Save an activity to start shaping it."
        illustration={<span data-testid="decision-illustration">✦</span>}
        primaryAction={<button type="button" onClick={onPrimary}>Browse activities</button>}
        secondaryAction={<a href="/support">Ask for help</a>}
      />
    );

    const panel = screen.getByTestId("decision-state-panel");
    expect(panel).toHaveAttribute("data-kind", "empty");
    expect(panel).toHaveAttribute("data-tone", "light");
    expect(panel).toHaveRole("status");
    expect(screen.getByTestId("decision-illustration")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your day is still open" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ask for help" })).toHaveAttribute("href", "/support");
    fireEvent.click(screen.getByRole("button", { name: "Browse activities" }));
    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it.each([
    ["loading", "status"],
    ["error", "alert"],
    ["unavailable", "status"]
  ] as const)("uses the %s panel semantics", (kind, role) => {
    render(<DecisionStatePanel kind={kind} title={`${kind} state`} />);
    const panel = screen.getByTestId("decision-state-panel");

    expect(panel).toHaveAttribute("data-kind", kind);
    expect(panel).toHaveRole(role);
  });

  it("supports an inverse tone and keeps provided actions touch-sized", () => {
    render(
      <DecisionStatePanel
        kind="error"
        tone="inverse"
        title="The route could not be saved"
        primaryAction={<button type="button">Try again</button>}
      />
    );

    const panel = screen.getByTestId("decision-state-panel");
    expect(panel).toHaveClass("rumia-decision-state-panel--inverse");
    expect(screen.getByRole("button", { name: "Try again" })).toHaveClass("min-h-11", "min-w-11");
  });

  it("adds touch sizing to design-system action elements that accept className", () => {
    function DesignSystemAction({ className }: { className?: string }) {
      return <button type="button" className={className}>Continue</button>;
    }

    render(
      <DecisionStatePanel
        kind="empty"
        title="Choose an activity"
        primaryAction={<DesignSystemAction />}
      />
    );

    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass("min-h-11", "min-w-11");
  });
});
