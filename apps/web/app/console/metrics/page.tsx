import { ConsoleNav } from "../_components/console-nav";

/**
 * Console Metrics — Metrics Dashboard
 *
 * Source: docs/prototype.html (ConsoleMetrics component, lines 373-385).
 * Maps to docs/spec-v4.md §1 KPIs per tier (gross margin, scalability,
 * key operational metric). The 3 placeholder cards are placeholders for
 * pipeline analytics, tier-conversion funnel, and SLA dashboards.
 */
export default function ConsoleMetricsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <ConsoleNav />
      <main className="flex-1 md:ml-64 p-container-padding-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
          Metrics Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-glass-light p-4 rounded-xl border border-white/20">
            Metric 1
          </div>
          <div className="bg-glass-light p-4 rounded-xl border border-white/20">
            Metric 2
          </div>
          <div className="bg-glass-light p-4 rounded-xl border border-white/20">
            Metric 3
          </div>
        </div>
      </main>
    </div>
  );
}