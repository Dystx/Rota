import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  HeroIntentCard: () => <div data-testid="hero-intent-card" />
}));

vi.mock("../_components/destination-bento", () => ({
  DestinationBento: () => <section />
}));

describe("HomePage hero layout", () => {
  it("alternates cover, editorial, and atlas chapters", async () => {
    const page = await HomePage();
    render(page);

    expect(screen.getByTestId("home-cover").getAttribute("data-tone")).toBe("cover");
    expect(screen.getByTestId("home-editorial-chapter").getAttribute("data-focal-layer")).toBe(
      "typography"
    );
    expect(screen.getByTestId("home-atlas-chapter").getAttribute("data-tone")).toBe("atlas");
  });

  it("keeps the mobile route choices reachable while retaining the desktop hero frame", async () => {
    const page = await HomePage();
    const { container } = render(page);
    const hero = container.querySelector("[data-testid='home-cover']");

    expect(hero).not.toBeNull();
    expect(hero?.className).toContain("overflow-visible");
    expect(container.querySelector("[data-testid='home-cover-media']")?.className).toContain(
      "md:min-h-[720px]"
    );
    expect(container.querySelector("[data-testid='home-text-contrast-overlay']")?.getAttribute("data-contrast-treatment")).toBe(
      "frame-independent"
    );
    expect(container.querySelector("[data-testid='home-headline']")?.textContent).toMatch(
      /What is actually worth your time/i
    );
    expect(container.querySelector("[data-testid='home-value-prop']")?.textContent).toMatch(
      /judged Portugal activities/i
    );
  });

  it("gives the hero an editorial image anchor and trust rail without adding another task", async () => {
    const page = await HomePage();
    const { container } = render(page);

    expect(container.querySelector("[data-testid='hero-editorial-figure']")).not.toBeNull();
    expect(container.querySelector("[data-testid='hero-proof-rail']")?.textContent).toMatch(
      /Portugal-wide/i
    );
    expect(container.querySelector("[data-testid='hero-proof-rail']")?.className).toContain(
      "pointer-events-none"
    );
    expect(container.querySelectorAll("[data-testid='brand-mark']")).toHaveLength(0);
    expect(container.querySelectorAll("[data-testid='hero-intent-card']")).toHaveLength(1);
  });
});
