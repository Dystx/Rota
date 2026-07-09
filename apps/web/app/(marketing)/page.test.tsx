import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import HomePage from "./page";

vi.mock("./hero-map", () => ({
  HeroMap: () => <div data-testid="hero-map" />
}));

vi.mock("../_components/top-nav", () => ({
  TopNav: () => <nav />
}));

vi.mock("../_components/site-footer", () => ({
  SiteFooter: () => <footer />
}));

vi.mock("./_components/how-it-works", () => ({
  HowItWorks: () => <section />
}));

vi.mock("./_components/hero-intent-card", () => ({
  HeroIntentCard: () => <div />
}));

vi.mock("../_components/destination-bento", () => ({
  DestinationBento: () => <section />
}));

describe("HomePage hero layout", () => {
  it("keeps the mobile route choices reachable while retaining the desktop hero frame", async () => {
    const page = await HomePage();
    const { container } = render(page);
    const hero = container.querySelector("main > section");

    expect(hero).not.toBeNull();
    expect(hero?.className).toContain("overflow-visible");
    expect(hero?.className).not.toMatch(/(^|\s)(h-|min-h-|overflow-hidden)/);
    expect(hero?.className).toContain("md:h-[80vh]");
    expect(hero?.className).toContain("md:min-h-[720px]");
    expect(hero?.className).toContain("md:overflow-hidden");
  });
});
