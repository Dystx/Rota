import Link from "next/link";
import { Metadata } from "next";
import { filterActiveReviewerAssignments, isPersistenceConfigError, listReviewerAssignments, getTripDraftById } from "@repo/db";
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState, ErrorState, PageShell, SectionHeading, StatusPill } from "@repo/ui";
import { getTripCommerceState } from "@/lib/trip-commerce";
import { getReviewerPageAuthContext } from "@/lib/auth/reviewer";
import { RequireReviewerAuth } from "../_components/require-reviewer-auth";

export const metadata: Metadata = {
  title: "Reviewer Queue",
  robots: {
    index: false,
    follow: false
  }
};

function prettify(value: string) {
  return value.replace(/-/g, " ");
}

export default async function ReviewerQueuePage() {
  let authContext: Awaited<ReturnType<typeof getReviewerPageAuthContext>> = null;
  let activeTrips = [] as Array<{
    id: string;
    title: string;
    region: string;
    reviewerName: string;
    accessLabel: string;
    exportLabel: string;
    reviewLabel: string;
    queueLabel: string;
  }>;
  let errorMessage = "";
  let notSignedIn = false;

  try {
    authContext = await getReviewerPageAuthContext();
    if (!authContext) {
      notSignedIn = true;
    } else {
      const { client, reviewerId } = authContext;
      const assignments = await listReviewerAssignments(100, reviewerId, { client });
      const activeAssignments = filterActiveReviewerAssignments(assignments);

      activeTrips = (await Promise.all(
        activeAssignments.map(async (assignment) => {
          const trip = await getTripDraftById(assignment.tripId, { client });
          if (!trip) return null;

          const tripCommerceState = getTripCommerceState({
            hasHumanReview: trip.hasHumanReview,
            isPaid: trip.isPaid
          });

          return {
            id: trip.id.toString(),
            title: trip.title,
            region: prettify(trip.brief.regions[0] ?? "portugal"),
            reviewerName: assignment.reviewerName ?? "Assigned",
            accessLabel: tripCommerceState.accessLabel,
            exportLabel: tripCommerceState.exportLabel,
            reviewLabel: tripCommerceState.reviewLabel,
            queueLabel: assignment.status === "submitted" ? "Submitted" : "Needs review"
          };
        })
      )).filter(Boolean) as typeof activeTrips;
    }
  } catch (error) {
    errorMessage = isPersistenceConfigError(error)
      ? "Configure Supabase environment variables to load real assigned trips here."
      : "Could not load reviewer queue. Please try again later.";
  }

  const processedTrips = activeTrips;

  return (
    <PageShell variant="reviewer">
      <div data-testid="reviewer-queue-header">
        <SectionHeading
          h1
          eyebrow="Reviewer dashboard"
          title="Review queue"
          description="Manage your assigned trips, priorities, and pending quality reviews."
        />
      </div>
      <div className="flex flex-wrap gap-4 mt-6">
        <a
          href="/reviewer/operations"
          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white min-h-[44px]"
        >
          Open worker plan
        </a>
        <a
          href="/reviewer/profile"
          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white min-h-[44px]"
        >
          Reviewer profile
        </a>
        <a
          href="/reviewer/history"
          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white/70 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition hover:bg-white min-h-[44px]"
        >
          Review history
        </a>
      </div>

      {errorMessage ? (
        <Card className="mt-8 overflow-hidden border-[var(--color-border)] bg-white/60 shadow-sm">
          <CardContent className="p-0">
            <ErrorState variant="table" title="Cannot load queue" message={errorMessage} />
          </CardContent>
        </Card>
      ) : notSignedIn ? (
        <RequireReviewerAuth signedIn={false} noun="queue" />
      ) : processedTrips.length === 0 ? (
        <Card className="mt-8 overflow-hidden border-[var(--color-border)] bg-white/60 shadow-sm">
          <CardContent className="p-0">
            <EmptyState 
              variant="table" 
              title="Your queue is empty" 
              description="There are no active trips assigned to you at the moment. Check back later or review your history." 
              icon={
                <div className="h-12 w-12 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-muted-foreground)]">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : null}

      {!errorMessage && !notSignedIn && processedTrips.length > 0 && (
        <Card className="mt-8 overflow-hidden border-[var(--color-border)] bg-white/60 shadow-sm">
        <CardHeader className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
          <CardTitle className="font-[family-name:var(--font-rota-display)] text-2xl">Assigned trips</CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-8 pb-6 md:pb-8">
          <div data-testid="queue-list" className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <DataTable 
                columns={[
                  { key: "title", header: "Trip", cell: (row) => <Link href={`/reviewer/trips/${row.id}`} className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline block min-h-[44px] content-center relative z-10">{row.title}</Link> },
                  { key: "region", header: "Region", cell: (row) => row.region },
                  { key: "reviewerName", header: "Reviewer", cell: (row) => row.reviewerName },
                  { key: "access", header: "Unlock", cell: (row) => <Badge tone="soft">{row.accessLabel}</Badge> },
                  { key: "export", header: "Export", cell: (row) => <Badge tone="soft">{row.exportLabel}</Badge> },
                  { key: "review", header: "Review", cell: (row) => <Badge tone="soft">{row.reviewLabel}</Badge> },
                  { key: "queueLabel", header: "Queue state", cell: (row) => <StatusPill tone={row.queueLabel === "Submitted" ? "success" : "warning"} label={row.queueLabel} /> }
                ]}
                data={processedTrips}
              />
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
                  <div className="relative z-20 self-start">
                    <StatusPill tone={trip.queueLabel === "Submitted" ? "success" : "warning"} label={trip.queueLabel} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </PageShell>
  );
}
