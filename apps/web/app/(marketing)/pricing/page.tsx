import Link from "next/link";
import { listCheckoutPlans } from "@repo/payments";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading } from "@repo/ui";

export default function PricingPage() {
  const tiers = listCheckoutPlans();

  return (
    <PageShell>
      <SectionHeading
        eyebrow="Monetization"
        title="One-time trip payments, not a subscription"
        description="The scaffold keeps product surfaces aligned to the roadmap's unlock, export, and review tiers."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <Card key={tier.tier} className={index === 1 ? "border-[var(--color-accent)]" : undefined}>
            <CardHeader>
              {index === 1 ? <Badge>Core MVP tier</Badge> : null}
              <CardTitle>{tier.tier.replace(/-/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ul className="rota-stack-list">
                {tier.deliverables.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/60 p-4 text-sm text-[var(--color-foreground)]">
                <p className="rota-kicker">Price</p>
                <p className="mt-2 font-semibold">{tier.priceLabel}</p>
                <p className="rota-muted mt-2">{tier.fulfillment}</p>
              </div>
              <Button asChild variant={index === 1 ? "primary" : "ghost"}>
                <Link href={index === 2 ? "/human-review" : "/trip/new"}>
                  {tier.ctaLabel}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
