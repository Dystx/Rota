import Link from "next/link";
import { buildEmailPreview } from "@repo/emails";
import { getCheckoutPlan } from "@repo/payments";
import { Button, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading } from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";

export default function HumanReviewPage() {
  const reviewedTripState = getTripCommerceState({ isPaid: true, hasHumanReview: true });
  const reviewPlan = getCheckoutPlan("human-polish");
  const reviewEmail = buildEmailPreview("review-complete", "Porto & Douro / 5 days");

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Trust layer"
        title="Human review is a premium layer, not the main interface"
        description="The roadmap treats review as a differentiator that edits routes and adds local notes after generation."
      />
      <Card>
        <CardHeader>
          <CardTitle>Visible review markers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {reviewedTripState.markers.map((note) => (
            <div key={note} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="text-sm text-[var(--color-foreground)]">{note}</p>
            </div>
          ))}
          <ul className="rota-stack-list">
            <li>Restaurant changed after human review</li>
            <li>This day was adjusted for better pacing</li>
            <li>Rain plan added by reviewer</li>
          </ul>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="rota-kicker">Human review add-on</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{reviewPlan.priceLabel}</p>
              <p className="rota-muted mt-2 text-sm">{reviewPlan.fulfillment}</p>
            </div>
            <div className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
              <p className="rota-kicker">Delivery email</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">{reviewEmail.subject}</p>
              <p className="rota-muted mt-2 text-sm">{reviewEmail.previewText}</p>
            </div>
          </div>
          <div>
            <Button asChild>
              <Link href="/pricing">See unlock tiers</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
