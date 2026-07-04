import { buildWorkerPlan } from "@repo/workers/plan";
import { buildEmailPreview } from "@repo/emails";
import { listCheckoutPlans } from "@repo/payments";
import { isPersistenceConfigError, isSchemaDriftError } from "@repo/db";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  PageShell,
  SectionHeading,
  StatPill,
  StatusPill
} from "@repo/ui";
import { getReviewerPageAuthContext } from "@/lib/auth/reviewer";

type JobStatusTone = "success" | "warning" | "neutral" | "danger";

function statusTone(status: string): JobStatusTone {
  switch (status) {
    case "ready":
    case "succeeded":
    case "completed":
      return "success";
    case "blocked":
    case "dead_lettered":
      return "danger";
    case "queued":
    case "running":
    case "retry_scheduled":
      return "warning";
    default:
      return "neutral";
  }
}

function prettify(value: string) {
  return value.replace(/_/g, " ").replace(/-/g, " ");
}

export default async function ReviewerOperationsPage() {
  let infoMessage = "";

  try {
    const authContext = await getReviewerPageAuthContext();
    if (!authContext) {
      infoMessage = "Sign in with a linked reviewer account to interact with the live operations console.";
    }
  } catch (error) {
    if (isPersistenceConfigError(error)) {
      infoMessage = "Configure Supabase environment variables to load the reviewer operations console.";
    } else if (isSchemaDriftError(error)) {
      infoMessage = "Reviewer operations are temporarily unavailable while persistence is being reconciled. Background queues, checkout, and delivery previews remain visible below.";
    } else {
      infoMessage = "Could not load reviewer operations context. The reference queues below are still available.";
    }
  }

  const workerPlan = buildWorkerPlan({ tripId: "1", isPaid: true, hasHumanReview: false });
  const checkoutPlans = listCheckoutPlans();
  const emailPreviews = [
    buildEmailPreview("payment-receipt", "Porto & Douro / 5 days"),
    buildEmailPreview("export-ready", "Porto & Douro / 5 days"),
    buildEmailPreview("review-complete", "Porto & Douro / 5 days")
  ];

  const totalJobs = workerPlan.jobs.length;
  const blockedJobs = workerPlan.jobs.filter((job) => Boolean(job.blockingReason)).length;
  const readyJobs = totalJobs - blockedJobs;

  return (
    <PageShell variant="reviewer">
      <div data-testid="reviewer-operations-header">
        <SectionHeading
          eyebrow="Reviewer dashboard"
          title="Operations console"
          description="Monitor background queues, checkout pricing, and reviewer delivery messages used across the assignment lifecycle."
          h1
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <StatPill label="Background jobs" value={String(totalJobs)} />
        <StatPill label="Ready" value={String(readyJobs)} />
        <StatPill label="Blocked" value={String(blockedJobs)} />
        <StatPill label="Checkout tiers" value={String(checkoutPlans.length)} />
        <StatPill label="Delivery messages" value={String(emailPreviews.length)} />
      </div>

      {infoMessage ? (
        <Card className="mt-8 overflow-hidden border-[var(--color-border)] bg-white/60 shadow-sm" data-testid="reviewer-operations-info">
          <CardContent className="pt-6">
            <p className="rota-muted text-sm">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-8 flex flex-col gap-8 md:gap-12">
        <Card data-testid="worker-plan-card" className="border-[var(--color-border)] bg-white/60 shadow-sm">
          <CardHeader className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
            <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Background queue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 px-4 md:px-8 pb-6 md:pb-8">
            <p className="rota-muted text-base leading-relaxed">{workerPlan.summary}</p>
            {workerPlan.jobs.length === 0 ? (
              <EmptyState variant="table" title="No background jobs" description="Background queues are idle. Newly assigned trips will appear here once they enter the operations pipeline." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workerPlan.jobs.map((job) => (
                  <div key={job.id} className="flex flex-col gap-4 rounded-[24px] border border-[var(--color-border)] bg-white/70 p-6 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="soft">{prettify(job.type)}</Badge>
                      <StatusPill tone={statusTone(job.status)} label={prettify(job.status)} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[var(--color-foreground)]">{job.title}</p>
                      <p className="rota-muted mt-1 text-sm leading-relaxed">{job.summary}</p>
                    </div>
                    <div className="mt-auto grid gap-2 pt-2 text-sm">
                      <p className="text-[var(--color-foreground)]"><span className="rota-kicker mr-2">Owner</span>{job.owner}</p>
                      <p className="text-[var(--color-foreground)]"><span className="rota-kicker mr-2">Next step</span>{job.nextStep}</p>
                      {job.blockingReason ? (
                        <p className="text-[var(--color-muted-foreground)]"><span className="rota-kicker mr-2">Blocked</span>{job.blockingReason}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card data-testid="checkout-plan-card" className="border-[var(--color-border)] bg-white/60 shadow-sm">
            <CardHeader className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
              <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Checkout tiers</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 px-4 md:px-8 pb-6 md:pb-8">
              {checkoutPlans.map((plan) => (
                <div key={plan.tier} className="flex flex-col gap-3 rounded-[24px] border border-[var(--color-border)] bg-white/70 p-6 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="soft">{prettify(plan.tier)}</Badge>
                    <Badge tone="soft">{plan.priceLabel}</Badge>
                  </div>
                  <p className="rota-muted text-base leading-relaxed">{plan.fulfillment}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="email-preview-card" className="border-[var(--color-border)] bg-white/60 shadow-sm">
            <CardHeader className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
              <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Delivery messages</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 px-4 md:px-8 pb-6 md:pb-8">
              {emailPreviews.map((preview) => (
                <div key={preview.kind} className="flex flex-col gap-3 rounded-[24px] border border-[var(--color-border)] bg-white/70 p-6 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="soft">{prettify(preview.kind)}</Badge>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--color-foreground)]">{preview.subject}</p>
                    <p className="rota-muted mt-1 text-sm leading-relaxed">{preview.previewText}</p>
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
