import { describe, expect, it } from "vitest";

import robots from "./robots";

describe("robots", () => {
  it("allows public content and disallows authenticated, operator, beta, and API routes", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;

    expect(rules?.allow).toEqual(["/"]);
    expect(rules?.disallow).toEqual(expect.arrayContaining(["/admin/", "/reviewer/", "/account/", "/trip/", "/api/", "/b2b/", "/guide/", "/sign-in"]));
  });
});
