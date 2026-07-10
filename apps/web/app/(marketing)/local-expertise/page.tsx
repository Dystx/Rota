import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, SectionHeading } from "@repo/ui";

export const metadata: Metadata = { title: "Local expertise | Rumia", description: "How Portugal specialists review a route.", alternates: { canonical: "/local-expertise" } };

export default function LocalExpertisePage() {
  return <PageShell bare><SectionHeading eyebrow="Local judgment" title="How local review works." description="AI drafts the route. A Portugal specialist checks the choices that need local context." h1 /><div className="grid gap-8 md:grid-cols-3"><article><h2 className="font-display text-2xl">Timing checked</h2><p className="mt-2 text-on-surface-variant">We look for days that are technically possible but tiring in practice.</p></article><article><h2 className="font-display text-2xl">Local context added</h2><p className="mt-2 text-on-surface-variant">We flag seasonal constraints, transport friction, and where a route needs more room.</p></article><article><h2 className="font-display text-2xl">Boundaries clear</h2><p className="mt-2 text-on-surface-variant">Review does not include bookings, guarantees, or on-trip support.</p></article></div><p className="mt-12 text-on-surface-variant">A review request is acknowledged within two business hours and completed within one business day after itinerary unlock.</p><Link className="mt-6 inline-block border-b border-ochre-dark text-ochre-dark" href="/pricing">See local expert polish</Link></PageShell>;
}
