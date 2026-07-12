/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  EditorialHeading,
  EditorialKicker,
  EditorialRule,
  StatusRegion,
} from "./editorial";

describe("editorial primitives", () => {
  it("renders the editorial heading grammar", () => {
    render(
      <EditorialHeading
        eyebrow="Portugal"
        title="Shape a chosen day"
        dek="Test the time before you commit."
      />
    );

    expect(screen.getByText("Portugal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Shape a chosen day" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Test the time before you commit.")
    ).toBeInTheDocument();
  });

  it("keeps the heading element selectable through as", () => {
    render(
      <EditorialHeading as="h2" eyebrow="A day in view" title="Read the coast" />
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Read the coast" })
    ).toBeInTheDocument();
  });

  it("applies semantic tone classes without changing the heading grammar", () => {
    render(
      <EditorialHeading
        tone="midnight"
        eyebrow="Portugal"
        title="A considered day"
      />
    );

    expect(screen.getByRole("heading", { name: "A considered day" })).toHaveClass(
      "text-linen"
    );
  });

  it("renders a kicker and a thin editorial rule", () => {
    const { container } = render(
      <>
        <EditorialKicker tone="ochre">A considered choice</EditorialKicker>
        <EditorialRule />
      </>
    );

    expect(screen.getByText("A considered choice")).toHaveClass("text-ochre");
    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("renders a live status region with requested politeness", () => {
    render(
      <StatusRegion politeness="assertive" testId="status">
        Saved
      </StatusRegion>
    );

    expect(screen.getByTestId("status")).toHaveAttribute(
      "aria-live",
      "assertive"
    );
    expect(screen.getByTestId("status")).toHaveAttribute("role", "status");
    expect(screen.getByTestId("status")).toHaveTextContent("Saved");
  });
});
