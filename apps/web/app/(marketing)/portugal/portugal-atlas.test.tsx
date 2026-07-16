import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { REVIEWED_ACTIVITY_SEED } from "@/lib/content/activities";

import { PortugalAtlas } from "./portugal-atlas";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

afterEach(cleanup);

describe("PortugalAtlas", () => {
  it("renders one featured Portugal collection followed by compact region entries", () => {
    render(<PortugalAtlas />);

    expect(screen.getByTestId("portugal-featured-region")).toBeTruthy();
    expect(
      screen.getByTestId("portugal-compact-region-list").getElementsByTagName("a").length
    ).toBeGreaterThanOrEqual(4);
  });

  it("turns Portugal regions into activity collections rather than route-shape planners", () => {
    render(<PortugalAtlas activities={REVIEWED_ACTIVITY_SEED} />);

    expect(screen.getByRole("heading", { name: /Choose a kind of day/i })).toBeTruthy();
    const porto = screen.getByRole("link", { name: /Explore Porto activities/i });
    expect(porto.getAttribute("href")).toBe("/explore?region=porto&mood=a+walk");
    expect(screen.getByTestId("collection-index-porto").textContent).toBe("01");
    expect(screen.queryByRole("link", { name: /Plan a/i })).toBeNull();
  });
});
