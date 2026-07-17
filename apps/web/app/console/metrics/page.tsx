import * as React from "react";
import { getPostgresAdminAnalyticsMetricCounts } from "@repo/db";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";
import { DecisionStatePanel } from "@repo/ui";

type MetricsState =
  | { kind: "ready"; counts: Awaited<ReturnType<typeof getPostgresAdminAnalyticsMetricCounts>> }
  | { kind: "unavailable" };

async function loadMetricsState(): Promise<MetricsState> {
  try {
    const admin = await getAdminPageAuthContext({ allCapabilities: ["analytics:read"] });
    if (!isAdminPageAuthContext(admin)) return { kind: "unavailable" };
    return { kind: "ready", counts: await getPostgresAdminAnalyticsMetricCounts(admin.actor) };
  } catch {
    return { kind: "unavailable" };
  }
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function ConsoleMetricsPage() {
  const state = await loadMetricsState();

  return (
    <div data-testid="console-metrics" className="min-h-screen min-w-0 overflow-x-hidden bg-background p-container-padding-sm lg:p-container-padding-lg">
      <header className="mb-6 border-b border-olive-light/15 pb-5">
        <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
          Operator metrics
        </p>
        <h1 className="mt-2 font-headline-lg text-headline-lg text-primary">Pipeline health</h1>
        <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
          Counts are read from the admin reporting tables and are never replaced with illustrative totals.
        </p>
      </header>

      {state.kind === "unavailable" ? (
        <div data-testid="console-metrics-unavailable">
          <DecisionStatePanel
            kind="unavailable"
            headingLevel={2}
            title="Metrics are unavailable"
            description="The admin reporting source could not be loaded, so no derived or placeholder totals are shown."
          />
        </div>
      ) : (
        <section className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Persisted operator metrics">
          <MetricCard label="Trips total" value={formatCount(state.counts.tripsTotal)} />
          <MetricCard label="Trips · last 7 days" value={formatCount(state.counts.tripsLast7Days)} />
          <MetricCard label="Review queue" value={formatCount(state.counts.reviewQueueSize)} />
          <MetricCard label="Review completions" value={formatCount(state.counts.reviewCompletions)} />
          <MetricCard label="Checkout completions" value={formatCount(state.counts.checkoutCompletions)} />
          <MetricCard label="Partner clicks total" value={formatCount(state.counts.partnerClicksTotal)} />
          <MetricCard label="Partner clicks · last 7 days" value={formatCount(state.counts.partnerClicksLast7Days)} />
        </section>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="min-w-0 rounded-xl border border-olive-light/15 bg-white/65 p-card-padding shadow-sm">
      <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-5 break-words font-headline-lg text-headline-lg text-primary">{value}</p>
      <p className="mt-2 font-label-ui text-label-ui text-on-surface-variant">Persisted admin count</p>
    </article>
  );
}
