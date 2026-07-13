/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { OperatorShell } from "./operator-shell";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  )
}));

describe("OperatorShell semantic surface", () => {
  it("uses a dense, texture-free linen field for operator work", () => {
    const { container } = render(
      <OperatorShell
        section="admin"
        currentPath="/admin/places"
        user={{ name: "Ada Admin" }}
      >
        <h1>Places</h1>
      </OperatorShell>
    );

    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-surface", "linen");
    expect(root).toHaveAttribute("data-surface-texture", "none");
    expect(root).toHaveClass("rumia-surface", "rumia-surface-linen");
    expect(container.querySelector("main")).toHaveAttribute("id", "main-content");
  });
});
