import { Metadata } from "next";
import { ArchiveLayout, TripCard } from "@repo/ui";
import { PUBLIC_DESTINATION_ATLAS, publicDestinationDraftUrl } from "../_components/public-trip-choices";

export const metadata: Metadata = {
  title: "Curated Portugal Regions & Experiences | Portugal Travel Concierge",
  description: "Explore Porto, Lisbon, Douro Valley, and more with our curated Portugal-first place base and expert local guidance.",
  alternates: {
    canonical: "/portugal"
  }
};

export default function PortugalPage() {
  return (
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
          {PUBLIC_DESTINATION_ATLAS.map((region) => (
            <li key={region.slug}>
              <TripCard
                testid={`region-card-${region.slug}`}
                title={region.label}
                caption={region.description}
                href={publicDestinationDraftUrl(region.slug)}
                cta={<span className="text-[13px] font-medium text-olive-light">Preview this route →</span>}
              />
            </li>
          ))}
        </ul>
      </ArchiveLayout>
  );
}
