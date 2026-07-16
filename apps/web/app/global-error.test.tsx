import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import GlobalError from "./global-error";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

describe("global error boundary", () => {
  afterEach(() => cleanup());

  it("owns one document landmark without exposing Next/provider diagnostics", () => {
    const documentTree = GlobalError({
      error: new Error("DATABASE_URL ECONNREFUSED stack") as Error & { digest?: string },
      reset: vi.fn()
    });
    const html = documentTree as React.ReactElement<{ children: React.ReactNode }>;
    const body = React.Children.toArray(html.props.children)[0] as React.ReactElement<{ children: React.ReactNode }>;
    render(body.props.children);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "We hit a detour" })).toBeInTheDocument();
    expect(screen.queryByText(/DATABASE_URL|ECONNREFUSED|stack|Next\.js/i)).not.toBeInTheDocument();
  });
});
