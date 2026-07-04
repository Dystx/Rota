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
    caption: "Historic cellars, dramatic river valleys, and deeply rooted culinary traditions.",
    cover: "/trip-covers/porto-ribeira.svg",
    coverAlt: "Porto Ribeira at golden hour"
  },
  {
    name: "Douro Valley",
    caption: "Terraced vineyards, premium wine estates, and scenic river navigation.",
    cover: "/trip-covers/douro-vineyards.svg",
    coverAlt: "Douro Valley vineyards in autumn"
  },
  {
    name: "Lisbon & Surroundings",
    caption: "Seven hills of culture, vibrant neighborhoods, and coastal escapes.",
    cover: "/trip-covers/lisbon-tagus.svg",
    coverAlt: "Lisbon and the Tagus River at sunset"
  },
  {
    name: "Sintra",
    caption: "Palaces, misty microclimates, and romantic 19th-century architecture.",
    cover: "/trip-covers/sintra-palace.svg",
    coverAlt: "Sintra palace in morning mist"
  },
  {
    name: "Cascais",
    caption: "Refined coastal living, dramatic cliffs, and ocean-front dining.",
    cover: "/trip-covers/cascais-coast.svg",
    coverAlt: "Cascais Atlantic cliffs"
  },
  {
    name: "Alentejo",
    caption: "Vast plains, cork forests, dark skies, and slow-paced living.",
    cover: "/trip-covers/alentejo-plains.svg",
    coverAlt: "Alentejo plains with cork oaks"
  },
  {
    name: "Algarve",
    caption: "Golden cliffs, hidden coves, and world-class coastal hiking.",
    cover: "/trip-covers/algarve-coast.svg",
    coverAlt: "Algarve golden cliffs"
  },
  {
    name: "Coimbra",
    caption: "Ancient university heritage, fado music, and deep history.",
    cover: "/trip-covers/coimbra-uni.svg",
    coverAlt: "Coimbra University at golden hour"
  },
  {
    name: "Aveiro",
    caption: "Canals, colorful moliceiro boats, and art nouveau architecture.",
    cover: "/trip-covers/aveiro-canals.svg",
    coverAlt: "Aveiro art nouveau canal with moliceiro boat"
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
        <ul role="list" data-testid="region-grid" className="contents list-none p-0 m-0">
          {regions.map((region) => (
            <li key={region.name}>
              <TripCard
                testid={`region-card-${slugify(region.name)}`}
                title={region.name}
                caption={region.caption}
                href="/planner"
                coverImage={region.cover}
                coverAlt={region.coverAlt}
                cta={<span className="text-[13px] font-medium text-olive-light">Start your prompt →</span>}
              />
            </li>
          ))}
        </ul>
      </ArchiveLayout>
      <SiteFooter />
    </>
  );
}
