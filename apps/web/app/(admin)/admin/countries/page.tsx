import { isPersistenceConfigError, listRegions } from "@repo/db";
import { Card, CardContent, CardHeader, CardTitle, DataTable, PageShell, SectionHeading } from "@repo/ui";

function titleCase(value: string) {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AdminCountriesPage() {
  let regions = [] as Awaited<ReturnType<typeof listRegions>>;
  let infoMessage = "";

  try {
    regions = await listRegions();
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load persisted country rollout signals here."
      : error instanceof Error
        ? error.message
        : "Could not load country rollout data yet.";
  }

  const countries = Array.from(
    regions.reduce<Map<string, { active: number; languages: string; name: string; status: string }>>((map, region) => {
      const key = region.countrySlug;
      const existing = map.get(key);
      const active = (existing?.active ?? 0) + (region.launchStatus === "Active" ? 1 : 0);
      const statuses = [existing?.status, region.launchStatus].filter(Boolean);
      const status = statuses.includes("Active") ? "Active MVP" : statuses.includes("Planned") ? "Planned" : "Research";

      map.set(key, {
        active,
        languages: key === "portugal" ? "EN / PT" : "Pending",
        name: titleCase(key),
        status
      });

      return map;
    }, new Map()).values()
  );

  const rows =
    countries.length > 0
      ? countries.map((country) => [country.name, country.status, country.name === "Portugal" ? "EUR" : "Pending", country.languages])
      : [
          ["Portugal", "Active MVP", "EUR", "EN / PT"],
          ["Spain", "Pilot later", "EUR", "EN / ES"],
          ["Italy", "Planned", "EUR", "EN / IT"]
        ];

  return (
    <PageShell variant="admin">
      <SectionHeading
        eyebrow="Country configuration"
        title="Launch-country controls shell"
        description="Holds transport assumptions, seasonality rules, prompt packs, and reviewer requirements."
      />
      <Card>
        <CardHeader>
          <CardTitle>Country rollout</CardTitle>
        </CardHeader>
        <CardContent>
          {infoMessage ? <p className="rota-muted mb-4 text-sm">{infoMessage}</p> : null}
          <DataTable
            columns={["Country", "Status", "Default currency", "Languages"]}
            rows={rows}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
