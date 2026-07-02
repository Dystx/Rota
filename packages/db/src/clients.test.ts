import { describe, expect, test } from "vitest";
import { isPersistenceConfigError, isSchemaDriftError } from "./clients";

describe("isPersistenceConfigError", () => {
  test("matches missing env var error", () => {
    expect(isPersistenceConfigError(new Error("Missing required environment variable: SUPABASE_URL"))).toBe(true);
  });

  test("rejects unrelated errors", () => {
    expect(isPersistenceConfigError(new Error("network down"))).toBe(false);
    expect(isPersistenceConfigError("not an error")).toBe(false);
    expect(isPersistenceConfigError(null)).toBe(false);
  });
});

describe("isSchemaDriftError", () => {
  test("matches PostgREST schema-cache error for a missing table", () => {
    expect(
      isSchemaDriftError(
        new Error("Could not find the table 'public.reviewer_auth_links' in the schema cache")
      )
    ).toBe(true);
  });

  test("matches PostgREST relation-not-found error", () => {
    expect(isSchemaDriftError(new Error('relation "public.reviewer_auth_links" does not exist'))).toBe(true);
  });

  test("matches PGRST205 schema-cache code", () => {
    expect(isSchemaDriftError(new Error("PGRST205: schema cache reload pending"))).toBe(true);
  });

  test("rejects unrelated runtime errors", () => {
    expect(isSchemaDriftError(new Error("network down"))).toBe(false);
    expect(isSchemaDriftError(new Error("permission denied"))).toBe(false);
  });

  test("rejects non-Error inputs", () => {
    expect(isSchemaDriftError("schema cache")).toBe(false);
    expect(isSchemaDriftError(undefined)).toBe(false);
    expect(isSchemaDriftError({ message: "schema cache" })).toBe(false);
  });
});
