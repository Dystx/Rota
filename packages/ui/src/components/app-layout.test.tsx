import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppLayout } from "./app-layout";

describe("AppLayout", () => {
  it("owns the only main landmark even for chrome-free pages", () => {
    const { container } = render(
      <AppLayout bare>
        <h1>Portugal</h1>
      </AppLayout>
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelector("main")?.id).toBe("main-content");
  });
});
