import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import FeedbackPage from "./page";

afterEach(cleanup);

describe("FeedbackPage", () => {
  it("accepts feedback only for reviewed activities carried from the traveller's day", async () => {
    render(await FeedbackPage({
      searchParams: Promise.resolve({
        activity: ["porto-ribeira-slow-walk", "not-a-reviewed-activity"],
        source: "activity-day"
      })
    }));

    expect(screen.getByRole("heading", { name: /Did Rumia make better use/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send feedback" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Choose a day to review/i })).toBeNull();
  });

  it("does not open an unbounded feedback form without reviewed activities", async () => {
    render(await FeedbackPage({ searchParams: Promise.resolve({ activity: "not-a-reviewed-activity" }) }));

    expect(screen.getByRole("heading", { name: /Choose a day to review/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Send feedback" })).toBeNull();
  });
});
