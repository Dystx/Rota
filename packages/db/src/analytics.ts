import { resolveLegacyDataClient, type DataClientOptions } from "./clients";
import { getPostgresAdminAnalyticsMetricCounts } from "./analytics-postgres";

export type AdminAnalyticsMetricCounts = {
  checkoutCompletions: number;
  partnerClicksLast7Days: number;
  partnerClicksTotal: number;
  reviewCompletions: number;
  reviewQueueSize: number;
  tripsLast7Days: number;
  tripsTotal: number;
};

const ACTIVE_REVIEW_ASSIGNMENT_STATUSES = ["assigned", "submitted"] as const;
const COMPLETED_REVIEW_ASSIGNMENT_STATUS = "completed";

type CountQuery = PromiseLike<{
  count: number | null;
  error: { message: string } | null;
}>;

type FilterableCountQuery = CountQuery & {
  eq: (column: string, value: boolean | string) => CountQuery;
  gte: (column: string, value: string) => CountQuery;
  in: (column: string, values: string[]) => CountQuery;
};

function sevenDaysAgoIso(now = new Date()): string {
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

async function countRows(
  table: "booking_clicks" | "reviewer_assignments" | "trips",
  applyFilters: (query: FilterableCountQuery) => CountQuery,
  options?: DataClientOptions
): Promise<number> {
  const query = resolveLegacyDataClient(options).from(table).select("id", { count: "exact", head: true }) as unknown as FilterableCountQuery;
  const { count, error } = await applyFilters(query);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getAdminAnalyticsMetricCounts(options?: DataClientOptions): Promise<AdminAnalyticsMetricCounts> {
  if (options?.actor) return getPostgresAdminAnalyticsMetricCounts(options.actor);

  const since = sevenDaysAgoIso();

  const [
    tripsTotal,
    tripsLast7Days,
    checkoutCompletions,
    partnerClicksTotal,
    partnerClicksLast7Days,
    reviewQueueSize,
    reviewCompletions
  ] = await Promise.all([
    countRows("trips", (query) => query, options),
    countRows("trips", (query) => query.gte("created_at", since), options),
    countRows("trips", (query) => query.eq("is_paid", true), options),
    countRows("booking_clicks", (query) => query, options),
    countRows("booking_clicks", (query) => query.gte("created_at", since), options),
    countRows("reviewer_assignments", (query) => query.in("status", [...ACTIVE_REVIEW_ASSIGNMENT_STATUSES]), options),
    countRows("reviewer_assignments", (query) => query.eq("status", COMPLETED_REVIEW_ASSIGNMENT_STATUS), options)
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
}
