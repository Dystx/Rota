import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../_actions/sign-in", () => ({ signInAction: vi.fn() }));
vi.mock("@repo/ui", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { SignInForm } from "./sign-in-form";
import { signInAction } from "../_actions/sign-in";
import { toast } from "@repo/ui";

afterEach(cleanup);

describe("SignInForm", () => {
  it("uses a sentence-style inline email action", () => {
    const { container } = render(<SignInForm next="/planner" initialSent={false} />);
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeTruthy();
    expect(container.querySelector("form")?.textContent).toContain("and then");
    expect(container.querySelector("form")?.textContent).not.toContain(", then");
  });

  it("provides an inline accessible error without exposing provider details", async () => {
    vi.mocked(signInAction).mockResolvedValue({
      ok: false,
      message: "We couldn’t sign you in. Check your email and password and try again."
    });

    render(<SignInForm next="/planner" initialSent={false} />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "traveler@example.com" }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong-password" }
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("We couldn’t sign you in.");
    });
    expect(screen.getByRole("alert").textContent).not.toContain("placeholder");
  });

  it("normalizes legacy query errors to the same safe message", () => {
    render(<SignInForm next="/planner" initialSent={false} initialError="NEXT_REDIRECT%3Bprovider-detail" />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("We couldn’t sign you in.");
    expect(alert.textContent).not.toContain("NEXT_REDIRECT");
    expect(alert.textContent).not.toContain("provider-detail");
  });

  it("keeps sign-in failure feedback in one accessible channel", async () => {
    vi.mocked(toast.error).mockClear();
    vi.mocked(signInAction).mockResolvedValue({
      ok: false,
      message: "We couldn’t sign you in. Check your email and password and try again."
    });

    render(<SignInForm next="/planner" initialSent={false} />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "traveler@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(toast.error).not.toHaveBeenCalled();
  });
});
