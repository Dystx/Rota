import Link from "next/link";
import { getLatestAssignmentForTrip, isPersistenceConfigError, listTripDrafts } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, PageShell, SectionHeading } from "@repo/ui";
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

  const rows =
    trips.length > 0
      ? await Promise.all(trips.map(async (trip) => {
          const tripCommerceState = getTripCommerceState({
            hasHumanReview: trip.hasHumanReview,
            isPaid: trip.isPaid
          });
          const latestAssignment = await getLatestAssignmentForTrip(trip.id).catch(() => null);

          return [
            <Link key={`${trip.id}-route`} href={`/reviewer/trips/${trip.id}`} className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
              {trip.title}
            </Link>,
            prettify(trip.brief.regions[0] ?? "portugal"),
            latestAssignment?.reviewerName ?? "Unassigned",
            <Badge key={`${trip.id}-access`} tone="soft">
              {tripCommerceState.accessLabel}
            </Badge>,
            <Badge key={`${trip.id}-export`} tone="soft">
              {tripCommerceState.exportLabel}
            </Badge>,
            <Badge key={`${trip.id}-review`} tone="soft">
              {tripCommerceState.reviewLabel}
            </Badge>,
            tripCommerceState.queueLabel
          ];
        }))
      : [
          [
            <Link key="sample-1" href="/reviewer/trips/1" className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
              Porto & Douro / 5 days
            </Link>,
            "North",
            "Inês Almeida",
            <Badge key="sample-1-access" tone="soft">Unlocked paid trip</Badge>,
            <Badge key="sample-1-export" tone="soft">PDF + calendar export ready</Badge>,
            <Badge key="sample-1-review" tone="soft">Ready for human review</Badge>,
            "Needs review"
          ],
          [
            <Link key="sample-2" href="/reviewer/trips/2" className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
              Lisbon calm family route
            </Link>,
            "Lisbon",
            "Tomás Costa",
            <Badge key="sample-2-access" tone="soft">Unlocked paid trip</Badge>,
            <Badge key="sample-2-export" tone="soft">PDF + calendar export ready</Badge>,
            <Badge key="sample-2-review" tone="soft">Local expert reviewed</Badge>,
            "Completed"
          ],
          [
            <Link key="sample-3" href="/reviewer/trips/3" className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
              Algarve coastal week
            </Link>,
            "South",
            "Unassigned",
            <Badge key="sample-3-access" tone="soft">Free preview only</Badge>,
            <Badge key="sample-3-export" tone="soft">PDF + calendar export locked</Badge>,
            <Badge key="sample-3-review" tone="soft">Human review available after unlock</Badge>,
            "Waiting for unlock"
          ]
        ];

  return (
    <PageShell variant="reviewer">
      <SectionHeading
        eyebrow="Reviewer dashboard"
        title="Review queue shell"
        description="Matches the roadmap: assigned trips, due soon, and local quality review."
      />
      <div className="flex flex-wrap gap-4 mt-6">
        <a
          href="/reviewer/operations"
          className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white"
        >
          Open worker plan
        </a>
        <a
          href="/reviewer/profile"
          className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white"
        >
          Reviewer profile
        </a>
        <a
          href="/reviewer/history"
          className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white"
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
        <CardHeader className="px-8 pt-8">
          <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Assigned trips</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <DataTable columns={["Trip", "Region", "Reviewer", "Unlock", "Export", "Review", "Queue state"]} rows={rows} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
