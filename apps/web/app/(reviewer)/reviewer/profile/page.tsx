import { getReviewerById, isPersistenceConfigError } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, ErrorState, PageShell, SectionHeading, StatPill } from "@repo/ui";
import { getReviewerPageAuthContext } from "@/lib/auth/reviewer";
import { RequireReviewerAuth } from "../../_components/require-reviewer-auth";

export default async function ReviewerProfilePage() {
  let reviewer = null as Awaited<ReturnType<typeof getReviewerById>>;
  let errorMessage = "";
  let notSignedIn = false;

  try {
    const auth = await getReviewerPageAuthContext();

    if (!auth) {
      notSignedIn = true;
    } else if ("reason" in auth) {
      errorMessage = "Reviewer profile is temporarily unavailable. Please try again shortly.";
    } else {
      reviewer = await getReviewerById(auth.reviewerId, { actor: auth.actor });
    }
  } catch (error) {
    errorMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load the persisted reviewer profile here."
      : "Could not load reviewer profile. Please try again later.";
  }

  if (!reviewer && !notSignedIn && !errorMessage) {
    errorMessage = "The linked reviewer profile is unavailable. Please try again after the profile is provisioned.";
  }

  return (
    <PageShell variant="reviewer">
      <div data-testid="reviewer-profile-header">
        <SectionHeading
          h1
          eyebrow="Reviewer dashboard"
          title="Reviewer profile"
          description="Manage your reviewer identity, covered regions, and specialties."
        />
      </div>
      {errorMessage ? (
        <Card className="mt-8 border-[var(--color-border)] shadow-sm bg-white/60">
          <CardContent className="p-0">
            <ErrorState
              variant="table"
              title="Cannot load profile"
              message={errorMessage}
              retryHref="/reviewer/profile"
            />
          </CardContent>
        </Card>
      ) : notSignedIn ? (
        <RequireReviewerAuth signedIn={false} noun="profile" />
      ) : reviewer ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] xl:grid-cols-[0.9fr_1.1fr] mt-6">
          <Card data-testid="profile-identity" className="min-w-0 break-words border-[var(--color-border)] shadow-sm bg-white/60">
            <CardHeader>
              <div className="flex flex-wrap gap-3">
                <StatPill label="Status" value={reviewer.status} />
                <StatPill label="Country" value={reviewer.country} />
                <StatPill label="Rating" value={`${reviewer.rating ?? "Not tracked"}${reviewer.rating ? " / 5" : ""}`} />
              </div>
              <CardTitle className="mt-2 break-words">{reviewer.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-5 shadow-sm">
                <p className="font-medium text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)] mb-2">Bio</p>
                <p className="text-[15px] leading-relaxed text-[var(--color-foreground)]">
                  {reviewer.bio || "Not provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 min-w-0">
            <Card data-testid="capacity-card" className="min-w-0 break-words border-[var(--color-border)] shadow-sm bg-white/60">
              <CardHeader>
                <CardTitle>Capacity and availability</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-[15px]">
                <SummaryRow label="Assignment capacity" value="Not tracked in reviewer profile" />
                <SummaryRow label="Availability" value="Not tracked in reviewer profile" />
                <SummaryRow label="Response promise" value={reviewer.responsePromise || "Not provided"} />
              </CardContent>
            </Card>
            <Card data-testid="coverage-card" className="min-w-0 break-words border-[var(--color-border)] shadow-sm bg-white/60">
              <CardHeader>
                <CardTitle>Coverage</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {reviewer.regions.length ? reviewer.regions.map((region) => (
                  <div key={region} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4 text-[15px] text-[var(--color-foreground)] transition-colors hover:bg-white">
                    {region}
                  </div>
                )) : <p className="text-sm text-[var(--color-muted-foreground)]">No regions recorded.</p>}
              </CardContent>
            </Card>

            <Card data-testid="languages-card" className="min-w-0 break-words border-[var(--color-border)] shadow-sm bg-white/60">
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[15px] text-[var(--color-foreground)]">{reviewer.languages.length ? reviewer.languages.join(", ") : "No languages recorded."}</p>
              </CardContent>
            </Card>
            
            <Card data-testid="specialties-card" className="min-w-0 break-words border-[var(--color-border)] shadow-sm bg-white/60">
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {reviewer.specialties.length ? reviewer.specialties.map((specialty) => (
                  <Badge key={specialty} tone="soft" className="text-sm px-3 py-1">
                    {specialty}
                  </Badge>
                )) : <p className="text-sm text-[var(--color-muted-foreground)]">No specialties recorded.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5 border-b border-[var(--color-border)] pb-4 last:border-b-0 last:pb-0">
      <p className="font-medium text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="text-[15px] leading-relaxed text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}
