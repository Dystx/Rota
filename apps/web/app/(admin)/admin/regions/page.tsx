import { isPersistenceConfigError, listRegions } from "@repo/db";
import { Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState, ErrorState, PageShell, SectionHeading, StatPill } from "@repo/ui";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

export default async function AdminRegionsPage() {
  const auth = await getAdminPageAuthContext();
  let regions = [] as Awaited<ReturnType<typeof listRegions>>;
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      regions = await listRegions(100, { actor: auth.actor });
    } else {
      infoMessage = auth.reason === "unavailable"
        ? "Region data is temporarily unavailable."
        : "You do not have access to region data.";
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted regions here."
      : "Could not load admin regions.";
  }

  const rows = regions.map((region) => [
    region.name,
    region.countrySlug,
    region.bestFor.join(", ") || "Not tracked",
    region.seasonality || "Not tracked",
    region.launchStatus
  ]);
  const countryCount = new Set(regions.map((region) => region.countrySlug)).size;

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
            <StatPill label="Countries" value={String(countryCount)} />
            <StatPill label="Active regions" value={String(rows.filter((row) => row[4] === "Active").length)} />
            <StatPill label="Next rollout" value="Not tracked" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current rules</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              Region-specific rules appear here when persisted curation records provide them.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next rollout concern</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-on-surface-variant leading-loose text-sm">Keep region descriptions tightly tied to local character so country expansion stays curated instead of generic.</p>
          </CardContent>
        </Card>
      </div>
      <div id="regions-table" className="regions-table min-w-0 max-w-full" data-testid="regions-table">
        <Card className="min-w-0 max-w-full">
          <CardHeader>
            <CardTitle>Region controls</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {infoMessage ? (
              <ErrorState variant="table" title="Regions unavailable" message={infoMessage} retryHref="/admin/regions" />
            ) : rows.length === 0 ? (
              <EmptyState variant="table" title="No region records" description="No persisted regions are available for curation yet." />
            ) : (
              <div className="overflow-x-auto overflow-y-hidden">
                <DataTable
                  columns={["Region", "Country", "Best for", "Seasonality", "Launch status"]}
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
