import { sql } from "drizzle-orm";
import { getProviderHealthReport } from "@repo/config";
import { getDatabase } from "@repo/db/connection";

type HealthDependencies = {
  probeDatabase?: () => Promise<void>;
  now?: Date;
};

async function probePostgres() {
  await getDatabase().execute(sql`select 1`);
}

/** Private deployment/readiness probe with no credential or query-data output. */
export async function handleHealthRequest({ probeDatabase = probePostgres, now }: HealthDependencies = {}) {
  const report = getProviderHealthReport(now);
  const postgres = report.providers.find((provider) => provider.provider === "postgresql");

  if (postgres?.status !== "configured") {
    return Response.json(
      { generatedAt: report.generatedAt, status: "degraded", database: "configuration-missing" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  try {
    await probeDatabase();
    return Response.json(
      { generatedAt: report.generatedAt, status: "ok", database: "ready" },
      { headers: { "cache-control": "no-store" } }
    );
  } catch {
    return Response.json(
      { generatedAt: report.generatedAt, status: "degraded", database: "unreachable" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
