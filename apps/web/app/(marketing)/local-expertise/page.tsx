import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, SectionHeading } from "@repo/ui";

export const metadata: Metadata = {
  title: "Local expertise | Rumia",
  description: "See how Portugal specialists turn an AI route into a realistic trip.",
  alternates: { canonical: "/local-expertise" }
};

export default function LocalExpertisePage() {
  return (
    <PageShell bare>
      <SectionHeading
        eyebrow="Local judgment"
        title="A route is only useful if it works on the ground."
        description="Rumia specialists check timing, transport, seasonality, and the small decisions that change how a Portugal trip feels."
        h1
      />
      <Link className="inline-flex text-sm font-medium underline underline-offset-4" href="/human-review">
        See how a human review works
      </Link>
    </PageShell>
  );
}
