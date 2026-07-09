import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
vi.mock("../../_components/top-nav", () => ({ TopNav: () => <nav /> }));
vi.mock("../../_components/site-footer", () => ({ SiteFooter: () => <footer /> }));
import { ExpertChat } from "./expert-chat";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ExpertChat", () => {
  it("does not fabricate a conversation when the authenticated API is empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ messages: [] }), { status: 200 }));
    render(<ExpertChat tripId="trip-42" />);
    await waitFor(() => expect(screen.getByTestId("chat-empty-state")).toBeDefined());
    expect(screen.queryByText(/Ana|Kyoto|sample/i)).toBeNull();
  });

  it("shows denied and provider-error states from the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 403 }));
    render(<ExpertChat tripId="trip-42" />);
    await waitFor(() => expect(screen.getByTestId("chat-denied")).toBeDefined());
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    render(<ExpertChat tripId="trip-42" />);
    await waitFor(() => expect(screen.getByTestId("chat-provider-error")).toBeDefined());
  });

  it("treats missing trips as denied for both reads and sends", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ messages: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));

    render(<ExpertChat tripId="trip-missing" />);
    await waitFor(() => expect(screen.getByTestId("chat-denied")).toBeDefined());

    cleanup();
    render(<ExpertChat tripId="trip-missing" />);
    await waitFor(() => expect(screen.getByTestId("chat-empty-state")).toBeDefined());
    fireEvent.change(screen.getByLabelText("Message your specialist"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(screen.getByTestId("chat-denied")).toBeDefined());
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("drops malformed rows instead of assigning a default specialist", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ messages: [
      { id: "valid-user", authorRole: "traveler", body: "A real message" },
      { id: "", authorRole: "specialist", body: "Missing id" },
      { id: "missing-role", body: "Unknown author" },
      { id: "missing-body", authorRole: "specialist", body: "   " },
      { id: "valid-specialist", authorRole: "specialist", body: "A specialist reply" }
    ] }), { status: 200 }));

    render(<ExpertChat tripId="trip-42" />);
    await waitFor(() => expect(screen.getByTestId("chat-messages")).toBeDefined());
    expect(screen.getByText("A real message")).toBeDefined();
    expect(screen.getByText("A specialist reply")).toBeDefined();
    expect(screen.queryByText("Missing id")).toBeNull();
    expect(screen.queryByText("Unknown author")).toBeNull();
    expect(screen.queryByText("   ")).toBeNull();
  });
});
