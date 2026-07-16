/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AppLayout } from "./app-layout";

describe("AppLayout semantic surfaces", () => {
  it("owns the only main landmark even for chrome-free pages", () => {
    const { container } = render(
      <AppLayout bare surface="linen" surfaceTexture="none">
        <h1>Portugal</h1>
      </AppLayout>
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelector("main")?.id).toBe("main-content");
  });

  it("gives the marketing shell a textured linen surface by default", () => {
    const { container } = render(<AppLayout surface="linen" surfaceTexture="editorial">Activity content</AppLayout>);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-surface", "linen");
    expect(root).toHaveAttribute("data-surface-texture", "editorial");
    expect(root).toHaveClass("rumia-surface", "rumia-surface-linen");
  });

  it("allows a route to opt into the linen reading surface", () => {
    const { container } = render(
      <AppLayout surface="linen" surfaceTexture="none">A quieter page</AppLayout>
    );
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-surface", "linen");
    expect(root).toHaveClass("rumia-surface-linen");
  });
});
