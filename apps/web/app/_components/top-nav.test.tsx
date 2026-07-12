import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TopNav } from "./top-nav";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/"
}));

vi.mock("@repo/ui", () => ({
  BrandMark: () => <span>Rumia</span>,
  Icon: () => <span />
}));

describe("TopNav", () => {
  afterEach(() => cleanup());

  it("puts judged activity discovery ahead of the secondary planner", () => {
    render(<TopNav />);

    expect(screen.getByRole("link", { name: "What to do" }).getAttribute("href")).toBe("/explore");
    expect(screen.getByRole("link", { name: "Explore activities" }).getAttribute("href")).toBe("/explore");
    expect(screen.queryByText("Plan Portugal")).toBeNull();
  });

  it("moves focus into the mobile menu and restores it on Escape", () => {
    render(<TopNav />);

    const toggle = screen.getByTestId("top-nav-mobile-toggle");
    fireEvent.click(toggle);

    const firstLink = screen.getByTestId("top-nav-mobile-link-what-to-do");
    expect(document.activeElement).toBe(firstLink);

    fireEvent.keyDown(screen.getByTestId("top-nav-mobile-panel"), { key: "Escape" });
    expect(document.activeElement).toBe(toggle);
    expect(screen.queryByTestId("top-nav-mobile-panel")).toBeNull();
  });
});
