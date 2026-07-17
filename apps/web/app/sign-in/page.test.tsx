import { describe, expect, it, vi } from "vitest";

// Keep this page-level contract test independent from the server-only auth
// action. The form has its own action tests; importing the real action here
// would require production DATABASE_URL/BETTER_AUTH_SECRET just to inspect a
// presentational class constant.
vi.mock("./_actions/sign-in", () => ({
  signInAction: vi.fn(),
}));

import { SIGN_IN_HELP_LINK_CLASS, SIGN_IN_PLACE_MEDIA } from "./page";

describe("SignInPage", () => {
  it("keeps the how-it-works hover state AA-safe on the light surface", () => {
    const classes = SIGN_IN_HELP_LINK_CLASS.split(/\s+/);
    const hoverTextClasses = classes.filter((className) => className.startsWith("hover:text-"));

    expect(hoverTextClasses).toEqual(["hover:text-[var(--color-ochre-on-light)]"]);
    expect(classes).not.toContain("hover:text-ochre-dark");
  });

  it("declares a static local place crop for the auth surface", () => {
    expect(SIGN_IN_PLACE_MEDIA.motionPolicy).toBe("poster-only");
    expect(SIGN_IN_PLACE_MEDIA.src).toMatch(/^\/media\//);
    expect(SIGN_IN_PLACE_MEDIA.alt).toMatch(/Portugal/i);
  });
});
