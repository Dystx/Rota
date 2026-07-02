import { ConsoleNav } from "../_components/console-nav";

/**
 * Console Config — System Config
 *
 * Source: docs/prototype.html (ConsoleConfig component, lines 387-395).
 * Reserved for Tier 1/2/3/4 platform configuration:
 * tier pricing, specialist rota schedules, RNAAT license API keys,
 * Stripe live mode toggle, Mapbox token, etc.
 */
export default function ConsoleConfigPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <ConsoleNav />
      <main className="flex-1 md:ml-64 p-container-padding-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
          System Config
        </h2>
        <div className="bg-glass-light p-4 rounded-xl border border-white/20">
          Settings Interface
        </div>
      </main>
    </div>
  );
}