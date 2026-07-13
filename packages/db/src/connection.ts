import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export type DatabaseConfig = {
  databaseUrl: string;
};

type DatabaseEnvironment = Readonly<Record<string, string | undefined>>;

type DatabaseRuntime = {
  db: ReturnType<typeof drizzle>;
  pool: Pool;
};

const runtimeKey = "__rumiaDatabaseRuntime";

function getGlobalRuntime() {
  return globalThis as typeof globalThis & {
    [runtimeKey]?: DatabaseRuntime;
  };
}

export function createDatabaseConfig(environment: DatabaseEnvironment): DatabaseConfig {
  const databaseUrl = environment.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }

  return { databaseUrl };
}

/**
 * Lazily creates the server-only PostgreSQL pool. Delaying construction keeps
 * configuration tests side-effect free and prevents a database connection at
 * module evaluation time.
 */
export function getDatabase() {
  const runtime = getGlobalRuntime();

  if (!runtime[runtimeKey]) {
    const { databaseUrl } = createDatabaseConfig(process.env);
    // Better Auth's Kysely adapter addresses its tables without schema
    // qualifiers. Keep the application pool on the same private search path
    // as the VPS role contract so authn/app tables are resolved consistently
    // in local tests and production.
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      options: "-c search_path=authn,app,public"
    });

    runtime[runtimeKey] = {
      db: drizzle({ client: pool }),
      pool
    };
  }

  return runtime[runtimeKey]!.db;
}

export function getDatabasePool() {
  getDatabase();
  return getGlobalRuntime()[runtimeKey]!.pool;
}
