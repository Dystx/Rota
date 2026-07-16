import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditorialMedia } from "./editorial-media";

describe("EditorialMedia", () => {
  it("renders a responsive, provenance-friendly image surface", () => {
    render(
      <EditorialMedia
        src="/media/example.webp"
        fallbackSrc="/media/example.jpg"
        alt="A Portugal field note"
        caption="A slower way through the day."
        credit="Photo · Rumia"
        width={1200}
        height={800}
        testId="editorial-media"
      />
    );

    const root = screen.getByTestId("editorial-media");
    expect(root.querySelector("source")?.getAttribute("srcset")).toBe("/media/example.webp");
    expect(root.querySelector("img")?.getAttribute("src")).toBe("/media/example.jpg");
    expect(screen.getByAltText("A Portugal field note").getAttribute("width")).toBe("1200");
    expect(screen.getByText("A slower way through the day.")).toBeTruthy();
    expect(screen.getByText("Photo · Rumia")).toBeTruthy();
  });

  it("keeps decorative media out of the accessible name tree", () => {
    render(
      <EditorialMedia
        src="/media/example.webp"
        alt="Decorative coastline"
        width={1200}
        height={800}
        decorative
        testId="decorative-media"
      />
    );

    const root = screen.getByTestId("decorative-media");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.querySelector("img")?.getAttribute("alt")).toBe("");
  });
});
