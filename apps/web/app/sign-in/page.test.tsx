import { describe, expect, it } from "vitest";
import { SIGN_IN_HELP_LINK_CLASS } from "./page";

describe("SignInPage", () => {
  it("keeps the how-it-works hover state AA-safe on the light surface", () => {
    const classes = SIGN_IN_HELP_LINK_CLASS.split(/\s+/);

    expect(classes).toContain("hover:text-ochre-dark");
    expect(classes).not.toContain("hover:text-ochre");
  });
});
