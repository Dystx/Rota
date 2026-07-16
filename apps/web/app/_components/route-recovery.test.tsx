import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouteRecovery } from "./route-recovery";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

describe("RouteRecovery", () => {
  afterEach(() => cleanup());

  it("keeps provider/configuration details out of unavailable content recovery", () => {
    render(<RouteRecovery kind="unavailable" onRetry={() => undefined} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "This part of Rumia is temporarily unavailable"
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get support" })).toHaveAttribute("href", "/support");
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    expect(screen.queryByText(/DATABASE_URL|BETTER_AUTH_SECRET|ECONN|stack|Next\.js/i)).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Route recovery" })).toHaveAttribute("data-surface-texture", "none");
  });

  it("owns exactly one document landmark when used by the root boundary", () => {
    render(<RouteRecovery kind="error" landmark="document" />);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "We hit a detour" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get support" })).toBeInTheDocument();
  });

  it("hands retry back to the segment boundary", () => {
    const onRetry = vi.fn();
    render(<RouteRecovery kind="error" onRetry={onRetry} />);

    screen.getByRole("button", { name: "Try again" }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
