/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PageShell } from "./shell";

describe("PageShell content ownership", () => {
  it("stays content-only for bare reading pages", () => {
    const { container } = render(
      <PageShell bare>Reading content</PageShell>
    );

    const root = container.firstElementChild;

    expect(root).not.toHaveAttribute("data-surface");
    expect(root).not.toHaveAttribute("data-surface-texture");
    expect(root?.querySelector("main")).toBeNull();
  });

  it("marks the content variant without painting a competing route field", () => {
    const { container } = render(
      <PageShell variant="admin">Operations content</PageShell>
    );

    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-layout-variant", "admin");
    expect(root).not.toHaveAttribute("data-surface");
  });
});
