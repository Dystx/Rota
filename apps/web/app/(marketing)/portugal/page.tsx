import { Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading } from "@repo/ui";

const regions = [
  "Porto",
  "Douro Valley",
  "Lisbon",
  "Sintra",
  "Cascais",
  "Alentejo",
  "Algarve",
  "Coimbra",
  "Aveiro"
];

export default function PortugalPage() {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="Portugal launch market"
        title="Start narrow, then expand country by country"
        description="The roadmap calls for a curated Portugal-first place base with region logic, local notes, and quality controls."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {regions.map((region) => (
          <Card key={region}>
            <CardHeader>
              <CardTitle>{region}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="rota-muted">
                Seed region for routes, places, seasonal judgment, and local
                review standards.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
