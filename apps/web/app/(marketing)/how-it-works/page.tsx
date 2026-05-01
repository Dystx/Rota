import { Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading } from "@repo/ui";

const flow = [
  "User writes a trip brief.",
  "Rota normalizes the brief and detects missing information.",
  "Structured question cards appear only when needed.",
  "A route is generated, explained, validated, and optionally sent for human review.",
  "Background worker jobs prepare exports, reviewer assignment, and route refresh tasks."
];

export default function HowItWorksPage() {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="Interaction model"
        title="A planning system with a clear sequence"
        description="The UI shell mirrors the roadmap's no-chat flow so later backend work has obvious homes."
      />
      <div className="grid gap-4 lg:grid-cols-5">
        {flow.map((step, index) => (
          <Card key={step}>
            <CardHeader>
              <CardTitle>{`0${index + 1}`}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="rota-muted">{step}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
