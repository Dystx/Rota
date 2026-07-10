import { describe, expect, it } from "vitest";

import { apiErrorEnvelopeSchema, type ApiErrorEnvelope } from "./api-error";

describe("ApiErrorEnvelope", () => {
  it("supports a top-level message and optional field errors", () => {
    const envelope = {
      code: "validation_error",
      fieldErrors: { destination: ["Choose a Portugal region."] },
      message: "Trip brief validation failed."
    } satisfies ApiErrorEnvelope;

    expect(apiErrorEnvelopeSchema.parse(envelope)).toEqual({
      code: "validation_error",
      fieldErrors: { destination: ["Choose a Portugal region."] },
      message: "Trip brief validation failed."
    });
  });
});
