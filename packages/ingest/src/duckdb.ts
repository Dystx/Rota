/**
 * DuckDB Node-side connection helper.
 *
 * Per the 2026-07-03 decision log (`docs/roadmap.md` §3.5): use
 * Node-side DuckDB, not the WASM build. The Node binding is
 * faster for batch Parquet I/O, has a stable C++ core, and runs
 * cleanly on a Render/Fly.io worker. Trade-off: ~30MB native
 * dep, must run on Node (not Edge/Cloudflare Workers).
 *
 * This module is the single seam for DuckDB access. The actual
 * SQL queries (OSM extract, Parquet write, batched read) land
 * in PR-4. This file is the connection lifecycle.
 *
 * The value import (`duckdb` package) is dynamic so the native
 * binding is only loaded when an actual connection is opened —
 * tests, typecheck, and CI steps that don't open a connection
 * never trigger the .node binary load. The type import is
 * static so the rest of the package sees `Connection` etc.
 *
 * Note: the duckdb@1.4 Node API uses the `Database` constructor
 * (not the older `DuckDBInstance.create()` factory) and a
 * callback-based `run()` / `all()` interface. We wrap the
 * callbacks in promises for ergonomics.
 */

import type { Connection, Database as DatabaseType } from "duckdb";

/**
 * Open an in-memory DuckDB instance. Used for the `extractOsm`
 * query (we read OSM PBF into the instance, filter, then write
 * Parquet to disk). The instance is closed when the returned
 * connection is closed.
 */
export async function openInMemory(): Promise<Connection> {
  // Dynamic import so the native binding is only loaded when an
  // actual connection is opened. Tests that never open a
  // connection don't trigger the .node binary load.
  const { Database } = await import("duckdb");
  const database = await new Promise<DatabaseType>((resolve, reject) => {
    new Database(":memory:", (err: Error | null, db: DatabaseType) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
  return database.connect();
}

/**
 * Open a file-backed DuckDB instance (Parquet read for the
 * embed stage, or a persistent file for batched loads).
 */
export async function openFile(path: string): Promise<Connection> {
  const { Database } = await import("duckdb");
  const database = await new Promise<DatabaseType>((resolve, reject) => {
    new Database(path, (err: Error | null, db: DatabaseType) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
  return database.connect();
}

/**
 * Run a single statement with no parameters. Convenience
 * wrapper for setup queries (CREATE, INSTALL, LOAD). The real
 * pipelines in PR-4 will use prepared statements via
 * `connection.prepare(sql).all(...params)` for the
 * bounded-param extract/embed/load calls.
 */
export async function run(
  connection: Connection,
  sql: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.run(sql, (err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Run a query and return all rows as a `Record<string, unknown>[]`.
 * For queries that return many rows, prefer
 * `connection.prepare(...).all(...)` with a row stream and a
 * size cap.
 */
export async function all(
  connection: Connection,
  sql: string
): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    connection.all(sql, (err: Error | null, rows: Record<string, unknown>[]) => {
      if (err) reject(err);
      else resolve(rows ?? []);
    });
  });
}

/**
 * Close a connection and its parent database. Always call
 * this in a `finally` block; leaked connections hold the file
 * lock.
 */
export async function close(connection: Connection): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.close((err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
