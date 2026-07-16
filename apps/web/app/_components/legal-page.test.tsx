import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { LegalPage } from "./legal-page";

expect.extend(matchers);

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock("./top-nav", () => ({
  TopNav: () => <nav aria-label="Primary navigation">Primary navigation</nav>
}));

describe("LegalPage route surface", () => {
  afterEach(() => cleanup());

  it("leaves the utility field to PublicRouteLayout", () => {
    render(
      <LegalPage
        kicker="Legal"
        title="Privacy Policy"
        intro="A plain-language policy."
        asideTitle="In brief"
        asideText="A short summary."
      >
        <p>Policy content.</p>
      </LegalPage>
    );

    const outer = screen.getByTestId("public-route-layout");
    const document = documentElement();
    expect(outer).toHaveAttribute("data-scene", "utility");
    expect(outer).toHaveAttribute("data-surface-texture", "none");
    expect(document).not.toHaveClass("rumia-surface");
    expect(document).not.toHaveAttribute("data-surface");
  });

  it("allows the sustainability contract to use the cover scene", () => {
    render(
      <LegalPage
        scene="cover"
        kicker="Our promise"
        title="Sustainability"
        intro="A place-first promise."
        asideTitle="Context over checklists."
        asideText="A short summary."
      >
        <p>Promise content.</p>
      </LegalPage>
    );

    expect(screen.getByTestId("public-route-layout")).toHaveAttribute("data-scene", "cover");
  });
});

function documentElement(): HTMLElement {
  return screen.getByRole("article").parentElement as HTMLElement;
}
