import { PageShell, SectionHeading } from "@repo/ui";
import { PlaceEditor } from "./place-editor";

export default function AdminPlacesPage() {
  return (
    <PageShell variant="admin">
      <div data-testid="admin-places-header">
        <SectionHeading
          eyebrow="Admin CMS"
          title="Places database shell"
          description="Prepared for curation, quality scoring, source confidence, and Portugal-first place management."
        />
      </div>
      <div className="mt-8">
        <PlaceEditor />
      </div>
    </PageShell>
  );
}
