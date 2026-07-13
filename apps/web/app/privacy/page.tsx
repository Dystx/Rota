import { Metadata } from "next";
import Link from "next/link";
import { PublicRouteLayout } from "../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Rumia handles your travel data, in plain English.",
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Last updated 2026.
            </p>
          </header>
          <div className="space-y-4 font-body-md text-body-md text-on-surface">
            <p>
              Rumia stores the activity days you save, your trip brief, and
              account details in private PostgreSQL infrastructure. We do not
              sell your travel data. Access is limited to the account and
              review work needed to provide the Rumia service.
            </p>
            <p>
              For questions about retention, processors, or your GDPR and
              CCPA rights, use our{" "}
              <Link
                href="/support"
                className="font-semibold text-primary underline decoration-ochre-dark decoration-2 underline-offset-2 hover:text-olive-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                support page
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    </PublicRouteLayout>
  );
}
