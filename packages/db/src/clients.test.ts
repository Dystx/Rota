import { describe, expect, test } from "vitest";
import { createSystemDataOptions, createUserDataOptions, isPersistenceConfigError, isSchemaDriftError, type RotaDataClient } from "./clients";

describe("isPersistenceConfigError", () => {
  test("matches missing env var error", () => {
    expect(isPersistenceConfigError(new Error("Missing required environment variable: DATABASE_URL"))).toBe(true);
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

  test("matches a PostgreSQL missing-relation code", () => {
    const error = Object.assign(new Error('relation "app.trips" does not exist'), { code: "42P01" });
    expect(isSchemaDriftError(error)).toBe(true);
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

describe("data-access client scopes", () => {
  test("keeps user and system clients explicit at the call boundary", () => {
    const client = {} as RotaDataClient;

    expect(createUserDataOptions(client)).toEqual({ client, scope: "user" });
    expect(createSystemDataOptions(client)).toEqual({ client, scope: "system" });
  });
});
