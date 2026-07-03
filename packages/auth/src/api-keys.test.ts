import { describe, expect, it } from "vitest";
import {
  hashApiKey,
  hashForLookup,
  isValidApiKeyShape,
  issueApiKey
} from "./api-keys";

describe("issueApiKey", () => {
  it("returns a key with the rumia_live_ prefix", () => {
    const issued = issueApiKey({ id: "00000000-0000-0000-0000-000000000000" });
    expect(issued.key).toMatch(/^rumia_live_/);
  });

  it("returns a 64-hex-char body (32 random bytes)", () => {
    const issued = issueApiKey({ id: "00000000-0000-0000-0000-000000000000" });
    const body = issued.key.slice("rumia_live_".length);
    expect(body).toHaveLength(64);
    expect(body).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("returns a keyPrefix that's the first 8 hex chars of the body", () => {
    const issued = issueApiKey({ id: "00000000-0000-0000-0000-000000000000" });
    const body = issued.key.slice("rumia_live_".length);
    expect(issued.keyPrefix).toBe(body.slice(0, 8));
  });

  it("returns distinct keys on each call (probabilistic)", () => {
    const a = issueApiKey({ id: "id-a" });
    const b = issueApiKey({ id: "id-b" });
    expect(a.key).not.toBe(b.key);
    expect(a.keyPrefix).not.toBe(b.keyPrefix);
  });

  it("echoes the provided id and a createdAt timestamp", () => {
    const issued = issueApiKey({ id: "test-id" });
    expect(issued.id).toBe("test-id");
    expect(new Date(issued.createdAt).toISOString()).toBe(issued.createdAt);
  });
});

describe("hashApiKey", () => {
  it("is deterministic", () => {
    const raw = "rumia_live_abc123";
    expect(hashApiKey(raw)).toBe(hashApiKey(raw));
  });

  it("produces a 64-hex-char SHA-256 digest", () => {
    const h = hashApiKey("rumia_live_anything");
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("is hashForLookup's only output (same as hashApiKey)", () => {
    const raw = "rumia_live_lookup";
    expect(hashForLookup(raw)).toBe(hashApiKey(raw));
  });

  it("returns different hashes for different inputs", () => {
    expect(hashApiKey("rumia_live_a")).not.toBe(hashApiKey("rumia_live_b"));
  });
});

describe("isValidApiKeyShape", () => {
  it("accepts a well-formed key", () => {
    expect(isValidApiKeyShape("rumia_live_" + "a".repeat(64))).toBe(true);
  });

  it("rejects missing prefix", () => {
    expect(isValidApiKeyShape("a".repeat(64))).toBe(false);
  });

  it("rejects wrong body length", () => {
    expect(isValidApiKeyShape("rumia_live_" + "a".repeat(63))).toBe(false);
    expect(isValidApiKeyShape("rumia_live_" + "a".repeat(65))).toBe(false);
  });

  it("rejects non-hex body", () => {
    expect(isValidApiKeyShape("rumia_live_" + "z".repeat(64))).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(isValidApiKeyShape(undefined as unknown as string)).toBe(false);
    expect(isValidApiKeyShape(null as unknown as string)).toBe(false);
    expect(isValidApiKeyShape(123 as unknown as string)).toBe(false);
  });
});
