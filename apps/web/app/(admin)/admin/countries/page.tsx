import { isPersistenceConfigError, listRegions } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState, ErrorState, PageShell, SectionHeading } from "@repo/ui";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

function titleCase(value: string) {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AdminCountriesPage() {
  const auth = await getAdminPageAuthContext();
  let regions = [] as Awaited<ReturnType<typeof listRegions>>;
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      regions = await listRegions(100, { actor: auth.actor });
    } else {
      infoMessage = auth.reason === "unavailable"
        ? "Country rollout data is temporarily unavailable."
        : "You do not have access to country rollout data.";
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted country rollout signals here."
      : "Could not load country rollout data yet.";
  }

  const countries = Array.from(
    regions.reduce<Map<string, { active: number; languages: string; name: string; status: string }>>((map, region) => {
      const key = region.countrySlug;
      const existing = map.get(key);
      const active = (existing?.active ?? 0) + (region.launchStatus === "Active" ? 1 : 0);
      const statuses = [existing?.status, region.launchStatus].filter(Boolean);
      const status = statuses.includes("Active") ? "Active" : statuses.includes("Planned") ? "Planned" : "Research";

      map.set(key, {
        active,
        languages: "Not tracked",
        name: titleCase(key),
        status
      });

      return map;
    }, new Map()).values()
  );

  const rawRows = countries.map((country) => [country.name, country.status, "Not tracked", country.languages]);

  const rows = rawRows.map((row, idx) => [
    <div key={`col0-${idx}`} className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] font-medium text-[var(--color-foreground)]">
        {String(row[0]).charAt(0)}
      </div>
      <span className="font-medium tracking-tight text-[var(--color-foreground)]">{row[0]}</span>
    </div>,
    <Badge key={`col1-${idx}`} tone={row[1] === "Active" ? "default" : "soft"}>
      {row[1] as string}
    </Badge>,
    <span key={`col2-${idx}`} className="font-mono text-sm tracking-wider text-[var(--color-muted-foreground)]">
      {row[2]}
    </span>,
    <span key={`col3-${idx}`} className="text-[var(--color-muted-foreground)]">
      {row[3]}
    </span>
  ]);

  return (
    <PageShell variant="admin">
      <div className="mx-auto max-w-5xl min-w-0 space-y-16">
        <div data-testid="admin-countries-header" className="relative">
          <div className="absolute -left-12 -top-12 -z-10 h-64 w-64 rounded-full bg-[var(--color-accent)]/20 blur-[100px]" />
          <SectionHeading
            eyebrow="System Configuration"
            title="Geographic Rollout"
            description="Manage operational regions, feature flags, and localization settings for rumia.pt deployments."
            h1
            className="border-b border-[var(--color-border)] pb-8"
          />
        </div>

        <div className="grid min-w-0 gap-8">
          {infoMessage ? (
            <Card className="border-amber-500/20 bg-amber-50/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-amber-900">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                    <span className="text-sm font-bold text-amber-700">!</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{infoMessage}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div data-testid="countries-table" className="group relative min-w-0">
            <div className="absolute -inset-2 -z-10 rounded-[32px] bg-gradient-to-b from-[var(--color-surface-muted)] to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <Card className="min-w-0 overflow-hidden border-0 shadow-[0_8px_40px_rgba(24,28,28,0.06)] ring-1 ring-[var(--color-border)]/50">
              <CardHeader className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="font-display text-2xl tracking-tight text-[var(--color-foreground)]">
                      Active Territories
                    </CardTitle>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                      Overview of currently supported markets and their operational status.
                    </p>
                  </div>
                  <Badge tone="default" className="self-start sm:self-auto">{rawRows.length} Markets</Badge>
                </div>
              </CardHeader>
              {infoMessage ? (
                <ErrorState variant="table" title="Country rollout unavailable" message={infoMessage} retryHref="/admin/countries" />
              ) : rawRows.length === 0 ? (
                <EmptyState
                  variant="table"
                  title="No country rollout records"
                  description="No persisted region records are available to derive country rollout status yet."
                />
              ) : (
                <div className="overflow-x-auto p-0 sm:p-2 sm:pb-0">
                  <div className="min-w-[600px] sm:min-w-0">
                    <DataTable columns={["Territory", "Deployment Status", "Currency", "Locales"]} rows={rows} />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
