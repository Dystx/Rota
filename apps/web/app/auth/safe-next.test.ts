import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"])("rejects %s", (value) => {
    expect(safeNext(value)).toBe("/account");
  });

  it.each(["/admin", "/reviewer/trips/42", "/console/messages", "/planner?destination=douro", "/account"])("preserves permitted route %s", (value) => {
    expect(safeNext(value)).toBe(value);
  });
});
