import { describe, expect, it } from "vitest";

import { createApiErrorEnvelope } from "./api-error";

describe("createApiErrorEnvelope", () => {
  it("omits fieldErrors when no fields are invalid", () => {
    expect(createApiErrorEnvelope("forbidden", "Forbidden.")).toEqual({
      code: "forbidden",
      message: "Forbidden."
    });
  });
});
