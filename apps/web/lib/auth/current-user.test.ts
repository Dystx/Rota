import { describe, expect, it, vi } from "vitest";

const { loadSessionOutcome } = vi.hoisted(() => ({
  loadSessionOutcome: vi.fn()
}));

vi.mock("./session-outcome", () => ({ loadSessionOutcome }));

import { getCurrentUser } from "./current-user";

describe("getCurrentUser", () => {
  it("preserves a ready session outcome for page consumers", async () => {
    loadSessionOutcome.mockResolvedValue({
      kind: "ready",
      session: {
        user: { id: "traveler-1", email: "traveler@example.test" },
        session: { id: "session-1" }
      }
    });

    await expect(getCurrentUser()).resolves.toEqual({
      outcome: "ready",
      user: { id: "traveler-1", email: "traveler@example.test" },
      session: { id: "session-1" }
    });
  });

  it("does not turn an unavailable probe into anonymous user data", async () => {
    loadSessionOutcome.mockResolvedValue({ kind: "unavailable" });

    await expect(getCurrentUser()).resolves.toEqual({ outcome: "unavailable", user: null, session: null });
  });
});
