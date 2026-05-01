import { isPersistenceConfigError, listPartners } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, PageShell, SectionHeading } from "@repo/ui";

export default async function AdminPartnersPage() {
  let partners = [] as Awaited<ReturnType<typeof listPartners>>;
  let infoMessage = "";

  try {
    partners = await listPartners();
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load persisted partners here."
      : error instanceof Error
        ? error.message
        : "Could not load partner records.";
  }

  const rows =
    partners.length > 0
      ? partners.map((partner) => [
          partner.name,
          partner.type || "Pending",
          partner.coverageRegions.join(", ") || "Pending",
          partner.status,
          partner.notes || "Pending"
        ])
      : [
          ["Quinta stays", "Lodging", "Douro", "Draft", "Useful for wine-country overnights"],
          ["Rail booking source", "Transport", "Portugal", "Research", "Could improve no-car planning"],
          ["Food tour affiliate", "Experience", "Porto", "Candidate", "Needs local quality review"]
        ];

  return (
    <PageShell variant="admin">
      <div data-testid="admin-partners-header" className="mb-12">
        <SectionHeading
          eyebrow="Admin Directory"
          title="Curated Partners"
          description="Prepared for affiliate sources, booking links, and partner quality controls without turning rumia.pt into a marketplace."
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

      {infoMessage ? (
        <Card className="mb-8 border-[rgba(180,35,24,0.15)] bg-[rgba(180,35,24,0.03)] shadow-none">
          <CardContent className="pt-6">
            <p className="text-[#b42318] text-sm font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#b42318] inline-block"></span>
              {infoMessage}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div data-testid="partners-table" className="w-full max-w-full min-w-0">
        <Card className="rota-glass-panel border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-[var(--color-surface-muted)]/30">
            <CardTitle className="text-lg font-medium tracking-tight flex items-center gap-2">
              <span className="rota-dot"></span> Active Roster
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <DataTable
              columns={["Partner", "Type", "Coverage", "Status", "Notes"]}
              rows={rows}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
