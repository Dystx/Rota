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
      <div data-testid="reviewer-profile-header">
        <SectionHeading
          eyebrow="Reviewer dashboard"
          title="Reviewer profile shell"
          description="Covers the roadmap's reviewer identity layer: regions, languages, specialties, and quality expectations."
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] xl:grid-cols-[0.9fr_1.1fr]">
        <Card data-testid="profile-card" className="min-w-0 break-words">
          <CardHeader>
            <div className="flex flex-wrap gap-3">
              <StatPill label="Status" value={currentReviewer.status} />
              <StatPill label="Country" value={currentReviewer.country} />
              <StatPill label="Rating" value={`${currentReviewer.rating ?? "Pending"}${currentReviewer.rating ? " / 5" : ""}`} />
            </div>
            <CardTitle className="mt-2 break-words">{currentReviewer.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-5 shadow-sm">
              <p className="rota-kicker mb-2">Bio</p>
              <p className="text-[15px] leading-relaxed text-[var(--color-foreground)]">
                {currentReviewer.bio}
              </p>
            </div>
            <div className="grid gap-4 text-[15px]">
              <SummaryRow label="Languages" value={currentReviewer.languages.join(", ")} />
              <SummaryRow label="Response promise" value={currentReviewer.responsePromise} />
              <SummaryRow label="Reviewer checklist" value="Food quality, pacing, weather fallback, local-note clarity" />
            </div>
            {infoMessage ? (
              <div className="rounded-[20px] border border-orange-200 bg-orange-50/50 p-4">
                <p className="text-sm text-orange-800">{infoMessage}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-6 min-w-0">
          <Card data-testid="coverage-card" className="min-w-0 break-words">
            <CardHeader>
              <CardTitle>Coverage</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {currentReviewer.regions.map((region) => (
                <div key={region} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4 text-[15px] text-[var(--color-foreground)] transition-colors hover:bg-white">
                  {region}
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card data-testid="specialties-card" className="min-w-0 break-words">
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {currentReviewer.specialties.map((specialty) => (
                <Badge key={specialty} tone="soft" className="text-sm px-3 py-1">
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
    <div className="grid gap-1.5 border-b border-[var(--color-border)] pb-4 last:border-b-0 last:pb-0">
      <p className="rota-kicker">{label}</p>
      <p className="text-[15px] leading-relaxed text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}
