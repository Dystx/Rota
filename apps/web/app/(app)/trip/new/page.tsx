import { PageShell, Card, CardContent, CardHeader, StatPill } from "@repo/ui";
import { TripBriefForm } from "./trip-brief-form";

export default function NewTripPage() {
  return (
    <PageShell variant="app">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <StatPill label="Local concierge" value="Lisbon & Porto" />
        <h1 className="rota-display mt-6 mb-4">Polish your plan</h1>
        <p className="rota-muted text-xl max-w-2xl mx-auto">
          Tell us how you like to travel. We’ll audit your preferences, align them with local realities, and craft a paced, realistic Portugal itinerary.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
        <TripBriefForm />

        <div className="grid gap-6 sticky top-32">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <h3 className="font-[family-name:var(--font-rota-display)] text-2xl">Why we ask</h3>
            </CardHeader>
            <CardContent className="px-0 grid gap-8">
              <div>
                <p className="font-medium text-[var(--color-foreground)] mb-2">Pacing & Reality</p>
                <p className="rota-muted text-sm">
                  Many travelers pack too much into a single day. By understanding your pace and transport preferences, we ensure you spend more time experiencing Portugal and less time in transit.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-[var(--color-foreground)] mb-2">Local Nuance</p>
                <p className="rota-muted text-sm">
                  We don't just match generic tags. We cross-reference your interests against regional realities—knowing which coastal towns have the best winter seafood or where to avoid summer crowds.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-[var(--color-foreground)] mb-2">The Concierge Audit</p>
                <p className="rota-muted text-sm">
                  Once submitted, your brief is audited by our routing engine. We look for logistical friction (like trying to see the Douro Valley as a half-day trip from Lisbon) and offer a polished, workable draft.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
