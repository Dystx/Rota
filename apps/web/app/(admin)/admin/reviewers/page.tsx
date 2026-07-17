import { isPersistenceConfigError, listReviewers } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState, ErrorState, PageShell, SectionHeading, StatPill } from "@repo/ui";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

export default async function AdminReviewersPage() {
  const auth = await getAdminPageAuthContext();
  let reviewers = [] as Awaited<ReturnType<typeof listReviewers>>;
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      reviewers = await listReviewers(100, { actor: auth.actor });
    } else {
      infoMessage = auth.reason === "unavailable"
        ? "Reviewer records are temporarily unavailable."
        : "You do not have access to reviewer records.";
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted reviewers here."
      : "Could not load admin reviewers.";
  }

  const rows = reviewers.map((reviewer) => [
    reviewer.name,
    reviewer.regions.join(" / ") || "Not tracked",
    reviewer.languages.join(" / ") || "Not tracked",
    reviewer.specialties.join(", ") || "Not tracked",
    reviewer.status
  ]);
  const languageCount = new Set(reviewers.flatMap((reviewer) => reviewer.languages)).size;

  return (
    <PageShell variant="admin">
      <div data-testid="admin-reviewers-header">
        <SectionHeading
          eyebrow="Admin CMS"
          title="Reviewer roster"
          description="Region fit, language coverage, specialties, and assignment readiness."
          h1
        />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="rota-glass-panel border-0">
          <CardHeader>
            <CardTitle>Reviewer coverage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <StatPill label="Active" value={`${rows.filter((row) => row[4] === "Active").length} reviewers`} />
            <StatPill label="Languages" value={`${languageCount} tracked`} />
            <StatPill label="Coverage gap" value="Not tracked" />
          </CardContent>
        </Card>
        
        <Card className="rota-glass-panel border-0">
          <CardHeader>
            <CardTitle>Assignment tags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {[
              "Food-first",
              "Family pacing",
              "Rain fallback",
              "Road-trip specialist"
            ].map((item) => (
              <Badge key={item} tone="soft">{item}</Badge>
            ))}
          </CardContent>
        </Card>
        
        <Card className="rota-glass-panel border-0 bg-[var(--color-surface)]">
          <CardHeader>
            <CardTitle>Review quality goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed">
              Keep visible trust markers credible by matching rumia.pt reviewers to region, language, and route style.
            </p>
          </CardContent>
        </Card>
      </div>

      <div data-testid="reviewers-table" className="min-w-0 max-w-full">
        <Card className="rota-glass-panel border-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Reviewer roster</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {infoMessage ? (
              <ErrorState variant="table" title="Reviewers unavailable" message={infoMessage} retryHref="/admin/reviewers" />
            ) : rows.length === 0 ? (
              <EmptyState variant="table" title="No reviewer records" description="No persisted reviewer profiles are available yet." />
            ) : (
              <div className="overflow-x-auto">
                <DataTable
                  columns={["Reviewer", "Regions", "Languages", "Specialty", "Status"]}
                  rows={rows}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
