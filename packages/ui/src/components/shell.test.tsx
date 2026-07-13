/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PageShell } from "./shell";

describe("PageShell semantic surfaces", () => {
  it("uses a linen editorial field for bare reading pages", () => {
    const { container } = render(
      <PageShell bare>Reading content</PageShell>
    );

    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-surface", "linen");
    expect(root).toHaveAttribute("data-surface-texture", "editorial");
    expect(root).toHaveClass("rumia-surface", "rumia-surface-linen");
  });

  it("keeps admin and reviewer pages readable on a dense linen field", () => {
    const { container } = render(
      <PageShell variant="admin">Operations content</PageShell>
    );

    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-surface", "linen");
    expect(root).toHaveAttribute("data-surface-texture", "none");
    expect(root).toHaveClass("rumia-surface", "rumia-surface-linen");
  });
});
