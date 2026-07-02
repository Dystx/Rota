import { isPersistenceConfigError, listPlaces } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading, StatPill } from "@repo/ui";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

export default async function AdminQualityPage() {
  const auth = await getAdminPageAuthContext();
  let places = [] as Awaited<ReturnType<typeof listPlaces>>;
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      places = await listPlaces(100, { client: auth.client });
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load persisted quality signals here."
      : error instanceof Error
        ? error.message
        : "Could not load quality data yet.";
  }

  const scoredPlaces = places.filter((place) => place.quality !== null && place.quality !== undefined);
  const averageQuality = scoredPlaces.length
    ? (scoredPlaces.reduce((total, place) => total + (place.quality ?? 0), 0) / scoredPlaces.length).toFixed(1)
    : "—";
  const flaggedPlaces = places.filter((place) => place.quality === null || (place.quality ?? 0) < 8 || place.sourceConfidence !== "High");
  const highConfidencePlaces = places.filter((place) => place.sourceConfidence === "High").length;
  const reviewQueue = flaggedPlaces.length
    ? flaggedPlaces
        .slice()
        .sort((left, right) => (left.quality ?? -1) - (right.quality ?? -1))
        .slice(0, 6)
    : [];
  const checks = reviewQueue.length
    ? reviewQueue.map((place) => {
        const quality = place.quality;
        const reasons = [
          quality == null ? "Quality score missing" : quality < 8 ? `Quality ${quality.toFixed(1)}` : null,
          place.sourceConfidence !== "High" ? `${place.sourceConfidence} source confidence` : null
        ].filter(Boolean);

        return {
          details: reasons.join(" · ") || "Needs manual review",
          title: `${place.name} · ${place.region}`
        };
      })
    : [
        {
          details: "No persisted quality flags yet.",
          title: "Waiting for place-review signals"
        }
      ];

  return (
    <PageShell variant="admin">
      <div data-testid="admin-quality-header" className="mb-12">
        <SectionHeading
          eyebrow="Admin CMS"
          title="Quality signals"
          description="Reviews itinerary health, reviewer trust, and route realism across the curated place base."
          h1
        />
      </div>

      <div data-testid="quality-metrics" className="grid gap-6 lg:grid-cols-3 mb-10">
        <Card className="rota-glass-panel border-none shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-medium tracking-tight">Quality score</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex flex-wrap gap-4">
            <StatPill label="Current" value={averageQuality === "—" ? averageQuality : `${averageQuality} / 10`} />
            <StatPill label="Places flagged" value={String(flaggedPlaces.length)} />
            <StatPill label="High confidence" value={String(highConfidencePlaces)} />
          </CardContent>
        </Card>

        <Card className="rota-glass-panel border-none shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-medium tracking-tight">Key checks</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex flex-wrap gap-2.5">
            {[
              `${places.length} places tracked`,
              `${scoredPlaces.length} scored`,
              `${flaggedPlaces.filter((place) => place.quality === null).length} missing quality`,
              `${flaggedPlaces.filter((place) => place.sourceConfidence !== "High").length} low-confidence`
            ].map((item) => (
              <Badge key={item} tone="soft" className="bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)] px-3 py-1 font-medium">{item}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="rota-glass-panel border-none shadow-sm transition-all hover:shadow-md bg-[var(--color-surface)]">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-medium tracking-tight">Current focus</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex flex-col justify-center">
            <div className="p-4 rounded-xl bg-[rgba(48,101,118,0.04)] border border-[rgba(48,101,118,0.1)]">
              <p className="text-[var(--color-secondary)] text-sm leading-relaxed font-medium">
                {flaggedPlaces.length
                  ? "Prioritize lower-confidence or lower-scored places before they influence more generated routes."
                  : "Quality signals look clear so far. Keep expanding the curated place base without lowering confidence standards."}
              </p>
            </div>
          </CardContent>
        </Card>
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

      <div data-testid="quality-queue" className="w-full max-w-full min-w-0">
        <Card className="rota-glass-panel border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-[var(--color-surface-muted)]/30">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="rota-dot"></span> Place review queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 overflow-x-auto">
            <div className="grid gap-4 md:grid-cols-2">
              {checks.map((item) => (
                <div key={item.title} className="rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-5 shadow-sm transition-colors hover:border-[var(--color-primary)]/30 hover:bg-white">
                  <p className="text-sm font-medium text-[var(--color-foreground)] tracking-tight">{item.title}</p>
                  <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm leading-relaxed">{item.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
