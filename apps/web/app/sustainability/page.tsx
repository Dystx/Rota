import { Metadata } from "next";
import { TopNav } from "../_components/top-nav";

export const metadata: Metadata = {
  title: "Sustainability | Rumia",
  description: "How Rumia thinks about sustainable travel in Portugal.",
  alternates: { canonical: "/sustainability" }
};

export default function SustainabilityPage() {
  return (
    <>
      <TopNav />
      <main
        id="main-content"
        className="pt-header-height min-h-screen bg-background"
      >
        <article className="max-w-3xl mx-auto px-container-padding-sm md:px-container-padding-lg py-section-gap">
          <header className="mb-8">
            <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-2">
              Our Promise
            </p>
            <h1 className="font-display text-headline-lg text-primary leading-tight">
              Sustainability
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              How Rumia thinks about place, people, and pace.
            </p>
          </header>
          <div className="space-y-4 font-body-md text-body-md text-on-surface">
            <p>
              We favor small, family-run accommodations and locally
              guided experiences. Our itinerary generator penalizes
              long-haul inter-city transfers when a train or a slower
              drive is available.
            </p>
            <p>
              Carbon estimates for each itinerary land in the trip
              workspace; future versions will surface them in the
              wizard.
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
