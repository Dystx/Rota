import { describe, expect, it } from "vitest";

import { createDatabaseConfig } from "./connection";

describe("database configuration", () => {
  it("rejects a missing DATABASE_URL without referring to a hosted provider", () => {
    expect(() => createDatabaseConfig({})).toThrow("Missing required environment variable: DATABASE_URL");
  });
});
