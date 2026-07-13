import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EditorialProofRail } from "./editorial-proof-rail";

describe("EditorialProofRail", () => {
  afterEach(() => cleanup());

  it("keeps the evidence in a labelled definition list", () => {
    render(
      <EditorialProofRail
        items={[
          { label: "Starting point", value: "A time window." },
          { label: "Selection", value: "Reviewed activities." }
        ]}
      />
    );

    const rail = screen.getByTestId("editorial-proof-rail");
    expect(rail.tagName).toBe("DL");
    expect(screen.getByText("Starting point")).toBeTruthy();
    expect(screen.getByText("Reviewed activities.")).toBeTruthy();
  });
});
