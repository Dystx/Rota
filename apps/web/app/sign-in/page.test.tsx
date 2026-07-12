import { describe, expect, it } from "vitest";
import { SIGN_IN_HELP_LINK_CLASS } from "./page";

describe("SignInPage", () => {
  it("keeps the how-it-works hover state AA-safe on the light surface", () => {
    const classes = SIGN_IN_HELP_LINK_CLASS.split(/\s+/);
    const hoverTextClasses = classes.filter((className) => className.startsWith("hover:text-"));

    expect(hoverTextClasses).toEqual(["hover:text-[var(--color-ochre-on-light)]"]);
    expect(classes).not.toContain("hover:text-ochre-dark");
  });
});
