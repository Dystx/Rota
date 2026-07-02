import { ConsoleNav } from "../_components/console-nav";

/**
 * Console Graph — Knowledge Graph (Tier 1 knowledge base)
 *
 * Source: docs/prototype.html (ConsoleGraph component, lines 355-371).
 * Maps to docs/spec.md §5 + docs/spec-v4.md §4: countries / cities /
 * places / restaurants / embeddings visualization.
 */
export default function ConsoleGraphPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <ConsoleNav />
      <main className="flex-1 md:ml-64 p-container-padding-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
          Knowledge Graph
        </h2>
        <div className="bg-white/50 p-4 rounded-xl border border-white/20">
          Graph Interface
        </div>
      </main>
    </div>
  );
}