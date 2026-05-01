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
      <SectionHeading
        eyebrow="Admin CMS"
        title="Partner listings shell"
        description="Prepared for affiliate sources, booking links, and partner quality controls without turning Rota into a marketplace first."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Partner posture</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="rota-muted text-sm">Partnerships should support the itinerary, not overwhelm the planning flow.</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Affiliate-ready",
                "Local quality checked",
                "Portugal-first",
                "Not user-visible by default"
              ].map((item) => (
                <Badge key={item} tone="soft">{item}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Link policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rota-muted text-sm">Only surface partner links that strengthen route quality, trust, or booking completion.</p>
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
          <CardTitle>Partner table</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={["Partner", "Type", "Coverage", "Status", "Notes"]}
            rows={rows}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
