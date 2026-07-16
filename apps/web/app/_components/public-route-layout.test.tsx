import * as React from "react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

expect.extend(matchers);

import { PublicRouteLayout } from "./public-route-layout";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock("./top-nav", () => ({
  TopNav: () => <nav aria-label="Primary navigation">Primary navigation</nav>
}));

describe("PublicRouteLayout", () => {
  afterEach(() => cleanup());

  it("passes an explicit surface and utility footer mode to the public shell", () => {
    render(
      <PublicRouteLayout scene="utility" footerMode="utility" surfaceTone="midnight" surfaceTexture="none">
        <h1>Account</h1>
      </PublicRouteLayout>
    );

    const shell = screen.getByRole("heading", { name: "Account" }).closest("div.rumia-app-layout");
    expect(shell).toHaveAttribute("data-surface", "midnight");
    expect(screen.getByTestId("public-route-layout")).toHaveAttribute("data-scene", "utility");
    expect(screen.getByTestId("public-route-layout")).toHaveAttribute("data-surface-texture", "none");
    expect(screen.getByTestId("site-footer")).toHaveAttribute("data-variant", "utility");
  });

  it("requires the route to declare its full presentation", () => {
    render(
      <PublicRouteLayout scene="atlas" footerMode="full" surfaceTone="linen" surfaceTexture="editorial">
        <h1>Portugal</h1>
      </PublicRouteLayout>
    );

    expect(screen.getByTestId("site-footer")).toHaveAttribute("data-variant", "full");
    expect(screen.getByTestId("site-footer-grid")).toHaveClass("md:grid-cols-5");
  });

  it("supports a footerless public shell for immersive routes", () => {
    render(
      <PublicRouteLayout scene="decision" footerMode="none" surfaceTone="linen" surfaceTexture="none">
        <h1>Shape a day</h1>
      </PublicRouteLayout>
    );

    expect(screen.getByRole("heading", { name: "Shape a day" })).toBeInTheDocument();
    expect(screen.queryByTestId("site-footer")).toBeNull();
  });
});
