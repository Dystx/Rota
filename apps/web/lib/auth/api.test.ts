import { describe, expect, it } from "vitest";

import { validationError } from "./api";

describe("validationError", () => {
  it("returns the typed top-level API envelope", async () => {
    const response = validationError("Trip brief validation failed.", {
      destination: ["Choose a Portugal region."]
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "validation_error",
      fieldErrors: { destination: ["Choose a Portugal region."] },
      message: "Trip brief validation failed."
    });
  });
});
