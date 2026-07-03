/**
 * API key issuance + verification (PR-15).
 *
 * The B2B developer portal issues API keys to partner
 * organizations (tourism boards, OTAs, agencies). Each
 * key is a random 32-byte hex string with a `rumia_`
 * prefix, returned to the user once at creation. The
 * server stores only the SHA-256 hash and an 8-char
 * prefix for display.
 *
 * Flow:
 *   1. `issueApiKey(orgId, label)` returns
 *      `{ id, key, keyPrefix, createdAt }`. The raw
 *      `key` is the only copy.
 *   2. The caller persists `(id, keyHash, keyPrefix,
 *      orgId, label, createdAt)` in the `api_keys`
 *      table. The raw key never touches the database.
 *   3. The gateway calls `verifyApiKey(rawKey)` to
 *      look up the org by hash; a successful lookup
 *      returns the org_id which scopes the request.
 *   4. Revocation: the developer portal sets
 *      `revoked_at` on the row. `verifyApiKey` filters
 *      `revoked_at IS NULL` and returns null for
 *      revoked keys.
 *
 * Security notes:
 *   - The raw key never enters the database.
 *   - SHA-256 is used for at-rest comparison. A future
 *     PR upgrades to Argon2id if the threat model
 *     changes (e.g. an offline attack against the
 *     database dump).
 *   - The key prefix is safe to log; the hash is not.
 *     The key itself is the secret.
 */

import { createHash, randomBytes } from "node:crypto";

const KEY_PREFIX = "rumia_live_";
const KEY_HEX_BYTES = 32; // 64 hex chars
const DISPLAY_PREFIX_LENGTH = 8;

export interface IssuedApiKey {
  id: string;
  key: string;
  keyPrefix: string;
  createdAt: string;
}

/** Generate a fresh API key. Pure (no I/O) — caller
 *  is responsible for persisting the hash + prefix
 *  via the `api_keys` table. The `id` is a fresh UUID
 *  so the caller can use it as the primary key on
 *  insert (avoids a round-trip to fetch the generated
 *  `gen_random_uuid()` from the DB). */
export function issueApiKey(input: {
  id: string;
  label?: string;
}): IssuedApiKey {
  const raw = randomBytes(KEY_HEX_BYTES).toString("hex");
  const key = `${KEY_PREFIX}${raw}`;
  const keyPrefix = raw.slice(0, DISPLAY_PREFIX_LENGTH);
  return {
    id: input.id,
    key,
    keyPrefix,
    createdAt: new Date().toISOString()
  };
}

/** Hash a raw API key to the form stored in the DB.
 *  Pure, deterministic. The raw key is the input;
 *  the hex SHA-256 digest is the output. */
export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey, "utf8").digest("hex");
}

/** Verify a raw API key against the stored hash. Returns
 *  the org_id if the key matches a non-revoked row;
 *  null otherwise. The caller is responsible for the
 *  actual DB lookup — this function just hashes the
 *  raw key so the caller can match on the hash. */
export function hashForLookup(rawKey: string): string {
  return hashApiKey(rawKey);
}

/** Validate the shape of a raw API key. The gateway
 *  uses this to short-circuit obviously-invalid input
 *  (missing prefix, wrong length) before hitting the
 *  database. */
export function isValidApiKeyShape(rawKey: string): boolean {
  if (typeof rawKey !== "string") return false;
  if (!rawKey.startsWith(KEY_PREFIX)) return false;
  const body = rawKey.slice(KEY_PREFIX.length);
  if (body.length !== KEY_HEX_BYTES * 2) return false;
  return /^[0-9a-f]+$/u.test(body);
}
