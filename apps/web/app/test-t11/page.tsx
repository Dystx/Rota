import { EmptyState, LoadingState, Skeleton, ErrorState } from "@repo/ui";

export default function TestPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-16">
      <section>
        <h2 className="text-xl mb-4 font-bold">EmptyState - Cinematic</h2>
        <EmptyState 
          variant="cinematic" 
          title="No places explored" 
          description="Your cinematic journey begins here."
          action={<button className="px-4 py-2 bg-black text-white rounded">Start exploring</button>}
        />
      </section>

      <section>
        <h2 className="text-xl mb-4 font-bold">EmptyState - Table</h2>
        <EmptyState 
          variant="table" 
          title="No records found in this table" 
        />
      </section>

      <section>
        <h2 className="text-xl mb-4 font-bold">LoadingState - Cinematic</h2>
        <LoadingState variant="cinematic" text="Loading your experience..." />
      </section>

      <section>
        <h2 className="text-xl mb-4 font-bold">Skeleton</h2>
        <Skeleton className="w-64 h-32" />
      </section>

      <section>
        <h2 className="text-xl mb-4 font-bold">ErrorState - Cinematic</h2>
        <ErrorState 
          variant="cinematic" 
          title="Lost connection" 
          message="We couldn't connect to the server. Please try again."
        />
      </section>

      <section>
        <h2 className="text-xl mb-4 font-bold">ErrorState - Table</h2>
        <ErrorState 
          variant="table" 
          title="Failed to load records" 
          message="An error occurred while fetching table data."
          error={{ code: 500, message: "Database timeout" }}
        />
      </section>
    </div>
  );
}