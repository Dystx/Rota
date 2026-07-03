/**
 * Tier 3 reactivation metrics (Phase 7 of the refined spec; deferred
 * per `docs/engineering-lifecycle.md` decision 8 of the 2026-07-03
 * log). The break-even threshold for reactivating Tier 3 is
 * PM-owned. This module is the *instrumentation* side: events that
 * the dashboard, attribution, and reactivation logic will read.
 *
 * Source of truth for the metrics list: PM-side decision tree (see
 * `docs/ops/tier-3-thresholds.md` once published). The data capture
 * here is the engineering seam that any future Tier 3 work will
 * consume.
 *
 * No network calls. No PII. All values are aggregated; the per-user
 * data lives in existing tables (`trips`, `chat_messages`,
 * `payment_webhook_events`, future `user_behavior_events`) and this
 * module only reads aggregates.
 */

export type Tier3Metric =
  /** Repeat-trip rate: % of paid travelers who book a second trip within 12 months. */
  | "repeat_trip_rate_12mo"
  /** ARPU: average revenue per user per quarter. */
  | "arpu_quarterly"
  /** Net revenue retention: revenue from a cohort 12mo later, vs. start. */
  | "nrr_12mo"
  /** Specialist response SLA: % of Level 2 requests answered within the 15-min target. */
  | "specialist_sla_15min_pct"
  /** Triage deflection: % of inbound messages resolved by auto-reply without specialist touch. */
  | "triage_deflection_pct"
  /** Concierge usage rate during active trips: messages / traveler / day on Level 3. */
  | "concierge_msgs_per_traveler_day"
  /** Free → paid conversion: % of trip unlock flows that complete Stripe checkout. */
  | "free_to_paid_conversion_pct"
  /** NPS-equivalent: post-trip satisfaction (1-5 stars), aggregated to a rolling 90-day mean. */
  | "post_trip_satisfaction_90d";

/**
 * Static list of every metric tracked. The dashboard and the
 * reactivation logic iterate over this to ensure new metrics land
 * in lock-step with a new event hook. Add a metric here, add a
 * `record*` helper below, and add a query in the dashboard.
 */
export const TIER_3_METRICS: readonly Tier3Metric[] = [
  "repeat_trip_rate_12mo",
  "arpu_quarterly",
  "nrr_12mo",
  "specialist_sla_15min_pct",
  "triage_deflection_pct",
  "concierge_msgs_per_traveler_day",
  "free_to_paid_conversion_pct",
  "post_trip_satisfaction_90d"
] as const;

export interface Tier3MetricReading {
  metric: Tier3Metric;
  value: number;
  /** ISO-8601 timestamp of when the reading was taken. */
  observedAt: string;
  /** Optional window: e.g. "12mo", "quarterly", "90d". */
  window?: string;
}

const inMemoryReadings: Tier3MetricReading[] = [];

/**
 * Record a metric reading. In-memory for now; the production path
 * will write to a `tier_3_metrics_history` Supabase table (added
 * when the dashboard ships).
 */
export function recordTier3Metric(reading: Tier3MetricReading): void {
  inMemoryReadings.push(reading);
}

/** Read the in-memory history. For the future dashboard, this is
 *  the data source. Tests can use this to assert the recording
 *  path; the production dashboard will read from Supabase. */
export function listTier3Metrics(): readonly Tier3MetricReading[] {
  return inMemoryReadings.slice();
}

/** Clear the in-memory history. Test-only escape hatch. */
export function resetTier3MetricsForTests(): void {
  inMemoryReadings.length = 0;
}
