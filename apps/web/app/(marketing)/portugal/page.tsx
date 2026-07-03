import { Metadata } from "next";
import { ArchiveLayout, TripCard } from "@repo/ui";
import { TopNav } from "../../_components/top-nav";
import { SiteFooter } from "../../_components/site-footer";

export const metadata: Metadata = {
  title: "Curated Portugal Regions & Experiences | Portugal Travel Concierge",
  description: "Explore Porto, Lisbon, Douro Valley, and more with our curated Portugal-first place base and expert local guidance.",
  alternates: {
    canonical: "/portugal"
  }
};

const regions = [
  {
    name: "Porto & The North",
    caption: "Historic cellars, dramatic river valleys, and deeply rooted culinary traditions."
  },
  {
    name: "Douro Valley",
    caption: "Terraced vineyards, premium wine estates, and scenic river navigation."
  },
  {
    name: "Lisbon & Surroundings",
    caption: "Seven hills of culture, vibrant neighborhoods, and coastal escapes."
  },
  {
    name: "Sintra",
    caption: "Palaces, misty microclimates, and romantic 19th-century architecture."
  },
  {
    name: "Cascais",
    caption: "Refined coastal living, dramatic cliffs, and ocean-front dining."
  },
  {
    name: "Alentejo",
    caption: "Vast plains, cork forests, dark skies, and slow-paced living."
  },
  {
    name: "Algarve",
    caption: "Golden cliffs, hidden coves, and world-class coastal hiking."
  },
  {
    name: "Coimbra",
    caption: "Ancient university heritage, fado music, and deep history."
  },
  {
    name: "Aveiro",
    caption: "Canals, colorful moliceiro boats, and art nouveau architecture."
  }
];

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-");
}

export default function PortugalPage() {
  return (
    <>
      <TopNav />
      <ArchiveLayout
        bare
        testid="portugal-header"
        header={{
          eyebrow: "Our Focus",
          title: "Deeply local Portugal knowledge",
          description: "Tell us what you want to experience, and we'll craft an itinerary that brings the best of these regions to life."
        }}
      >
        <div data-testid="region-grid" className="contents">
          {regions.map((region) => (
            <TripCard
              key={region.name}
              testid={`region-card-${slugify(region.name)}`}
              title={region.name}
              caption={region.caption}
              href="/planner"
              cta={<span className="text-[13px] font-medium text-ochre-dark">Start your prompt →</span>}
            />
          ))}
        </div>
      </ArchiveLayout>
      <SiteFooter />
    </>
  );
}
