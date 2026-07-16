import { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "How the Rumia activity guide works and what we promise.",
  alternates: { canonical: "/terms" }
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal / service"
      title="Terms of Service"
      updated="Last updated 2026"
      intro="The practical boundaries around Rumia’s curated activity guidance and saved-day plans."
      asideTitle="Guidance, not a reservation."
      asideText="Rumia helps you choose what to do. Opening hours, access, transport, insurance, and local conditions remain your responsibility."
      asideHref="/pricing"
      asideLinkLabel="See paid access"
    >
      <div className="grid gap-5">
        <p>
          Rumia is a Portugal-first digital guide to activities worth your
          limited time. Its judged recommendations and saved-day plans are
          information, not bookings, reservations, or a promise that an
          activity will be available. You are responsible for checking
          opening hours, access requirements, travel documents, insurance,
          and local conditions.
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
          purchase; it does not include booking or on-trip concierge support.
        </p>
      </div>
    </LegalPage>
  );
}
