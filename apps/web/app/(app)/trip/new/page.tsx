import { Metadata } from "next";
import { Card, CardContent, CardHeader, StatPill } from "@repo/ui";
import { TopNav } from "../../../_components/top-nav";
import { SiteFooter } from "../../../_components/site-footer";
import { TripBriefFormBoundary } from "./trip-brief-form";

export const metadata: Metadata = {
  title: "Trip Details Confirmation",
  description: "Review or manually enter the structured details of your Portugal trip before we craft your itinerary.",
  alternates: {
    canonical: "/trip/new"
  }
};

export default function NewTripPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main id="main-content" className="flex-1 pt-header-height">
      <section className="relative w-full flex flex-col justify-center items-center overflow-hidden pt-12 pb-12 mb-12">
        <div className="absolute inset-0 w-full h-full -z-10">
          <div
            className="w-full h-full bg-cover bg-center filter brightness-[0.85] contrast-110 saturate-110"
            style={{
              backgroundImage:
                "url('/hero/portugal-coast-golden-hour.svg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 w-full max-w-3xl text-center flex flex-col items-center gap-6">
          <StatPill label="Advanced details" value="Manual confirmation" />
          <h1 className="font-display text-display-mobile md:text-display text-foreground drop-shadow-2xl">
            Confirm your brief
          </h1>
          <p className="text-on-surface-variant leading-loose text-xl max-w-2xl mx-auto">
            Review and manually adjust the specifics of your trip. We use these structured details to craft a paced, realistic Portugal itinerary.
          </p>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
        <TripBriefFormBoundary />

        <div className="grid gap-6 sticky top-32">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <h3 className="font-display text-2xl">Why we ask</h3>
            </CardHeader>
            <CardContent className="px-0 grid gap-8">
              <div>
                <p className="font-medium text-[var(--color-foreground)] mb-2">Pacing & Reality</p>
                <p className="text-on-surface-variant leading-loose text-sm">
                  Many travelers pack too much into a single day. By understanding your pace and transport preferences, we ensure you spend more time experiencing Portugal and less time in transit.
                </p>
              </div>

              <div>
                <p className="font-medium text-[var(--color-foreground)] mb-2">Local Nuance</p>
                <p className="text-on-surface-variant leading-loose text-sm">
                  We don't just match generic tags. We cross-reference your interests against regional realities—knowing which coastal towns have the best winter seafood or where to avoid summer crowds.
                </p>
              </div>

              <div>
                <p className="font-medium text-[var(--color-foreground)] mb-2">The Concierge Audit</p>
                <p className="text-on-surface-variant leading-loose text-sm">
                  Once submitted, your brief is audited by our routing engine. We look for logistical friction (like trying to see the Douro Valley as a half-day trip from Lisbon) and offer a polished, workable draft.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
