import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
  it("puts judged activity discovery ahead of the secondary planner", () => {
    render(<TopNav />);

    expect(screen.getByRole("link", { name: "What to do" }).getAttribute("href")).toBe("/explore");
    expect(screen.getByRole("link", { name: "Explore activities" }).getAttribute("href")).toBe("/explore");
    expect(screen.queryByText("Plan Portugal")).toBeNull();
  });
});
