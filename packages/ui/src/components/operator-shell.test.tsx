/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { OperatorShell } from "./operator-shell";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  )
}));

afterEach(() => cleanup());

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

  it("renders console inside one shared main and filters navigation by capability", () => {
    const { container } = render(
      <OperatorShell
        section="console"
        capabilities={["operations:manage"]}
        currentPath="/console/workspace"
        user={{ name: "Ops" }}
      >
        <p>Work</p>
      </OperatorShell>
    );

    expect(screen.getAllByTestId("operator-main")[0]).toContainElement(screen.getByText("Work"));
    expect(screen.getAllByRole("link", { name: /revision workspace/i })[0]).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: /knowledge graph/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /system config/i })).not.toBeInTheDocument();
    expect(container.querySelectorAll("main")).toHaveLength(1);
  });

  it("supports the developer utility section", () => {
    render(
      <OperatorShell
        section="developer"
        capabilities={["developer_docs:read"]}
        currentPath="/api/v1/docs"
        user={{ name: "Developer" }}
      >
        <p>Docs</p>
      </OperatorShell>
    );

    expect(screen.getAllByRole("link", { name: /api docs/i })[0]).toHaveAttribute("aria-current", "page");
  });
});
