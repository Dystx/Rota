import { getReviewerById, isPersistenceConfigError } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading, StatPill } from "@repo/ui";

export default async function ReviewerProfilePage() {
  let reviewer = null as Awaited<ReturnType<typeof getReviewerById>>;
  let infoMessage = "";

  try {
    reviewer = await getReviewerById("ines-almeida");
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load the persisted reviewer profile here."
      : error instanceof Error
        ? error.message
        : "Could not load reviewer profile.";
  }

  const currentReviewer = {
    bio: reviewer?.bio || "Reviewer profile details will appear here once they are saved.",
    country: reviewer?.country || "Portugal",
    languages: reviewer?.languages.length ? reviewer.languages : ["Pending"],
    name: reviewer?.name || "Reviewer profile unavailable",
    rating: reviewer?.rating ?? null,
    regions: reviewer?.regions.length ? reviewer.regions : ["Coverage pending"],
    responsePromise: reviewer?.responsePromise || "Response promise pending",
    specialties: reviewer?.specialties.length ? reviewer.specialties : ["Specialties pending"],
    status: reviewer?.status || "Pending"
  };

  return (
    <PageShell variant="reviewer">
      <SectionHeading
        eyebrow="Reviewer dashboard"
        title="Reviewer profile shell"
        description="Covers the roadmap's reviewer identity layer: regions, languages, specialties, and quality expectations."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-3">
              <StatPill label="Status" value={currentReviewer.status} />
              <StatPill label="Country" value={currentReviewer.country} />
              <StatPill label="Rating" value={`${currentReviewer.rating ?? "Pending"}${currentReviewer.rating ? " / 5" : ""}`} />
            </div>
            <CardTitle>{currentReviewer.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="rota-kicker">Bio</p>
              <p className="mt-2 text-sm text-[var(--color-foreground)]">
                {currentReviewer.bio}
              </p>
            </div>
            <div className="grid gap-3 text-sm">
              <SummaryRow label="Languages" value={currentReviewer.languages.join(", ")} />
              <SummaryRow label="Response promise" value={currentReviewer.responsePromise} />
              <SummaryRow label="Reviewer checklist" value="Food quality, pacing, weather fallback, local-note clarity" />
            </div>
            {infoMessage ? <p className="rota-muted text-sm">{infoMessage}</p> : null}
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {currentReviewer.regions.map((region) => (
                <div key={region} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4 text-sm text-[var(--color-foreground)]">
                  {region}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {currentReviewer.specialties.map((specialty) => (
                <Badge key={specialty} tone="soft">
                  {specialty}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0">
      <p className="rota-kicker">{label}</p>
      <p className="text-sm text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}
