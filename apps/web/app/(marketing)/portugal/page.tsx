import { ArchiveLayout, TripCard } from "@repo/ui";

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

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-");
}

export default function PortugalPage() {
  return (
    <ArchiveLayout
      testid="portugal-header"
      header={{
        eyebrow: "Portugal launch market",
        title: "Start narrow, then expand country by country",
        description: "The roadmap calls for a curated Portugal-first place base with region logic, local notes, and quality controls."
      }}
    >
      <div data-testid="region-grid" className="contents">
        {regions.map((region) => (
          <TripCard
            key={region}
            testid={`region-card-${slugify(region)}`}
            title={region}
            caption="Seed region for routes, places, seasonal judgment, and local review standards."
          />
        ))}
      </div>
    </ArchiveLayout>
  );
}
