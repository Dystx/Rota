import * as React from "react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

expect.extend(matchers);

import { RouteScene } from "./route-scene";

describe("RouteScene", () => {
  afterEach(() => cleanup());

  it("exposes the selected tone and bleed while preserving each authored slot", () => {
    render(
      <RouteScene
        tone="atlas"
        bleed="full"
        focalLayer="media"
        media={<div data-testid="scene-media">Portugal media</div>}
        foreground={<h1>Portugal, considered</h1>}
        aside={<aside>Day rail</aside>}
        actions={<button type="button">Save day</button>}
      />
    );

    const scene = screen.getByTestId("route-scene");
    expect(scene).toHaveAttribute("data-tone", "atlas");
    expect(scene).toHaveAttribute("data-bleed", "full");
    expect(scene).toHaveClass("rumia-route-scene", "rumia-route-scene--atlas", "rumia-route-scene--full");
    expect(scene).toHaveClass("w-screen", "-translate-x-1/2");
    expect(screen.getByTestId("route-scene-media")).toContainElement(screen.getByTestId("scene-media"));
    expect(screen.getByTestId("route-scene-foreground")).toHaveTextContent("Portugal, considered");
    expect(screen.getByTestId("route-scene-aside")).toHaveTextContent("Day rail");
    expect(screen.getByTestId("route-scene-actions")).toHaveTextContent("Save day");
  });

  it("uses contained decision composition and treats children as the foreground slot", () => {
    render(
      <RouteScene tone="decision" bleed="contained" focalLayer="typography">
        <p>Choose what is worth doing.</p>
      </RouteScene>
    );

    const scene = screen.getByTestId("route-scene");
    expect(scene).toHaveAttribute("data-tone", "decision");
    expect(scene).toHaveAttribute("data-bleed", "contained");
    expect(scene).toHaveClass("rumia-route-scene--contained");
    expect(screen.getByTestId("route-scene-foreground")).toHaveTextContent("Choose what is worth doing.");
    expect(screen.queryByTestId("route-scene-media")).toBeNull();
    expect(screen.queryByTestId("route-scene-aside")).toBeNull();
    expect(screen.queryByTestId("route-scene-actions")).toBeNull();
  });

  it("marks the action slot and its direct children as touch-sized", () => {
    render(
      <RouteScene
        focalLayer="typography"
        actions={<button type="button">Continue</button>}
      />
    );

    const actions = screen.getByTestId("route-scene-actions");
    expect(actions).toHaveClass("min-h-11", "[&>*]:min-h-11", "[&>*]:min-w-11");
  });
});
