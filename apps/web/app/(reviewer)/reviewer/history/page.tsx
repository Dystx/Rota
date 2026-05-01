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

  const rows =
    assignments.length > 0
      ? assignments.map((assignment) => [
          <Link key={assignment.id} href={`/reviewer/trips/${assignment.tripId}`} className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
            Trip {assignment.tripId}
          </Link>,
          assignment.status,
          assignment.notes || "Review assignment recorded",
          assignment.completedAt ?? assignment.createdAt
        ])
      : [
          [
            <Link key="trip-1" href="/reviewer/trips/1" className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
              Porto & Douro / 5 days
            </Link>,
            "Completed",
            "Pacing correction + food upgrade",
            "2h ago"
          ],
          [
            <Link key="trip-2" href="/reviewer/trips/2" className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
              Lisbon calm family route
            </Link>,
            "Submitted",
            "Rain fallback + local note",
            "Yesterday"
          ],
          [
            <Link key="trip-3" href="/reviewer/trips/3" className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline">
              Algarve coastal week
            </Link>,
            "Returned",
            "Tourist-trap replacement",
            "Last week"
          ]
        ];

  return (
    <PageShell variant="reviewer">
      <SectionHeading
        eyebrow="Reviewer dashboard"
        title="Review history shell"
        description="Tracks assigned trips, finished reviews, and the kinds of route polish already delivered."
      />
      <div className="grid gap-4 lg:grid-cols-3">
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
      <Card>
        <CardHeader>
          <CardTitle>Completed and recent reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={["Trip", "Status", "Main improvement", "Updated"]} rows={rows} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
