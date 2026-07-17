import { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Rumia handles your travel data, in plain English.",
  alternates: { canonical: "/privacy" }
};

const SECTIONS: readonly LegalSection[] = [
  {
    id: "what-we-keep",
    heading: "What we keep",
    content: (
      <p>
        Rumia stores the activity days you save, your trip brief, and account
        details in private PostgreSQL infrastructure. We do not sell your
        travel data. Access is limited to the account and review work needed
        to provide the Rumia service.
      </p>
    )
  },
  {
    id: "your-choices",
    heading: "Your choices",
    content: (
      <p>
        For questions about retention, processors, or your GDPR and CCPA
        rights, use our{" "}
        <Link
          href="/support"
          className="font-semibold text-primary underline decoration-ochre-dark decoration-2 underline-offset-2 hover:text-olive-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          support page
        </Link>
        .
      </p>
    )
  }
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Legal / privacy"
      title="Privacy Policy"
      updated="Last updated 2026"
      intro="A plain-language account of the travel information Rumia keeps and the boundaries around it."
      asideTitle="Your saved days stay yours."
      asideText="Rumia is built around private, considered travel planning rather than a public social profile."
      asideHref="/support"
      asideLinkLabel="Ask about your data"
      sections={SECTIONS}
    />
  );
}
