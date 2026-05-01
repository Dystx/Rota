import Link from "next/link";
import { getLatestAssignmentForTrip, isPersistenceConfigError, listTripDrafts } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, PageShell, SectionHeading } from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";

function prettify(value: string) {
  return value.replace(/-/g, " ");
}

export default async function ReviewerQueuePage() {
  let trips = [] as Awaited<ReturnType<typeof listTripDrafts>>;
  let infoMessage = "";

  try {
    trips = await listTripDrafts();
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load real paid and review-ready trips here."
      : error instanceof Error
        ? error.message
        : "Could not load reviewer queue.";
  }

  const processedTrips =
    trips.length > 0
      ? await Promise.all(
          trips.map(async (trip) => {
            const tripCommerceState = getTripCommerceState({
              hasHumanReview: trip.hasHumanReview,
              isPaid: trip.isPaid
            });
            const latestAssignment = await getLatestAssignmentForTrip(trip.id).catch(() => null);

            return {
              id: trip.id.toString(),
              title: trip.title,
              region: prettify(trip.brief.regions[0] ?? "portugal"),
              reviewerName: latestAssignment?.reviewerName ?? "Unassigned",
              accessLabel: tripCommerceState.accessLabel,
              exportLabel: tripCommerceState.exportLabel,
              reviewLabel: tripCommerceState.reviewLabel,
              queueLabel: tripCommerceState.queueLabel
            };
          })
        )
      : [
          {
            id: "1",
            title: "Porto & Douro / 5 days",
            region: "North",
            reviewerName: "Inês Almeida",
            accessLabel: "Unlocked paid trip",
            exportLabel: "PDF + calendar export ready",
            reviewLabel: "Ready for human review",
            queueLabel: "Needs review"
          },
          {
            id: "2",
            title: "Lisbon calm family route",
            region: "Lisbon",
            reviewerName: "Tomás Costa",
            accessLabel: "Unlocked paid trip",
            exportLabel: "PDF + calendar export ready",
            reviewLabel: "Local expert reviewed",
            queueLabel: "Completed"
          },
          {
            id: "3",
            title: "Algarve coastal week",
            region: "South",
            reviewerName: "Unassigned",
            accessLabel: "Free preview only",
            exportLabel: "PDF + calendar export locked",
            reviewLabel: "Human review available after unlock",
            queueLabel: "Waiting for unlock"
          }
        ];

  return (
    <PageShell variant="reviewer">
      <div data-testid="reviewer-queue-header">
        <SectionHeading
          eyebrow="Reviewer dashboard"
          title="Review queue shell"
          description="Matches the roadmap: assigned trips, due soon, and local quality review."
        />
      </div>
      <div className="flex flex-wrap gap-4 mt-6">
        <a
          href="/reviewer/operations"
          className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white min-h-[44px]"
        >
          Open worker plan
        </a>
        <a
          href="/reviewer/profile"
          className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white min-h-[44px]"
        >
          Reviewer profile
        </a>
        <a
          href="/reviewer/history"
          className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white min-h-[44px]"
        >
          Review history
        </a>
      </div>
      {infoMessage ? (
        <Card className="mt-8 overflow-hidden border-black/5 bg-white/60 shadow-sm">
          <CardContent className="px-8 py-6">
            <p className="rota-muted leading-relaxed">{infoMessage}</p>
          </CardContent>
        </Card>
      ) : null}
      <Card className="mt-8 overflow-hidden border-black/5 bg-white/60 shadow-sm">
        <CardHeader className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
          <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Assigned trips</CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-8 pb-6 md:pb-8">
          <div data-testid="queue-list" className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-[24px] border border-[var(--color-border)]">
              <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                  <tr>
                    {["Trip", "Region", "Reviewer", "Unlock", "Export", "Review", "Queue state"].map((col) => (
                      <th key={col} className="px-4 py-3 font-medium uppercase tracking-[0.12em]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedTrips.map((trip) => (
                    <tr key={trip.id} data-testid={`queue-item-${trip.id}`} className="border-t border-[var(--color-border)] group hover:bg-[rgba(247,250,249,0.5)] transition-colors">
                      <td className="px-4 py-4 text-[var(--color-foreground)]">
                        <Link href={`/reviewer/trips/${trip.id}`} className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline block min-h-[44px] content-center relative z-10">
                          {trip.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-[var(--color-foreground)]">{trip.region}</td>
                      <td className="px-4 py-4 text-[var(--color-foreground)]">{trip.reviewerName}</td>
                      <td className="px-4 py-4 text-[var(--color-foreground)]">
                        <Badge tone="soft">{trip.accessLabel}</Badge>
                      </td>
                      <td className="px-4 py-4 text-[var(--color-foreground)]">
                        <Badge tone="soft">{trip.exportLabel}</Badge>
                      </td>
                      <td className="px-4 py-4 text-[var(--color-foreground)]">
                        <Badge tone="soft">{trip.reviewLabel}</Badge>
                      </td>
                      <td className="px-4 py-4 text-[var(--color-foreground)]">{trip.queueLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {processedTrips.map((trip) => (
                <div key={trip.id} data-testid={`queue-item-${trip.id}`} className="flex flex-col gap-4 rounded-[24px] border border-[var(--color-border)] p-5 bg-white/40 shadow-sm relative transition hover:bg-[rgba(247,250,249,0.5)]">
                  <div className="flex flex-col gap-1.5">
                    <Link href={`/reviewer/trips/${trip.id}`} className="font-medium text-lg text-[var(--color-foreground)] underline-offset-4 hover:underline before:absolute before:inset-0 before:z-10 min-h-[44px] content-center">
                      {trip.title}
                    </Link>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {trip.region} &middot; {trip.reviewerName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 relative z-20">
                    <Badge tone="soft">{trip.accessLabel}</Badge>
                    <Badge tone="soft">{trip.exportLabel}</Badge>
                    <Badge tone="soft">{trip.reviewLabel}</Badge>
                  </div>
                  <div className="w-full h-px bg-[var(--color-border)]" />
                  <span className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-muted-foreground)] relative z-20">
                    {trip.queueLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
