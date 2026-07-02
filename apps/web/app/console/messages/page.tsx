import { ConsoleNav } from "../_components/console-nav";

/**
 * Console Messages — Messaging Hub (Tier 2/3 chat triage)
 *
 * Source: docs/prototype.html (ConsoleMessages component, lines 345-353).
 * Maps to Tier 3 Hybrid Triage Engine from docs/spec-v4.md §2:
 * AI pre-resolves logistical queries; specialist rota handles nuanced/urgent.
 */
export default function ConsoleMessagesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <ConsoleNav />
      <main className="flex-1 md:ml-64 p-container-padding-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
          Messaging Hub
        </h2>
        <div className="bg-glass-light p-4 rounded-xl border border-white/20">
          Messages Interface
        </div>
      </main>
    </div>
  );
}