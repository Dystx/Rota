import { getAdminAnalyticsMetricCounts, isPersistenceConfigError, listBookingClicks, type AdminAnalyticsMetricCounts } from "@repo/db";
import { Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading, StatPill } from "@repo/ui";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

function prettify(value: string) {
  return value.replace(/-/g, " ");
}

const emptyAnalyticsCounts: AdminAnalyticsMetricCounts = {
  checkoutCompletions: 0,
  partnerClicksLast7Days: 0,
  partnerClicksTotal: 0,
  reviewCompletions: 0,
  reviewQueueSize: 0,
  tripsLast7Days: 0,
  tripsTotal: 0
};

export default async function AdminAnalyticsPage() {
  const auth = await getAdminPageAuthContext();
  let analyticsCounts = emptyAnalyticsCounts;
  let bookingClicks = [] as Awaited<ReturnType<typeof listBookingClicks>>;
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      [analyticsCounts, bookingClicks] = await Promise.all([
        getAdminAnalyticsMetricCounts({ actor: auth.actor }),
        listBookingClicks(200, { actor: auth.actor })
      ]);
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted analytics here."
      : "Could not load analytics yet.";
  }

  const sourceCounts = bookingClicks.reduce<Record<string, number>>((counts, click) => {
    counts[click.source] = (counts[click.source] ?? 0) + 1;

    return counts;
  }, {});
  const partnerCounts = bookingClicks.reduce<Record<string, { clicks: number; name: string }>>((counts, click) => {
    const key = click.partnerId;

    counts[key] = {
      clicks: (counts[key]?.clicks ?? 0) + 1,
      name: click.partnerName ?? key
    };

    return counts;
  }, {});
  const topPartners = Object.entries(partnerCounts)
    .map(([partnerId, value]) => ({ partnerId, ...value }))
    .sort((left, right) => right.clicks - left.clicks)
    .slice(0, 4);
  const topSource = Object.entries(sourceCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "none";
  const metrics = [
    { label: "Trips", value: String(analyticsCounts.tripsTotal), detail: `${analyticsCounts.tripsLast7Days} last 7d` },
    { label: "Checkout completions", value: String(analyticsCounts.checkoutCompletions), detail: "Paid trips" },
    { label: "Partner clicks", value: String(analyticsCounts.partnerClicksTotal), detail: `${analyticsCounts.partnerClicksLast7Days} last 7d` },
    { label: "Review queue", value: String(analyticsCounts.reviewQueueSize), detail: `${analyticsCounts.reviewCompletions} completed` }
  ];
  const operationalMetrics: Array<[string, string]> = [
    ["Trips created", `${analyticsCounts.tripsTotal} total / ${analyticsCounts.tripsLast7Days} last 7d`],
    ["Checkout starts", "Not tracked yet"],
    ["Checkout completions", `${analyticsCounts.checkoutCompletions} paid trips`],
    ["Partner click source", prettify(topSource)],
    ["Review queue", `${analyticsCounts.reviewQueueSize} assigned/submitted`],
    ["Review completions", `${analyticsCounts.reviewCompletions} completed`]
  ];

  return (
    <PageShell variant="admin">
      <div data-testid="admin-analytics-header" className="mb-12">
        <SectionHeading
          h1
          eyebrow="Admin CMS"
          title="Analytics"
          description="Prepared for product analytics, funnel health, monetization visibility, and country-launch signals."
        />
      </div>

      <div data-testid="analytics-metrics" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {metrics.map((metric) => (
          <Card key={metric.label} className="rota-glass-panel border-none shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-lg font-medium tracking-tight">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <StatPill label="Current" value={metric.value} />
              <p className="mt-3 text-xs font-medium text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {infoMessage ? (
        <Card className="mb-8 border-[rgba(180,35,24,0.15)] bg-[rgba(180,35,24,0.03)] shadow-none">
          <CardContent className="pt-6">
            <p className="text-[#b42318] text-sm font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#b42318] inline-block"></span>
              {infoMessage}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] w-full max-w-full min-w-0">
        <div data-testid="analytics-snapshot" className="w-full min-w-0">
          <Card className="rota-glass-panel border-none shadow-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/40 bg-[var(--color-surface-muted)]/30">
              <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
                <span className="rota-dot"></span> Operational snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto" role="region" aria-label="Operational metrics" tabIndex={0}>
              <div className="grid gap-3 min-w-[300px]">
                {operationalMetrics.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-4 shadow-sm transition-colors hover:border-[var(--color-primary)]/30 hover:bg-white">
                    <p className="text-sm font-medium text-[var(--color-foreground)] tracking-tight">{label}</p>
                    <StatPill label="Metric" value={value} />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Checkout starts are not persisted today; completions are derived from paid trips without reading the service-role-only webhook ledger.
              </p>
            </CardContent>
          </Card>
        </div>

        <div data-testid="partner-leaderboard" className="w-full min-w-0">
          <Card className="rota-glass-panel border-none shadow-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/40 bg-[var(--color-surface-muted)]/30">
              <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
                <span className="rota-dot"></span> Partner click leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto text-sm" role="region" aria-label="Partner click leaderboard" tabIndex={0}>
              {topPartners.length ? (
                <div className="grid gap-3 min-w-[300px]">
                  {topPartners.map((partner) => (
                    <div key={partner.partnerId} className="flex items-center justify-between rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-4 shadow-sm transition-colors hover:border-[var(--color-primary)]/30 hover:bg-white">
                      <p className="text-sm font-medium text-[var(--color-foreground)] tracking-tight">{partner.name}</p>
                      <StatPill label="Clicks" value={String(partner.clicks)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[rgba(48,101,118,0.04)] border border-[rgba(48,101,118,0.1)]">
                  <p className="text-[var(--color-secondary)] text-sm leading-relaxed font-medium">
                    Partner click reporting will appear here once travelers start opening booking sources from saved trips.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
