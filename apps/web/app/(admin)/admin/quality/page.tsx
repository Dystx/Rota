import { isPersistenceConfigError, listPlaces } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading, StatPill } from "@repo/ui";

export default async function AdminQualityPage() {
  let places = [] as Awaited<ReturnType<typeof listPlaces>>;
  let infoMessage = "";

  try {
    places = await listPlaces();
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
      <SectionHeading
        eyebrow="Admin CMS"
        title="Quality dashboard shell"
        description="Surfaces the roadmap's quality-review layer for itinerary health, reviewer trust, and route realism."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quality score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatPill label="Current" value={averageQuality === "—" ? averageQuality : `${averageQuality} / 10`} />
            <StatPill label="Places flagged" value={String(flaggedPlaces.length)} />
            <StatPill label="High confidence" value={String(highConfidencePlaces)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Key checks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[
              `${places.length} places tracked`,
              `${scoredPlaces.length} scored`,
              `${flaggedPlaces.filter((place) => place.quality === null).length} missing quality`,
              `${flaggedPlaces.filter((place) => place.sourceConfidence !== "High").length} low-confidence`
            ].map((item) => (
              <Badge key={item} tone="soft">{item}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rota-muted text-sm">
              {flaggedPlaces.length
                ? "Prioritize lower-confidence or lower-scored places before they influence more generated routes."
                : "Quality signals look clear so far. Keep expanding the curated place base without lowering confidence standards."}
            </p>
          </CardContent>
        </Card>
      </div>
      {infoMessage ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Place review queue</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {checks.map((item) => (
            <div key={item.title} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">{item.title}</p>
              <p className="rota-muted mt-2 text-sm">{item.details}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
