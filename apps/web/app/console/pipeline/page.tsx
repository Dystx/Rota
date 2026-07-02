import { ConsoleNav } from "../_components/console-nav";

/**
 * Console Pipeline — Operations Pipeline (default /console view)
 *
 * Source: docs/prototype.html (ConsolePipeline component, lines 325-333).
 * Maps to ops work for Tier 1 itineraries: queue, status, throughput.
 */
export default function ConsolePipelinePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <ConsoleNav />
      <main className="flex-1 md:ml-64 p-container-padding-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
          Operations Pipeline
        </h2>
        <div className="bg-glass-light p-4 rounded-xl border border-white/20">
          Pipeline Board
        </div>
      </main>
    </div>
  );
}