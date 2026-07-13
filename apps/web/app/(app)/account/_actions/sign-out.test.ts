import { beforeEach, describe, expect, it, vi } from "vitest";

const { signOut, revalidatePath, redirect, requestHeaders } = vi.hoisted(() => ({
  signOut: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((url: string): never => {
    throw new Error(`REDIRECT:${url}`);
  }),
  requestHeaders: new Headers({ cookie: "better-auth.session_token=valid" })
}));

vi.mock("@repo/auth/server", () => ({ auth: { api: { signOut } } }));
vi.mock("next/headers", () => ({ headers: vi.fn().mockResolvedValue(requestHeaders) }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import { signOutAction } from "./sign-out";

describe("signOutAction", () => {
  beforeEach(() => {
    signOut.mockReset();
    revalidatePath.mockReset();
    redirect.mockClear();
  });

  it("revokes the Better Auth session and redirects home", async () => {
    await expect(signOutAction()).rejects.toThrow("REDIRECT:/");
    expect(signOut).toHaveBeenCalledWith({ headers: requestHeaders });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
