import { buildWorkerPlan } from "@repo/workers";
import { buildEmailPreview } from "@repo/emails";
import { listCheckoutPlans } from "@repo/payments";
import { Badge, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading } from "@repo/ui";

export default function ReviewerOperationsPage() {
  const workerPlan = buildWorkerPlan({ tripId: "1", isPaid: true, hasHumanReview: false });
  const checkoutPlans = listCheckoutPlans();
  const emailPreviews = [
    buildEmailPreview("payment-receipt", "Porto & Douro / 5 days"),
    buildEmailPreview("export-ready", "Porto & Douro / 5 days"),
    buildEmailPreview("review-complete", "Porto & Douro / 5 days")
  ];

  return (
    <PageShell variant="reviewer">
      <div data-testid="reviewer-operations-header">
        <SectionHeading
          eyebrow="Background operations"
          title="Worker plan shell"
          description="Surfaces the next roadmap layer: export jobs, reviewer assignment, and route refresh work that should run outside the request cycle."
        />
      </div>

      <div className="flex flex-col gap-8 md:gap-12">
        <Card data-testid="worker-plan-card">
          <CardHeader>
            <CardTitle>Current worker plan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <p className="rota-muted text-lg">{workerPlan.summary}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workerPlan.jobs.map((job) => (
                <div key={job.id} className="flex flex-col gap-4 rounded-[24px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.5)] p-6 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="soft">{job.type.replace(/_/g, " ")}</Badge>
                    <Badge tone="soft">{job.status}</Badge>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--color-foreground)]">{job.title}</p>
                    <p className="rota-muted mt-1 text-sm">{job.summary}</p>
                  </div>
                  <div className="mt-auto grid gap-2 pt-2 text-sm">
                    <p className="text-[var(--color-foreground)]">Owner: {job.owner}</p>
                    <p className="text-[var(--color-foreground)]">Next step: {job.nextStep}</p>
                    {job.blockingReason ? <p className="text-[var(--color-muted-foreground)]">Blocked: {job.blockingReason}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card data-testid="checkout-plan-card">
            <CardHeader>
              <CardTitle>Checkout plans</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              {checkoutPlans.map((plan) => (
                <div key={plan.tier} className="flex flex-col gap-3 rounded-[24px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.5)] p-6 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="soft">{plan.tier.replace(/-/g, " ")}</Badge>
                    <Badge tone="soft">{plan.priceLabel}</Badge>
                  </div>
                  <p className="rota-muted text-base">{plan.fulfillment}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="email-preview-card">
            <CardHeader>
              <CardTitle>Email previews</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              {emailPreviews.map((preview) => (
                <div key={preview.kind} className="flex flex-col gap-3 rounded-[24px] border border-[var(--color-border)] bg-[rgba(247,250,249,0.5)] p-6 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="soft">{preview.kind.replace(/-/g, " ")}</Badge>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--color-foreground)]">{preview.subject}</p>
                    <p className="rota-muted mt-1 text-sm">{preview.previewText}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
