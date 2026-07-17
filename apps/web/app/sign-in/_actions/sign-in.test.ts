import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInEmail, requestHeaders } = vi.hoisted(() => {
  return {
    requestHeaders: new Headers({ origin: "http://127.0.0.1:3000" }),
    signInEmail: vi.fn()
  };
});

vi.mock("@repo/auth/server", () => ({ auth: { api: { signInEmail } } }));
vi.mock("next/headers", () => ({ headers: vi.fn().mockResolvedValue(requestHeaders) }));

import { signInAction } from "./sign-in";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("signInAction", () => {
  beforeEach(() => {
    signInEmail.mockReset();
    signInEmail.mockResolvedValue({ user: { id: "traveler-1" } });
  });

  it("signs in with email/password and preserves the safe destination", async () => {
    await expect(
      signInAction(form({ email: " Traveler@Example.com ", password: "correct-password", next: "/admin" }))
    ).resolves.toEqual({ ok: true, next: "/admin" });

    expect(signInEmail).toHaveBeenCalledWith({
      body: { email: "traveler@example.com", password: "correct-password" },
      headers: requestHeaders
    });
  });

  it("rejects invalid credentials before calling Better Auth", async () => {
    await expect(signInAction(form({ email: "not-an-email", password: "short", next: "/account" }))).resolves.toEqual({
      ok: false,
      message: "Enter a valid email and password."
    });
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("maps Better Auth failures to the sign-in error redirect", async () => {
    signInEmail.mockRejectedValueOnce(new Error("Invalid email or password."));

    await expect(signInAction(form({ email: "traveler@example.com", password: "wrong-password", next: "/account" }))).resolves.toEqual({
      ok: false,
      message: "We couldn’t sign you in. Check your email and password and try again."
    });
  });
});
