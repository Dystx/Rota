import { Metadata } from "next";
import { PublicRouteLayout } from "../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Sustainability",
  description: "How Rumia thinks about sustainable travel in Portugal.",
  alternates: { canonical: "/sustainability" }
};

export default function SustainabilityPage() {
  return (
    <PublicRouteLayout>
      <div
        className="min-h-screen rumia-surface rumia-surface-linen"
        data-surface="linen"
        data-surface-texture="editorial"
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
              Rumia can surface locally grounded activities and calmer ways
              to spend time in Portugal. We prefer context that helps people
              make thoughtful choices rather than encouraging a checklist of
              stops.
            </p>
            <p>
              We do not claim that a recommendation is automatically
              sustainable. Conditions, operators, transport, and local impact
              change; travellers should check current information and choose
              the pace and route that fit their circumstances.
            </p>
          </div>
        </article>
      </div>
    </PublicRouteLayout>
  );
}
