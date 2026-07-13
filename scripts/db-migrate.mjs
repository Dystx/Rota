import process from "node:process";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 });

try {
  await migrate(drizzle({ client: pool }), { migrationsFolder: "drizzle" });
} finally {
  await pool.end();
}
