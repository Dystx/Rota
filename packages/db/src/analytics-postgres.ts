import "server-only";

import { sql } from "drizzle-orm";

import { withActor, type DatabaseActor } from "./actor";
import { bookingClicks, reviewerAssignments, trips } from "./schema";

export type PostgresAdminAnalyticsMetricCounts = {
  checkoutCompletions: number;
  partnerClicksLast7Days: number;
  partnerClicksTotal: number;
  reviewCompletions: number;
  reviewQueueSize: number;
  tripsLast7Days: number;
  tripsTotal: number;
};

async function countRows(
  db: Parameters<Parameters<ReturnType<typeof import("./connection").getDatabase>["transaction"]>[0]>[0],
  table: typeof trips | typeof bookingClicks | typeof reviewerAssignments,
  where?: ReturnType<typeof sql>
): Promise<number> {
  const query = db.select({ count: sql<number>`count(*)::int` }).from(table);
  const [row] = where ? await query.where(where) : await query;
  return Number(row?.count ?? 0);
}

export async function getPostgresAdminAnalyticsMetricCounts(actor: DatabaseActor): Promise<PostgresAdminAnalyticsMetricCounts> {
  return withActor(actor, async ({ db }) => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [tripsTotal, tripsLast7Days, checkoutCompletions, partnerClicksTotal, partnerClicksLast7Days, reviewQueueSize, reviewCompletions] = await Promise.all([
      countRows(db, trips),
      countRows(db, trips, sql`${trips.createdAt} >= ${since}`),
      countRows(db, trips, sql`${trips.isPaid} = true`),
      countRows(db, bookingClicks),
      countRows(db, bookingClicks, sql`${bookingClicks.createdAt} >= ${since}`),
      countRows(db, reviewerAssignments, sql`${reviewerAssignments.status} in ('assigned', 'submitted')`),
      countRows(db, reviewerAssignments, sql`${reviewerAssignments.status} = 'completed'`)
    ]);

    return {
      checkoutCompletions,
      partnerClicksLast7Days,
      partnerClicksTotal,
      reviewCompletions,
      reviewQueueSize,
      tripsLast7Days,
      tripsTotal
    };
  });
}
