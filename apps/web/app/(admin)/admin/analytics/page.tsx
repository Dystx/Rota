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
      <SectionHeading
        eyebrow="Admin CMS"
        title="Analytics shell"
        description="Prepared for product analytics, funnel health, monetization visibility, and country-launch signals."
      />
      <div className="grid gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle>{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatPill label="Current" value={metric.value} />
            </CardContent>
          </Card>
        ))}
      </div>
      {infoMessage ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Core funnel</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {funnels.map(([stage, value]) => (
              <div key={stage} className="flex items-center justify-between rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                <p className="text-sm text-[var(--color-foreground)]">{stage}</p>
                <StatPill label="Rate" value={value} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Partner click leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {topPartners.length ? (
              topPartners.map((partner) => (
                <div key={partner.partnerId} className="flex items-center justify-between rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                  <p className="text-sm text-[var(--color-foreground)]">{partner.name}</p>
                  <StatPill label="Clicks" value={String(partner.clicks)} />
                </div>
              ))
            ) : (
              <p className="rota-muted">Partner click reporting will appear here once travelers start opening booking sources from saved trips.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
