import { describe, expect, it, vi } from "vitest";
import {
  getSpecialistCapabilities,
  listSpecialists,
  setSpecialistCapabilities,
  setSpecialistVerified
} from "./specialists";
import type { RotaDataClient } from "./clients";

/**
 * Supabase PostgrestQueryBuilder is a fluent chain. Each
 * call to `from(table)` returns a fresh chain whose links
 * (`select`, `eq`, `order`, `limit`, `maybeSingle`,
 * `update`, `delete`, `insert`) return the chain itself;
 * the terminal call is awaited and resolves to
 * `{ data, error }`.
 *
 * `makeMockClient(configs)` accepts one config per
 * `from()` call. The config function receives the chain
 * for that call and can set up `mockResolvedValue` on
 * the terminal. `setSpecialistVerified` makes TWO
 * `from()` calls (pre-flight read + update), so it needs
 * two configs in order. `setSpecialistCapabilities` makes
 * up to N+1 calls (1 read + N deletes + 1 insert) — see
 * the test bodies for the exact queue.
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
    chain.delete = vi.fn(() => chain);
    chain.insert = vi.fn();
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
  bio: null,
  photo_url: null,
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

describe("getSpecialistCapabilities", () => {
  // Build a thenable chain that resolves to { data, error }
  // on await. The chain is BOTH chainable (select/eq/order
  // return it) AND awaitable (has .then). The Supabase
  // PostgrestQueryBuilder follows this exact pattern.
  function thenableChain(
    data: Array<{ type: string; value: string }> | null,
    error: { message: string } | null = null
  ): Record<string, unknown> {
    const promise = Promise.resolve({ data, error });
    const chain: Record<string, unknown> = {};
    chain.then = promise.then.bind(promise);
    chain.catch = promise.catch.bind(promise);
    chain.finally = promise.finally.bind(promise);
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    return chain;
  }

  it("buckets rows by type and returns two arrays", async () => {
    const from = vi.fn(() =>
      thenableChain(
        [
          { type: "language", value: "en" },
          { type: "language", value: "pt" },
          { type: "skill", value: "Sintra Expert" },
          { type: "skill", value: "Wine Tours" }
        ]
      )
    );
    const client = { from, rpc: vi.fn() } as unknown as RotaDataClient;
    const out = await getSpecialistCapabilities(baseRow.id, { client });
    expect(out.skills).toEqual(["Sintra Expert", "Wine Tours"]);
    expect(out.languages).toEqual(["en", "pt"]);
  });

  it("returns empty arrays when the specialist has no capabilities", async () => {
    const from = vi.fn(() => thenableChain(null));
    const client = { from, rpc: vi.fn() } as unknown as RotaDataClient;
    const out = await getSpecialistCapabilities(baseRow.id, { client });
    expect(out.skills).toEqual([]);
    expect(out.languages).toEqual([]);
  });

  it("throws when the read fails", async () => {
    const from = vi.fn(() => thenableChain(null, { message: "permission denied" }));
    const client = { from, rpc: vi.fn() } as unknown as RotaDataClient;
    await expect(getSpecialistCapabilities(baseRow.id, { client })).rejects.toThrow(
      "permission denied"
    );
  });
});

describe("setSpecialistCapabilities", () => {
  // The implementation:
  //   1. reads current rows with .from().select().eq().eq()
  //   2. for each removed value, .from().delete().eq().eq().eq()
  //   3. for the new batch, .from().insert(rows)
  //
  // We mock each from() call with a thenable chain, and
  // record what the function did to deleteCalls / insertCalls.

  function makeMockClientForSet(
    readData: Array<{ value: string }> | null
  ): {
    client: RotaDataClient;
    deleteCalls: Array<{ value: string }>;
    insertCalls: Array<Array<{ specialist_id: string; type: string; value: string }>>;
  } {
    const deleteCalls: Array<{ value: string }> = [];
    const insertCalls: Array<
      Array<{ specialist_id: string; type: string; value: string }>
    > = [];

    const from = vi.fn();
    // First call: read.
    from.mockImplementationOnce(() => {
      const promise = Promise.resolve({ data: readData, error: null });
      const chain: Record<string, unknown> = {};
      chain.then = promise.then.bind(promise);
      chain.select = vi.fn(() => chain);
      chain.eq = vi.fn(() => chain);
      return chain;
    });

    // Subsequent calls: delete or insert. The function
    // always calls .delete() or .insert() FIRST after
    // from(), then .eq()s. We dispatch on the first
    // method called.
    from.mockImplementation(() => {
      let mode: "delete" | "insert" | null = null;
      let eqCount = 0;
      const chain: Record<string, unknown> = {};
      const deletePromise = Promise.resolve({ data: null, error: null });
      chain.then = deletePromise.then.bind(deletePromise);
      chain.catch = deletePromise.catch.bind(deletePromise);
      chain.finally = deletePromise.finally.bind(deletePromise);
      chain.delete = vi.fn(() => {
        mode = "delete";
        eqCount = 0;
        return chain;
      });
      chain.insert = vi.fn((rows: Array<{ specialist_id: string; type: string; value: string }>) => {
        mode = "insert";
        insertCalls.push(rows);
        return deletePromise;
      });
      chain.eq = vi.fn((...args: unknown[]) => {
        eqCount += 1;
        // The function calls .eq() three times on a delete
        // chain: (specialist_id, …), (type, …), (value, …).
        // We only care about the 3rd (the value being deleted).
        if (mode === "delete" && eqCount === 3) {
          const lastArg = args[args.length - 1];
          deleteCalls.push({ value: String(lastArg) });
        }
        return chain;
      });
      return chain;
    });

    return {
      client: { from, rpc: vi.fn() } as unknown as RotaDataClient,
      deleteCalls,
      insertCalls
    };
  }

  it("inserts all values when none exist", async () => {
    const { client, deleteCalls, insertCalls } = makeMockClientForSet(null);
    await setSpecialistCapabilities(
      baseRow.id,
      "skill",
      ["Sintra Expert", "Wine Tours"],
      { client }
    );
    expect(deleteCalls).toEqual([]);
    expect(insertCalls).toEqual([
      [
        { specialist_id: baseRow.id, type: "skill", value: "Sintra Expert" },
        { specialist_id: baseRow.id, type: "skill", value: "Wine Tours" }
      ]
    ]);
  });

  it("replaces existing values (keep 1, drop 1, add 1)", async () => {
    const { client, deleteCalls, insertCalls } = makeMockClientForSet([
      { value: "Old Skill 1" },
      { value: "Old Skill 2" }
    ]);
    await setSpecialistCapabilities(
      baseRow.id,
      "skill",
      ["Old Skill 1", "New Skill"],
      { client }
    );
    expect(deleteCalls.map((d) => d.value)).toEqual(["Old Skill 2"]);
    expect(insertCalls).toEqual([
      [{ specialist_id: baseRow.id, type: "skill", value: "New Skill" }]
    ]);
  });

  it("is a no-op when the input matches the current state", async () => {
    const { client, deleteCalls, insertCalls } = makeMockClientForSet([
      { value: "en" },
      { value: "pt" }
    ]);
    await setSpecialistCapabilities(
      baseRow.id,
      "language",
      ["en", "pt"],
      { client }
    );
    expect(deleteCalls).toEqual([]);
    expect(insertCalls).toEqual([]);
  });

  it("deletes everything when the input is empty", async () => {
    const { client, deleteCalls, insertCalls } = makeMockClientForSet([
      { value: "en" },
      { value: "pt" }
    ]);
    await setSpecialistCapabilities(baseRow.id, "language", [], { client });
    expect(deleteCalls.map((d) => d.value).sort()).toEqual(["en", "pt"]);
    expect(insertCalls).toEqual([]);
  });
});
