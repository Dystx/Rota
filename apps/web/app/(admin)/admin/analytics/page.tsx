import { isPersistenceConfigError, listBookingClicks } from "@repo/db";
import { Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading, StatPill } from "@repo/ui";

function prettify(value: string) {
  return value.replace(/-/g, " ");
}

const funnels: Array<[string, string]> = [
  ["Landing → brief", "61%"],
  ["Brief → saved trip", "46%"],
  ["Saved trip → unlock", "18%"],
  ["Unlock → export", "72%"]
];

export default async function AdminAnalyticsPage() {
  let bookingClicks = [] as Awaited<ReturnType<typeof listBookingClicks>>;
  let infoMessage = "";

  try {
    bookingClicks = await listBookingClicks();
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load persisted analytics here."
      : error instanceof Error
        ? error.message
        : "Could not load analytics yet.";
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentClicks = bookingClicks.filter((click) => new Date(click.createdAt).getTime() >= sevenDaysAgo);
  const sourceCounts = recentClicks.reduce<Record<string, number>>((counts, click) => {
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
    { label: "Partner clicks", value: String(bookingClicks.length) },
    { label: "7-day clicks", value: String(recentClicks.length) },
    { label: "Partners clicked", value: String(Object.keys(partnerCounts).length) },
    { label: "Top source", value: prettify(topSource) }
  ];

  return (
    <PageShell variant="admin">
      <div data-testid="admin-analytics-header" className="mb-12">
        <SectionHeading
          eyebrow="Admin CMS"
          title="Analytics shell"
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
        <div data-testid="funnel-card" className="w-full min-w-0">
          <Card className="rota-glass-panel border-none shadow-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/40 bg-[var(--color-surface-muted)]/30">
              <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
                <span className="rota-dot"></span> Core funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
              <div className="grid gap-3 min-w-[300px]">
                {funnels.map(([stage, value]) => (
                  <div key={stage} className="flex items-center justify-between rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-4 shadow-sm transition-colors hover:border-[var(--color-primary)]/30 hover:bg-white">
                    <p className="text-sm font-medium text-[var(--color-foreground)] tracking-tight">{stage}</p>
                    <StatPill label="Rate" value={value} />
                  </div>
                ))}
              </div>
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
            <CardContent className="p-6 overflow-x-auto text-sm">
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
