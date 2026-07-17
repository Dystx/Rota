import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} {...props}>{children}</a>
  )
}));

import { RequireReviewerAuth } from "./require-reviewer-auth";

afterEach(cleanup);

describe("RequireReviewerAuth", () => {
  it("gives unauthenticated reviewers a sign-in recovery action", () => {
    render(<RequireReviewerAuth signedIn={false} noun="queue" />);

    expect(screen.getByRole("heading", { name: "Sign in required" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/sign-in");
  });

  it("does not render a state once reviewer auth is present", () => {
    const { container } = render(<RequireReviewerAuth signedIn noun="profile" />);
    expect(container.firstChild).toBeNull();
  });
});
