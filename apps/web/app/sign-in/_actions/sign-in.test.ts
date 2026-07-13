import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInEmail, requestHeaders, redirect, redirectError } = vi.hoisted(() => {
  const redirectError = (url: string) => new Error(`REDIRECT:${url}`);
  return {
    redirectError,
    redirect: vi.fn((url: string): never => {
      throw redirectError(url);
    }),
    requestHeaders: new Headers({ origin: "http://127.0.0.1:3000" }),
    signInEmail: vi.fn()
  };
});

vi.mock("@repo/auth/server", () => ({ auth: { api: { signInEmail } } }));
vi.mock("next/headers", () => ({ headers: vi.fn().mockResolvedValue(requestHeaders) }));
vi.mock("next/navigation", () => ({ redirect }));

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
    redirect.mockClear();
  });

  it("signs in with email/password and preserves the safe destination", async () => {
    await expect(
      signInAction(form({ email: " Traveler@Example.com ", password: "correct-password", next: "/admin" }))
    ).rejects.toThrow("REDIRECT:/admin");

    expect(signInEmail).toHaveBeenCalledWith({
      body: { email: "traveler@example.com", password: "correct-password" },
      headers: requestHeaders
    });
  });

  it("rejects invalid credentials before calling Better Auth", async () => {
    await expect(signInAction(form({ email: "not-an-email", password: "short", next: "/account" }))).rejects.toThrow(
      "REDIRECT:/sign-in?error=Enter%20a%20valid%20email%20and%20password.&next=%2Faccount"
    );
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("maps Better Auth failures to the sign-in error redirect", async () => {
    signInEmail.mockRejectedValueOnce(new Error("Invalid email or password."));

    await expect(signInAction(form({ email: "traveler@example.com", password: "wrong-password", next: "/account" }))).rejects.toThrow(
      "REDIRECT:/sign-in?error=Invalid%20email%20or%20password.&next=%2Faccount"
    );
  });
});
