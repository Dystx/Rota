import { describe, expect, it, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue(null)
}));

vi.mock("@repo/auth/server", () => ({
  auth: {
    api: {
      getSession
    }
  }
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers())
}));

import { getCurrentSession } from "./session";

describe("getCurrentSession", () => {
  it("returns null without a session", async () => {
    await expect(getCurrentSession()).resolves.toBeNull();
    expect(getSession).toHaveBeenCalledOnce();
  });

  it("passes request headers to Better Auth without exposing a database client", async () => {
    const requestHeaders = new Headers({ cookie: "better-auth.session_token=valid" });
    vi.mocked((await import("next/headers")).headers).mockResolvedValueOnce(requestHeaders);
    getSession.mockResolvedValueOnce({ user: { id: "traveler-1" } });

    await expect(getCurrentSession()).resolves.toEqual({ user: { id: "traveler-1" } });
    expect(getSession).toHaveBeenLastCalledWith({ headers: requestHeaders });
  });

  it("leaves provider failures for the typed outcome boundary to classify", async () => {
    const providerFailure = Object.assign(new Error("provider details stay server-side"), { code: "ECONNREFUSED" });
    getSession.mockRejectedValueOnce(providerFailure);

    await expect(getCurrentSession()).rejects.toBe(providerFailure);
  });
});
