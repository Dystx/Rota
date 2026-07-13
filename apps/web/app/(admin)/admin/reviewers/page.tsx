import { isPersistenceConfigError, listReviewers } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, PageShell, SectionHeading, StatPill } from "@repo/ui";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

export default async function AdminReviewersPage() {
  const auth = await getAdminPageAuthContext();
  let reviewers = [] as Awaited<ReturnType<typeof listReviewers>>;
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      reviewers = await listReviewers(100, { actor: auth.actor });
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted reviewers here."
      : "Could not load admin reviewers.";
  }

  const rows =
    reviewers.length > 0
      ? reviewers.map((reviewer) => [
          reviewer.name,
          reviewer.regions.join(" / ") || "Pending",
          reviewer.languages.join(" / ") || "Pending",
          reviewer.specialties.join(", ") || "Pending",
          reviewer.status
        ])
      : [
          ["Inês Almeida", "Porto / Douro", "PT / EN / ES", "Food + pacing", "Active"],
          ["Tomás Costa", "Lisbon coast", "PT / EN", "Family-friendly", "Active"],
          ["Beatriz Silva", "Algarve", "PT / EN", "Coastal itineraries", "Onboarding"]
        ];

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
            <StatPill label="Languages" value="PT / EN / ES" />
            <StatPill label="Gap" value="South coast" />
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

      {infoMessage ? (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}

      <div data-testid="reviewers-table" className="min-w-0 max-w-full">
        <Card className="rota-glass-panel border-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Reviewer roster</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <DataTable
              columns={["Reviewer", "Regions", "Languages", "Specialty", "Status"]}
              rows={rows}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
