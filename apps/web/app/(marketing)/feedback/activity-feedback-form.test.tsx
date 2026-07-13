import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActivityFeedbackForm } from "./activity-feedback-form";

afterEach(() => vi.unstubAllGlobals());

describe("ActivityFeedbackForm", () => {
  it("submits a bounded evaluation for the activities the traveller actually selected", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Thanks" }), { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    render(<ActivityFeedbackForm activityIds={["porto-ribeira-slow-walk"]} />);

    fireEvent.click(screen.getByRole("button", { name: "4 out of 5" }));
    fireEvent.change(screen.getByRole("textbox", { name: /What would make this day better/i }), {
      target: { value: "The pacing felt right." }
    });
    fireEvent.click(screen.getByRole("button", { name: /Send feedback/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    expect(fetch).toHaveBeenCalledWith("/api/activity-feedback", expect.objectContaining({ method: "POST" }));
    expect(screen.getByRole("status").textContent).toMatch(/Thanks/i);
  });
});
