import { isPersistenceConfigError, listReviewers } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, PageShell, SectionHeading, StatPill } from "@repo/ui";

export default async function AdminReviewersPage() {
  let reviewers = [] as Awaited<ReturnType<typeof listReviewers>>;
  let infoMessage = "";

  try {
    reviewers = await listReviewers();
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load persisted reviewers here."
      : error instanceof Error
        ? error.message
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
      <SectionHeading
        eyebrow="Admin CMS"
        title="Reviewer management shell"
        description="Matches the roadmap's reviewer-management layer: region fit, language coverage, specialties, and assignment readiness."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Reviewer coverage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatPill label="Active" value={`${rows.filter((row) => row[4] === "Active").length} reviewers`} />
            <StatPill label="Languages" value="PT / EN / ES" />
            <StatPill label="Gap" value="South coast" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignment tags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle>Review quality goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rota-muted text-sm">Keep visible trust markers credible by matching reviewers to region, language, and route style.</p>
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
          <CardTitle>Reviewer roster</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={["Reviewer", "Regions", "Languages", "Specialty", "Status"]}
            rows={rows}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
