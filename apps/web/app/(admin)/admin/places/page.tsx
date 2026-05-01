import { Card, CardContent, PageShell, SectionHeading } from "@repo/ui";
import { PlaceEditor } from "./place-editor";

export default function AdminPlacesPage() {
  return (
    <PageShell variant="admin">
      <SectionHeading
        eyebrow="Admin CMS"
        title="Places database shell"
        description="Prepared for curation, quality scoring, source confidence, and Portugal-first place management."
      />
      <Card className="mt-8 overflow-hidden border-black/5 bg-white/60 shadow-sm">
        <CardContent className="px-8 py-8">
          <PlaceEditor />
        </CardContent>
      </Card>
    </PageShell>
  );
}
