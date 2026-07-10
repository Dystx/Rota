import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { SignInForm } from "./sign-in-form";

describe("SignInForm", () => {
  it("uses a sentence-style inline email action", () => {
    render(<SignInForm next="/planner" initialSent={false} />);
    expect(screen.getByLabelText(/send my private sign-in link to/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /send link/i })).toBeTruthy();
  });
});
