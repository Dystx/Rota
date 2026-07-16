import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

import { SiteFooter } from "./site-footer";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock("@repo/ui", () => ({
  BrandMark: () => <span>Rumia</span>
}));

describe("SiteFooter", () => {
  afterEach(() => cleanup());

  it("renders five groups and only one Support link", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Support" })).toHaveLength(1);
    expect(screen.getByTestId("site-footer-grid")).toHaveClass("md:grid-cols-5");
  });

  it("accepts the mode alias for utility shells", () => {
    render(<SiteFooter mode="utility" />);

    expect(screen.getByTestId("site-footer")).toHaveAttribute("data-variant", "utility");
  });

  it("keeps every footer destination in the compact shell", () => {
    render(<SiteFooter variant="compact" />);

    expect(screen.getByTestId("site-footer").getAttribute("data-variant")).toBe("compact");
    expect(screen.getByRole("navigation", { name: "Portugal" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Product" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Help" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Legal" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore activities" })).toBeTruthy();
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(expect.arrayContaining([
      "/portugal", "/local-expertise", "/how-it-works", "/pricing", "/planner",
      "/support", "/offline", "/privacy", "/terms", "/sustainability", "/explore"
    ]));
  });

  it("renders a compact utility shell with recovery and legal destinations", () => {
    render(<SiteFooter variant="utility" />);

    const footer = screen.getByTestId("site-footer");
    expect(footer).toHaveAttribute("data-variant", "utility");
    expect(screen.getByRole("link", { name: "Back to Rumia" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute("href", "/support");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Support" })).toHaveClass("min-h-11", "min-w-11");
  });

  it("renders no footer for immersive and operator shells", () => {
    const { container } = render(<SiteFooter variant="none" />);

    expect(container.firstChild).toBeNull();
  });
});
