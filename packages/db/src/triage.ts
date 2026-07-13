import "server-only";

import { sql } from "drizzle-orm";
import { getDatabase } from "./connection";

export async function consumePostgresTriageToken(maxPerMinute: number): Promise<boolean> {
  const result = await getDatabase().execute(sql`select private.consume_triage_token(${Math.trunc(maxPerMinute)}) as granted`);
  const row = (result as unknown as { rows: Array<{ granted: boolean }> }).rows[0];
  return row?.granted === true;
}
