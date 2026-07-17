import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActivityFeedbackForm } from "./activity-feedback-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ActivityFeedbackForm", () => {
  it("keeps the request specific to a chosen day and reiterates the privacy boundary", () => {
    render(<ActivityFeedbackForm activityIds={["porto-ribeira-slow-walk", "lisbon-alfama-fado"]} />);

    expect(screen.getByText(/2 selected activities/i)).toBeVisible();
    expect(screen.getAllByRole("button", { name: /out of 5/i })).toHaveLength(5);
    expect(screen.getByText(/No account, email address, or booking details are collected here/i)).toBeVisible();
  });

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

  it("marks provider failures as errors and lets the traveler retry", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Feedback service unavailable" }), { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Thanks" }), { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    render(<ActivityFeedbackForm activityIds={["porto-ribeira-slow-walk"]} />);

    fireEvent.click(screen.getByRole("button", { name: "4 out of 5" }));
    fireEvent.click(screen.getByRole("button", { name: /Send feedback/i }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/unavailable/i));

    fireEvent.click(screen.getByRole("button", { name: /Send feedback/i }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/Thanks/i));
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
