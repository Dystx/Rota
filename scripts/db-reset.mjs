import process from "node:process";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

if (process.env.RUMIA_ALLOW_DB_RESET !== "1") {
  throw new Error("Refusing destructive reset. Set RUMIA_ALLOW_DB_RESET=1 for a local database only.");
}

const database = new URL(databaseUrl);
const localHosts = new Set(["", "127.0.0.1", "::1", "localhost"]);

if (!localHosts.has(database.hostname)) {
  throw new Error("Refusing destructive reset against a non-local database host.");
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 });

try {
  await pool.query('drop schema if exists private cascade');
  await pool.query('drop schema if exists app cascade');
  await pool.query('drop schema if exists authn cascade');
  await pool.query('drop table if exists public.__drizzle_migrations');
  await migrate(drizzle({ client: pool }), { migrationsFolder: "drizzle" });
} finally {
  await pool.end();
}
