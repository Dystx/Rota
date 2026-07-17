import Link from "next/link";
import {
  filterActiveReviewerAssignments,
  isPersistenceConfigError,
  isSchemaDriftError,
  listReviewerAssignments
} from "@repo/db";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  ErrorState,
  PageShell,
  SectionHeading,
  StatPill,
  StatusPill
} from "@repo/ui";
import { getReviewerPageAuthContext } from "@/lib/auth/reviewer";
import { RequireReviewerAuth } from "../../_components/require-reviewer-auth";

type JobStatusTone = "success" | "warning" | "neutral" | "danger";

function statusTone(status: string): JobStatusTone {
  switch (status) {
    case "completed":
      return "success";
    case "assigned":
      return "warning";
    case "submitted":
      return "neutral";
    default:
      return "neutral";
  }
}

function prettify(value: string) {
  return value.replace(/_/g, " ").replace(/-/g, " ");
}

export default async function ReviewerOperationsPage() {
  let assignments = [] as Awaited<ReturnType<typeof listReviewerAssignments>>;
  let infoMessage = "";
  let errorMessage = "";
  let notSignedIn = false;

  try {
    const authContext = await getReviewerPageAuthContext();
    if (!authContext) {
      notSignedIn = true;
    } else if ("reason" in authContext) {
      errorMessage = "Reviewer operations are temporarily unavailable. Please try again shortly.";
    } else {
      assignments = await listReviewerAssignments(100, authContext.reviewerId, { actor: authContext.actor });
    }
  } catch (error) {
    infoMessage = isPersistenceConfigError(error)
      ? "Configure PostgreSQL and Better Auth to load persisted reviewer assignments here."
      : isSchemaDriftError(error)
        ? "Reviewer assignments are temporarily unavailable while persistence is being reconciled."
        : "Could not load reviewer assignments. Please try again later.";
  }

  const activeAssignments = filterActiveReviewerAssignments(assignments);
  const completedAssignments = assignments.filter((assignment) => assignment.status === "completed");
  const submittedAssignments = assignments.filter((assignment) => assignment.status === "submitted");
  const assignmentRows = assignments.map((assignment) => ({
    id: assignment.id,
    notes: assignment.notes || "No notes recorded",
    status: assignment.status,
    trip: "Assigned trip",
    updated: assignment.completedAt ?? assignment.createdAt
  }));

  return (
    <PageShell variant="reviewer">
      <div data-testid="reviewer-operations-header">
        <SectionHeading
          eyebrow="Reviewer dashboard"
          title="Operations console"
          description="Review the persisted assignment state for your reviewer account. Background workers, checkout, and delivery previews are not shown without live records."
          h1
        />
      </div>

      {errorMessage ? (
        <Card className="mt-8 overflow-hidden border-[var(--color-border)] bg-white/60 shadow-sm">
          <CardContent className="p-0">
            <ErrorState variant="table" title="Operations unavailable" message={errorMessage} retryHref="/reviewer/operations" />
          </CardContent>
        </Card>
      ) : infoMessage ? (
        <Card className="mt-8 overflow-hidden border-[var(--color-border)] bg-white/60 shadow-sm" data-testid="reviewer-operations-info">
          <CardContent className="p-0">
            <ErrorState variant="table" title="Cannot load operations" message={infoMessage} retryHref="/reviewer/operations" />
          </CardContent>
        </Card>
      ) : notSignedIn ? (
        <RequireReviewerAuth signedIn={false} noun="operations" />
      ) : (
        <>
          <Card data-testid="reviewer-operations-summary" className="mt-8 border-[var(--color-border)] bg-white/60 shadow-sm">
            <CardHeader className="px-4 pt-6 md:px-8 md:pt-8">
              <CardTitle className="font-display text-2xl">Assignment summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 px-4 pb-6 md:px-8 md:pb-8">
              <StatPill label="Active" value={String(activeAssignments.length)} />
              <StatPill label="Submitted" value={String(submittedAssignments.length)} />
              <StatPill label="Completed" value={String(completedAssignments.length)} />
              <Badge tone="soft">Source: reviewer assignments</Badge>
            </CardContent>
          </Card>

          <Card data-testid="reviewer-operations-table" className="mt-8 border-[var(--color-border)] bg-white/60 shadow-sm">
            <CardHeader className="px-4 pt-6 md:px-8 md:pt-8">
              <CardTitle className="font-display text-2xl">Assignment records</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-6 md:px-8 md:pb-8">
              {assignmentRows.length === 0 ? (
                <EmptyState
                  variant="table"
                  title="No assignment records"
                  description="No persisted reviewer assignments are available for this account yet."
                  action={
                    <Button asChild size="md" variant="secondary">
                      <Link href="/reviewer/queue">Open review queue</Link>
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="hidden md:block">
                    <DataTable
                      columns={[
                        { key: "trip", header: "Trip", cell: (row) => row.trip },
                        { key: "status", header: "Status", cell: (row) => <StatusPill tone={statusTone(row.status)} label={prettify(row.status)} /> },
                        { key: "notes", header: "Notes", cell: (row) => row.notes },
                        { key: "updated", header: "Updated", cell: (row) => row.updated }
                      ]}
                      data={assignmentRows}
                      getRowId={(row) => row.id}
                      density="compact"
                      ariaLabel="Reviewer assignment records"
                    />
                  </div>
                  <div className="grid gap-3 md:hidden" data-testid="reviewer-operations-mobile">
                    {assignmentRows.map((row) => (
                      <article key={row.id} className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-white/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-medium text-[var(--color-foreground)]">{row.trip}</p>
                          <StatusPill tone={statusTone(row.status)} label={prettify(row.status)} />
                        </div>
                        <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{row.notes}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">Updated {row.updated}</p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </PageShell>
  );
}
