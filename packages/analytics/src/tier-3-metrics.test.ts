import { describe, expect, it, beforeEach } from "vitest";
import {
  TIER_3_METRICS,
  listTier3Metrics,
  recordTier3Metric,
  resetTier3MetricsForTests
} from "./tier-3-metrics";

describe("tier-3-metrics", () => {
  beforeEach(() => {
    resetTier3MetricsForTests();
  });

  it("TIER_3_METRICS is a non-empty catalog of every tracked metric", () => {
    expect(TIER_3_METRICS.length).toBeGreaterThan(0);
    // The catalog should include the four metrics that gate a Tier 3
    // reactivation decision per the 2026-07-03 decision log.
    expect(TIER_3_METRICS).toContain("repeat_trip_rate_12mo");
    expect(TIER_3_METRICS).toContain("arpu_quarterly");
    expect(TIER_3_METRICS).toContain("specialist_sla_15min_pct");
    expect(TIER_3_METRICS).toContain("free_to_paid_conversion_pct");
  });

  it("recordTier3Metric appends; listTier3Metrics returns the history", () => {
    recordTier3Metric({
      metric: "repeat_trip_rate_12mo",
      value: 0.42,
      observedAt: "2026-07-03T00:00:00Z",
      window: "12mo"
    });
    recordTier3Metric({
      metric: "arpu_quarterly",
      value: 87.5,
      observedAt: "2026-07-03T00:00:00Z",
      window: "quarterly"
    });
    const history = listTier3Metrics();
    expect(history).toHaveLength(2);
    expect(history[0]?.metric).toBe("repeat_trip_rate_12mo");
    expect(history[1]?.metric).toBe("arpu_quarterly");
  });

  it("resetTier3MetricsForTests clears the in-memory history", () => {
    recordTier3Metric({
      metric: "nrr_12mo",
      value: 1.1,
      observedAt: "2026-07-03T00:00:00Z"
    });
    expect(listTier3Metrics()).toHaveLength(1);
    resetTier3MetricsForTests();
    expect(listTier3Metrics()).toHaveLength(0);
  });
});
