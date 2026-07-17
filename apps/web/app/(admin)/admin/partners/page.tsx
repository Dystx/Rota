import { isPersistenceConfigError, listPartners } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState, ErrorState, PageShell, SectionHeading } from "@repo/ui";
import { getAdminPageAuthContext, isAdminPageAuthContext } from "@/lib/auth/admin";

export default async function AdminPartnersPage() {
  const auth = await getAdminPageAuthContext();
  let partners = [] as Awaited<ReturnType<typeof listPartners>>;
  let infoMessage = "";

  try {
    if (isAdminPageAuthContext(auth)) {
      partners = await listPartners(100, { actor: auth.actor });
    } else {
      infoMessage = auth.reason === "unavailable"
        ? "Partner records are temporarily unavailable."
        : "You do not have access to partner records.";
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted partners here."
      : "Could not load partner records.";
  }

  const rows = partners.map((partner) => [
    partner.name,
    partner.type || "Not tracked",
    partner.coverageRegions.join(", ") || "Not tracked",
    partner.status,
    partner.notes || "Not tracked"
  ]);

  return (
    <PageShell variant="admin">
      <div data-testid="admin-partners-header" className="mb-12">
        <SectionHeading
          eyebrow="Admin Directory"
          title="Curated Partners"
          description="Prepared for affiliate sources, booking links, and partner quality controls without turning rumia.pt into a marketplace."
          h1
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card className="rota-glass-panel border-none shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-medium tracking-tight">Curation Posture</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 grid gap-5">
            <p className="text-[var(--color-muted-foreground)] leading-relaxed text-sm">
              Partnerships must elevate the itinerary experience, rather than overwhelm the user's planning flow. Quality and trust remain paramount.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {[
                "Affiliate-ready",
                "Local quality checked",
                "Portugal-first",
                "Not user-visible by default"
              ].map((item) => (
                <Badge key={item} tone="soft" className="bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)] px-3 py-1 font-medium">{item}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="rota-glass-panel border-none shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-medium tracking-tight">Link Policy</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex flex-col justify-center">
            <div className="p-4 rounded-xl bg-[rgba(48,101,118,0.04)] border border-[rgba(48,101,118,0.1)]">
              <p className="text-[var(--color-secondary)] font-medium text-sm leading-relaxed">
                Only surface partner links that demonstrably strengthen route quality, enhance trust, or streamline booking completion.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div data-testid="partners-table" className="w-full max-w-full min-w-0">
        <Card className="rota-glass-panel border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-[var(--color-surface-muted)]/30">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="rota-dot"></span> Active Roster
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 p-0">
            {infoMessage ? (
              <ErrorState variant="table" title="Partners unavailable" message={infoMessage} retryHref="/admin/partners" />
            ) : rows.length === 0 ? (
              <EmptyState variant="table" title="No partner records" description="No persisted partner records are available yet." />
            ) : (
              <div className="overflow-x-auto">
                <DataTable
                  columns={["Partner", "Type", "Coverage", "Status", "Notes"]}
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
