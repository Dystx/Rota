import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

vi.mock("@repo/ui", async () => {
  const actual = await vi.importActual<typeof import("@repo/ui")>("@repo/ui");
  return {
    ...actual,
    BrandMark: () => <span>Rumia</span>,
    Icon: () => <span />
  };
});

describe("TopNav", () => {
  afterEach(() => cleanup());

  it("keeps the public links focused and reserves one primary activity action", () => {
    render(<TopNav />);

    expect(screen.getByRole("link", { name: "Portugal" }).getAttribute("href")).toBe("/portugal");
    expect(screen.getByRole("link", { name: "How it works" }).getAttribute("href")).toBe("/how-it-works");
    expect(screen.getByRole("link", { name: "Local expertise" }).getAttribute("href")).toBe("/local-expertise");
    expect(screen.getByRole("link", { name: "Pricing" }).getAttribute("href")).toBe("/pricing");
    expect(screen.getByRole("link", { name: "What is worth doing?" }).getAttribute("href")).toBe("/explore");
    expect(screen.queryByRole("link", { name: "What to do" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Explore activities" })).toBeNull();
    expect(screen.queryByText("Plan Portugal")).toBeNull();
  });

  it("moves focus into the mobile menu and restores it on Escape", async () => {
    render(<TopNav />);

    const toggle = screen.getByTestId("top-nav-mobile-toggle");
    fireEvent.click(toggle);

    const firstLink = screen.getByTestId("top-nav-mobile-link-portugal");
    await waitFor(() => {
      expect(document.activeElement).toBe(firstLink);
      expect(screen.getByRole("dialog", { name: "Primary navigation" })).toBeTruthy();
    });
    expect(screen.getByTestId("top-nav-mobile-worth-doing").getAttribute("href")).toBe("/explore");

    fireEvent.keyDown(screen.getByTestId("top-nav-mobile-panel"), { key: "Escape" });
    expect(screen.queryByTestId("top-nav-mobile-panel")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(toggle));
  });
});
