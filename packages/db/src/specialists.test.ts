import { describe, expect, it, vi } from "vitest";
import {
  listSpecialists,
  setSpecialistVerified
} from "./specialists";
import type { RotaDataClient } from "./clients";

/**
 * Supabase PostgrestQueryBuilder is a fluent chain. Each
 * call to `from(table)` returns a fresh chain whose links
 * (`select`, `eq`, `order`, `limit`, `maybeSingle`,
 * `update`) return the chain itself; the terminal call is
 * awaited and resolves to `{ data, error }`.
 *
 * `makeMockClient(configs)` accepts one config per
 * `from()` call. The config function receives the chain
 * for that call and can set up `mockResolvedValue` on
 * the terminal. `setSpecialistVerified` makes TWO `from()`
 * calls (pre-flight read + update), so it needs two
 * configs in order.
 */
function makeMockClient(
  configs: Array<(chain: Record<string, ReturnType<typeof vi.fn>>) => void>
) {
  const builders: Array<Record<string, ReturnType<typeof vi.fn>>> = [];
  const from = vi.fn(() => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    chain.limit = vi.fn(() => chain);
    chain.maybeSingle = vi.fn();
    chain.update = vi.fn(() => chain);
    builders.push(chain);
    const config = configs.shift();
    if (config) config(chain);
    return chain;
  });
  return {
    client: { from, rpc: vi.fn() } as unknown as RotaDataClient,
    builders
  };
}

const baseRow = {
  id: "11111111-1111-1111-1111-111111111111",
  user_id: "22222222-2222-2222-2222-222222222222",
  full_name: "Inês Almeida",
  regions_covered: [],
  tier_3_on_call: true,
  tier_4_licensed_guide: false,
  rnaat_license_number: null,
  is_verified: false,
  hourly_rate: 60,
  created_at: "2026-07-01T10:00:00Z"
};

describe("listSpecialists", () => {
  it("returns the parsed rows when the query succeeds", async () => {
    const { client, builders } = makeMockClient([
      (chain) =>
        chain.limit!.mockResolvedValue({
          data: [
            baseRow,
            { ...baseRow, id: "33333333-3333-3333-3333-333333333333", is_verified: true }
          ],
          error: null
        })
    ]);
    const out = await listSpecialists(50, { client });
    expect(out).toHaveLength(2);
    expect(out[0]?.isVerified).toBe(false);
    expect(out[1]?.isVerified).toBe(true);
    expect(client.from).toHaveBeenCalledWith("specialist_profiles");
    expect(builders[0]!.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(builders[0]!.limit).toHaveBeenCalledWith(50);
  });

  it("returns [] when the table is empty", async () => {
    const { client } = makeMockClient([
      (chain) => chain.limit!.mockResolvedValue({ data: null, error: null })
    ]);
    const out = await listSpecialists(50, { client });
    expect(out).toEqual([]);
  });

  it("throws on error", async () => {
    const { client } = makeMockClient([
      (chain) =>
        chain.limit!.mockResolvedValue({
          data: null,
          error: { message: "permission denied" }
        })
    ]);
    await expect(listSpecialists(50, { client })).rejects.toThrow(
      "permission denied"
    );
  });
});

describe("setSpecialistVerified", () => {
  it("flips is_verified to true on a tier 3 row", async () => {
    const { client, builders } = makeMockClient([
      // Pre-flight read.
      (chain) => chain.maybeSingle!.mockResolvedValue({ data: baseRow, error: null }),
      // Update.
      (chain) =>
        chain.maybeSingle!.mockResolvedValue({
          data: { ...baseRow, is_verified: true },
          error: null
        })
    ]);
    const out = await setSpecialistVerified(baseRow.id, true, { client });
    expect(out?.isVerified).toBe(true);
    expect(builders[1]!.update).toHaveBeenCalledWith({ is_verified: true });
    expect(builders[1]!.eq).toHaveBeenCalledWith("id", baseRow.id);
  });

  it("flips is_verified to false on a non-tier-4 row", async () => {
    const { client } = makeMockClient([
      (chain) =>
        chain.maybeSingle!.mockResolvedValue({
          data: { ...baseRow, is_verified: true },
          error: null
        }),
      (chain) =>
        chain.maybeSingle!.mockResolvedValue({
          data: { ...baseRow, is_verified: false },
          error: null
        })
    ]);
    const out = await setSpecialistVerified(baseRow.id, false, { client });
    expect(out?.isVerified).toBe(false);
  });

  it("refuses to unverify a tier 4 row (DB CHECK mirror)", async () => {
    const { client } = makeMockClient([
      (chain) =>
        chain.maybeSingle!.mockResolvedValue({
          data: {
            ...baseRow,
            tier_4_licensed_guide: true,
            rnaat_license_number: "RNAAT-1234",
            is_verified: true
          },
          error: null
        })
    ]);
    // The second from() should NOT happen because the
    // pre-flight guard throws.
    await expect(
      setSpecialistVerified(baseRow.id, false, { client })
    ).rejects.toThrow(/Cannot unverify a Tier 4 specialist/);
    expect(client.from).toHaveBeenCalledTimes(1);
  });

  it("allows verifying a tier 4 row (admin grants verification)", async () => {
    const { client } = makeMockClient([
      (chain) =>
        chain.maybeSingle!.mockResolvedValue({
          data: {
            ...baseRow,
            tier_4_licensed_guide: true,
            rnaat_license_number: "RNAAT-1234",
            is_verified: false
          },
          error: null
        }),
      (chain) =>
        chain.maybeSingle!.mockResolvedValue({
          data: {
            ...baseRow,
            tier_4_licensed_guide: true,
            rnaat_license_number: "RNAAT-1234",
            is_verified: true
          },
          error: null
        })
    ]);
    const out = await setSpecialistVerified(baseRow.id, true, { client });
    expect(out?.isVerified).toBe(true);
  });

  it("returns null when the specialist does not exist", async () => {
    const { client } = makeMockClient([
      (chain) => chain.maybeSingle!.mockResolvedValue({ data: null, error: null })
    ]);
    const out = await setSpecialistVerified(
      "ffffffff-ffff-ffff-ffff-ffffffffffff",
      true,
      { client }
    );
    expect(out).toBeNull();
    // No update attempted.
    expect(client.from).toHaveBeenCalledTimes(1);
  });

  it("propagates the DB error on the update", async () => {
    const { client } = makeMockClient([
      (chain) => chain.maybeSingle!.mockResolvedValue({ data: baseRow, error: null }),
      (chain) =>
        chain.maybeSingle!.mockResolvedValue({
          data: null,
          error: { message: "check constraint violated" }
        })
    ]);
    await expect(
      setSpecialistVerified(baseRow.id, true, { client })
    ).rejects.toThrow("check constraint violated");
  });
});
