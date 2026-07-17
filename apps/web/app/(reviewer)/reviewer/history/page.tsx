import Link from "next/link";
import { isPersistenceConfigError, listReviewerAssignments } from "@repo/db";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState, ErrorState, PageShell, SectionHeading, StatPill, StatusPill } from "@repo/ui";
import { getReviewerPageAuthContext } from "@/lib/auth/reviewer";
import { RequireReviewerAuth } from "../../_components/require-reviewer-auth";

export const dynamic = "force-dynamic";

export default async function ReviewerHistoryPage() {
  let assignments = [] as Awaited<ReturnType<typeof listReviewerAssignments>>;
  let errorMessage = "";
  let notSignedIn = false;

  try {
    const auth = await getReviewerPageAuthContext();

    if (!auth) {
      notSignedIn = true;
    } else if ("reason" in auth) {
      errorMessage = "Reviewer history is temporarily unavailable. Please try again shortly.";
    } else {
      assignments = await listReviewerAssignments(20, auth.reviewerId, { actor: auth.actor });
    }
  } catch (error) {
    errorMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted reviewer history context here."
      : "Could not load reviewer history. Please try again later.";
  }

  const rawData = assignments.map((assignment) => ({
    id: assignment.id,
    tripId: assignment.tripId,
    tripName: "Review assignment",
    status: assignment.status,
    notes: assignment.notes || "Review assignment recorded",
    updated: assignment.completedAt ?? assignment.createdAt,
  }));
  const completedCount = assignments.filter((assignment) => assignment.status === "completed").length;
  const activeCount = assignments.filter((assignment) => assignment.status === "assigned" || assignment.status === "submitted").length;
  const latestUpdate = assignments
    .map((assignment) => assignment.completedAt ?? assignment.createdAt)
    .filter(Boolean)
    .sort()
    .at(-1);
  const reviewNotes = Array.from(
    new Set(
      assignments
        .map((assignment) => assignment.notes.trim())
        .filter(Boolean)
    )
  ).slice(0, 4);

  return (
    <PageShell variant="reviewer">
      <div data-testid="reviewer-history-header">
        <SectionHeading
          eyebrow="Reviewer dashboard"
          title="Review history"
          description="View completed trips and past quality reviews."
          h1
        />
      </div>
      {!errorMessage && !notSignedIn ? <div data-testid="history-metrics" className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Throughput</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatPill label="Completed" value={String(completedCount)} />
            <StatPill label="Active queue" value={String(activeCount)} />
            <StatPill label="Latest update" value={latestUpdate ? String(latestUpdate) : "Not tracked"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent themes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {reviewNotes.length ? reviewNotes.map((item) => (
              <Badge key={item} tone="soft">
                {item}
              </Badge>
            )) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">No review notes recorded.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivery target</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[15px] leading-relaxed text-[var(--color-foreground)]">Keep paid human-review trips moving from queue to polished itinerary within one day.</p>
          </CardContent>
        </Card>
      </div> : null}

      {errorMessage ? (
        <Card className="mt-8 border-[var(--color-border)] shadow-sm bg-white/60">
          <CardContent className="p-0">
            <ErrorState
              variant="table"
              title="Cannot load history"
              message={errorMessage}
              retryHref="/reviewer/history"
            />
          </CardContent>
        </Card>
      ) : notSignedIn ? (
        <RequireReviewerAuth signedIn={false} noun="history" />
      ) : (
        <>
          <div data-testid="history-table" className="hidden md:block mt-8">
            <Card className="border-[var(--color-border)] shadow-sm bg-white/60">
              <CardHeader className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
                <CardTitle className="font-display text-2xl">Completed and recent reviews</CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-8 pb-6 md:pb-8">
                {rawData.length > 0 ? (
                  <DataTable 
                    columns={[
                      { key: "tripName", header: "Trip", cell: (row) => <Link href={`/reviewer/trips/${row.tripId}`} className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline block min-h-[44px] content-center">{row.tripName}</Link> },
                      { key: "status", header: "Status", cell: (row) => <StatusPill tone={row.status === "completed" ? "success" : "neutral"} label={row.status} /> },
                      { key: "notes", header: "Main improvement", cell: (row) => row.notes },
                      { key: "updated", header: "Updated", cell: (row) => String(row.updated) }
                    ]} 
                    data={rawData} 
                  />
                ) : (
                  <EmptyState 
                    variant="table" 
                    title="No review history" 
                    description="You haven't completed any reviews yet." 
                    action={
                      <Button asChild size="md" variant="secondary">
                        <Link href="/reviewer/queue">Back to review queue</Link>
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div data-testid="history-list" className="grid gap-4 md:hidden mt-8">
            <h3 className="font-display text-xl font-semibold px-1">Completed and recent reviews</h3>
            {rawData.length === 0 ? (
              <Card className="border-[var(--color-border)] bg-white/60 shadow-sm">
                <CardContent className="p-0">
                  <EmptyState
                    variant="table"
                    title="No review history"
                    description="You haven't completed any reviews yet."
                    action={
                      <Button asChild size="md" variant="secondary">
                        <Link href="/reviewer/queue">Back to review queue</Link>
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : rawData.map((item) => (
              <Card key={item.id} className="border-[var(--color-border)] bg-white/40 shadow-sm hover:bg-[rgba(247,250,249,0.5)] transition-colors">
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Link href={`/reviewer/trips/${item.tripId}`} className="font-medium text-lg text-[var(--color-foreground)] underline-offset-4 hover:underline before:absolute before:inset-0 before:z-10 min-h-[44px] content-center">
                      {item.tripName}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2 relative z-20">
                    <StatusPill tone={item.status === "completed" ? "success" : "neutral"} label={item.status} />
                  </div>
                  <div className="w-full h-px bg-[var(--color-border)]" />
                  <div className="text-sm text-[var(--color-foreground)] relative z-20">
                    <p className="leading-relaxed">{item.notes}</p>
                    <p className="mt-2 text-[13px] text-[var(--color-muted-foreground)]">{String(item.updated)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
