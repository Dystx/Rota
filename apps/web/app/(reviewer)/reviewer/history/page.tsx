import Link from "next/link";
import { getReviewerById, isPersistenceConfigError, listReviewerAssignments } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, PageShell, SectionHeading, StatPill } from "@repo/ui";

export const dynamic = "force-dynamic";

export default async function ReviewerHistoryPage() {
  let reviewer = null as Awaited<ReturnType<typeof getReviewerById>>;
  let assignments = [] as Awaited<ReturnType<typeof listReviewerAssignments>>;
  let infoMessage = "";

  try {
    reviewer = await getReviewerById("ines-almeida");
    assignments = await listReviewerAssignments(20, "ines-almeida");
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load persisted reviewer history context here."
      : error instanceof Error
        ? error.message
        : "Could not load reviewer history context.";
  }

  const rawData =
    assignments.length > 0
      ? assignments.map((assignment) => ({
          id: assignment.id,
          tripId: assignment.tripId,
          tripName: `Trip ${assignment.tripId}`,
          status: assignment.status,
          notes: assignment.notes || "Review assignment recorded",
          updated: assignment.completedAt ?? assignment.createdAt,
        }))
      : [
          {
            id: "trip-1",
            tripId: "1",
            tripName: "Porto & Douro / 5 days",
            status: "Completed",
            notes: "Pacing correction + food upgrade",
            updated: "2h ago",
          },
          {
            id: "trip-2",
            tripId: "2",
            tripName: "Lisbon calm family route",
            status: "Submitted",
            notes: "Rain fallback + local note",
            updated: "Yesterday",
          },
          {
            id: "trip-3",
            tripId: "3",
            tripName: "Algarve coastal week",
            status: "Returned",
            notes: "Tourist-trap replacement",
            updated: "Last week",
          },
        ];

  const rows = rawData.map((item) => [
    <Link key={item.id} href={`/reviewer/trips/${item.tripId}`} className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
      {item.tripName}
    </Link>,
    item.status,
    item.notes,
    String(item.updated)
  ]);

  return (
    <PageShell variant="reviewer">
      <div data-testid="reviewer-history-header">
        <SectionHeading
          eyebrow="Reviewer dashboard"
          title="Review history shell"
          description="Tracks assigned trips, finished reviews, and the kinds of route polish already delivered."
        />
      </div>
      <div data-testid="history-metrics" className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Throughput</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatPill label="This week" value={reviewer ? `${reviewer.regions.length + 5} reviews` : "8 reviews"} />
            <StatPill label="Avg time" value="5.4h" />
            <StatPill label="Quality" value="High" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent themes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[
              "Better food stop",
              "Rain-safe route",
              "Calmer day pacing",
              "Local tip added"
            ].map((item) => (
              <Badge key={item} tone="soft">
                {item}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivery target</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rota-muted text-sm">Keep paid human-review trips moving from queue to polished itinerary within one day.</p>
            {infoMessage ? <p className="rota-muted mt-3 text-sm">{infoMessage}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div data-testid="history-table" className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Completed and recent reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={["Trip", "Status", "Main improvement", "Updated"]} rows={rows} />
          </CardContent>
        </Card>
      </div>

      <div data-testid="history-list" className="grid gap-4 md:hidden">
        <h3 className="font-semibold text-lg text-[var(--color-foreground)]">Completed and recent reviews</h3>
        {rawData.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <Link href={`/reviewer/trips/${item.tripId}`} className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
                  {item.tripName}
                </Link>
                <span className="text-xs font-medium bg-[var(--color-surface-muted)] px-2 py-1 rounded-full text-[var(--color-muted-foreground)]">
                  {item.status}
                </span>
              </div>
              <div className="text-sm text-[var(--color-muted-foreground)]">
                <p>{item.notes}</p>
                <p className="mt-1 text-xs">{String(item.updated)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
