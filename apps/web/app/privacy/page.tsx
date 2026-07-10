import { Metadata } from "next";
import Link from "next/link";
import { PublicRouteLayout } from "../_components/public-route-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | Rumia",
  description: "How Rumia handles your travel data, in plain English.",
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPage() {
  return (
    <PublicRouteLayout>
      <div className="min-h-screen bg-background">
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
              Rumia stores your trip briefs, chat history, and saved
              preferences in Supabase with row-level security. We do not
              sell your travel data. Operators see only the data tied
              to their assignments.
            </p>
            <p>
              For the full policy — including data retention, third-party
              processors, and your GDPR + CCPA rights — see{" "}
              <Link
                href="/account"
                className="font-semibold text-primary underline decoration-ochre-dark decoration-2 underline-offset-2 hover:text-olive-light"
              >
                your account settings
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    </PublicRouteLayout>
  );
}
