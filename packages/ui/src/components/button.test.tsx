/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders a default primary button with the children as label", () => {
    render(<Button>Save trip</Button>);
    const btn = screen.getByRole("button", { name: "Save trip" });
    expect(btn).toBeInTheDocument();
  });

  it("applies variant, size, tone classes", () => {
    const { container } = render(
      <Button variant="secondary" size="lg" tone="olive">
        Begin
      </Button>
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toMatch(/h-14/);
    expect(btn?.className).toMatch(/bg-olive-light/);
    expect(btn?.className).toMatch(/ring-olive-light/);
  });

  it("is full-width when fullWidth is true", () => {
    const { container } = render(<Button fullWidth>Full</Button>);
    expect(container.querySelector("button")?.className).toMatch(/w-full/);
  });

  it("sets aria-busy and disables click while loading", () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Send
      </Button>
    );
    const btn = screen.getByRole("button", { name: /Send/ });
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a custom loading indicator", () => {
    render(
      <Button isLoading loadingIndicator={<span data-testid="custom">…</span>}>
        Send
      </Button>
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("renders leading and trailing icons by name", () => {
    render(
      <Button leadingIcon="arrow_forward" trailingIcon="check">
        Plan
      </Button>
    );
    const matSymbols = document.querySelectorAll(".material-symbols-outlined");
    expect(matSymbols).toHaveLength(2);
  });

  it("clones a child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/trip/1">View trip</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "View trip" });
    expect(link).toHaveAttribute("href", "/trip/1");
    expect(link.className).toMatch(/rounded-full/);
  });
});
