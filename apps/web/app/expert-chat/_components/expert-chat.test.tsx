import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
});
