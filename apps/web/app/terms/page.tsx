import { Metadata } from "next";
import Link from "next/link";
import { PublicRouteLayout } from "../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "How the Rumia activity guide works and what we promise.",
  alternates: { canonical: "/terms" }
};

export default function TermsPage() {
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
              Rumia is a Portugal-first digital guide to activities worth
              your limited time. Its judged recommendations and saved-day
              plans are information, not bookings, reservations, or a promise
              that an activity will be available. You are responsible for
              checking opening hours, access requirements, travel documents,
              insurance, and local conditions.
            </p>
            <p>
              Optional paid access is described on the{" "}
              <Link
                href="/pricing"
                className="font-semibold text-primary underline decoration-ochre-dark decoration-2 underline-offset-2 hover:text-olive-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                pricing page
              </Link>
              . Any specialist review is limited to the scope shown before
              purchase; it does not include booking or on-trip concierge
              support.
            </p>
          </div>
        </article>
      </div>
    </PublicRouteLayout>
  );
}
