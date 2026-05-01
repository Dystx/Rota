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
      <SectionHeading
        eyebrow="Background operations"
        title="Worker plan shell"
        description="Surfaces the next roadmap layer: export jobs, reviewer assignment, and route refresh work that should run outside the request cycle."
      />
      <Card>
        <CardHeader>
          <CardTitle>Current worker plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="rota-muted text-sm">{workerPlan.summary}</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {workerPlan.jobs.map((job) => (
              <div key={job.id} className="grid gap-3 rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="soft">{job.type.replace(/_/g, " ")}</Badge>
                  <Badge tone="soft">{job.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">{job.title}</p>
                  <p className="rota-muted mt-2 text-sm">{job.summary}</p>
                </div>
                <div className="grid gap-2 text-sm">
                  <p className="text-[var(--color-foreground)]">Owner: {job.owner}</p>
                  <p className="text-[var(--color-foreground)]">Next step: {job.nextStep}</p>
                  {job.blockingReason ? <p className="rota-muted">Blocked: {job.blockingReason}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Checkout plans</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {checkoutPlans.map((plan) => (
              <div key={plan.tier} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="soft">{plan.tier.replace(/-/g, " ")}</Badge>
                  <Badge tone="soft">{plan.priceLabel}</Badge>
                </div>
                <p className="rota-muted mt-3 text-sm">{plan.fulfillment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Email previews</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {emailPreviews.map((preview) => (
              <div key={preview.kind} className="rounded-[20px] border border-[var(--color-border)] bg-white/70 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="soft">{preview.kind.replace(/-/g, " ")}</Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--color-foreground)]">{preview.subject}</p>
                <p className="rota-muted mt-2 text-sm">{preview.previewText}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
