import { Metadata } from "next";
import Link from "next/link";
import { PublicRouteLayout } from "../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Terms of Service | Rumia",
  description: "How the Rumia concierge platform works and what we promise.",
  alternates: { canonical: "/terms" }
};

export default function TermsPage() {
  return (
    <PublicRouteLayout>
      <div className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-container-padding-sm md:px-container-padding-lg py-section-gap">
          <header className="mb-8">
            <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark mb-2">
              Legal
            </p>
            <h1 className="font-display text-headline-lg text-primary leading-tight">
              Terms of Service
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Last updated 2026.
            </p>
          </header>
          <div className="space-y-4 font-body-md text-body-md text-on-surface">
            <p>
              Rumia provides a Portugal-first AI travel concierge. The
              itineraries we generate are recommendations; you are
              responsible for confirming bookings, visa requirements,
              and travel insurance.
            </p>
            <p>
              Paid tiers (Curation, Concierge) are billed through
              Stripe. Refunds follow the policy in your{" "}
              <Link
                href="/account"
                className="font-semibold text-primary underline decoration-ochre-dark decoration-2 underline-offset-2 hover:text-olive-light"
              >
                account
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    </PublicRouteLayout>
  );
}
