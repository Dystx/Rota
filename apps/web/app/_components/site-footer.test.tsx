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
});
