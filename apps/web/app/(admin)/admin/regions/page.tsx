import { isPersistenceConfigError, listRegions } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, PageShell, SectionHeading, StatPill } from "@repo/ui";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

export default async function AdminRegionsPage() {
  const auth = await getAdminPageAuthContext();
  let regions = [] as Awaited<ReturnType<typeof listRegions>>;
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      regions = await listRegions(100, { client: auth.client });
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load persisted regions here."
      : error instanceof Error
        ? error.message
        : "Could not load admin regions.";
  }

  const rows =
    regions.length > 0
      ? regions.map((region) => [
          region.name,
          region.countrySlug,
          region.bestFor.join(", ") || "Pending",
          region.seasonality || "Pending",
          region.launchStatus
        ])
      : [
          ["Porto", "Portugal", "Old streets + food", "Year-round", "Active"],
          ["Douro Valley", "Portugal", "Scenic wine days", "Spring / autumn", "Active"],
          ["Algarve", "Portugal", "Coastal stays", "Summer-heavy", "Planned"],
          ["North coast", "Portugal", "Calmer road trips", "Spring", "Research"]
        ];

  return (
    <PageShell variant="admin">
      <div id="admin-regions-header" className="admin-regions-header" data-testid="admin-regions-header">
        <SectionHeading
          eyebrow="Admin CMS"
          title="Regional curation"
          description="Tracks local summaries, launch regions, best-fit tags, and seasonality notes for country-by-country rollout."
          h1
        />
      </div>
      <div id="regions-summary" className="regions-summary grid gap-4 lg:grid-cols-3" data-testid="regions-summary">
        <Card>
          <CardHeader>
            <CardTitle>Active launch shape</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatPill label="Country" value="Portugal" />
            <StatPill label="Active regions" value={String(rows.filter((row) => row[4] === "Active").length)} />
            <StatPill label="Pilot next" value="Spain" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current rules</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[
              "Meal-time defaults",
              "Rain-safe notes",
              "Transport assumptions",
              "Local quality rules"
            ].map((item) => (
              <Badge key={item} tone="soft">{item}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next rollout concern</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rota-muted text-sm">Keep region descriptions tightly tied to local character so country expansion stays curated instead of generic.</p>
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
      <div id="regions-table" className="regions-table min-w-0 max-w-full" data-testid="regions-table">
        <Card className="min-w-0 max-w-full">
          <CardHeader>
            <CardTitle>Region controls</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto overflow-y-hidden">
            <DataTable
              columns={["Region", "Country", "Best for", "Seasonality", "Launch status"]}
              rows={rows}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
