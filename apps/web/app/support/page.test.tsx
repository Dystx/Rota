import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import SupportPage from "./page";

afterEach(cleanup);

describe("SupportPage", () => {
  it("organises recovery help into disclosure groups with a response boundary", () => {
    render(<SupportPage />);

    expect(
      screen.getAllByTestId("support-disclosure").map((node) => node.getAttribute("data-topic"))
    ).toEqual(["self-service", "saved-days", "payments", "account"]);
    expect(screen.getByRole("heading", { level: 2, name: /Response expectation/i })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: /Escalation path/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /Contact support/i })).toBeVisible();
  });
});
