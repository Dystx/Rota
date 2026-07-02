import Link from "next/link";

/**
 * Expert Chat page — Tier 2 chat surface
 *
 * Source: docs/prototype.html (ExpertChatPage component, lines 307-321).
 * Maps to the Tier 2 async chat triage model from docs/spec-v4.md §2.
 */
export default function ExpertChatPage() {
  return (
    <div className="h-screen flex flex-col font-body-md">
      <nav className="fixed top-0 w-full z-50 bg-glass-light/65 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-header-height px-container-padding-lg max-w-7xl mx-auto">
          <Link href="/" className="font-headline-lg text-headline-lg italic text-primary">
            Rumia
          </Link>
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link
                href="/itineraries"
                className="font-label-ui text-label-ui text-on-surface-variant hover:text-ochre-light transition-colors duration-200"
              >
                Itineraries
              </Link>
            </li>
            <li>
              <Link
                href="/expert-chat"
                className="font-label-ui text-label-ui text-on-surface-variant hover:text-ochre-light transition-colors duration-200"
              >
                Expert Chat
              </Link>
            </li>
            <li>
              <Link
                href="/vault"
                className="font-label-ui text-label-ui text-on-surface-variant hover:text-ochre-light transition-colors duration-200"
              >
                Vault
              </Link>
            </li>
            <li>
              <Link
                href="/console"
                className="font-label-ui text-label-ui text-on-surface-variant hover:text-ochre-light transition-colors duration-200"
              >
                Console
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-6">
            <Link
              href="/planner"
              className="hidden md:block bg-olive-light text-on-primary font-label-ui text-label-ui px-6 py-2 rounded-full hover:bg-olive-dark transition-colors duration-200 shadow-sm"
            >
              Plan a Trip
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 flex pt-header-height overflow-hidden max-w-[1600px] mx-auto w-full">
        <section className="flex-1 flex flex-col bg-surface relative p-4">
          <div className="h-16 flex items-center border-b border-olive-light/10 mb-4">
            <h2 className="font-headline-sm text-primary">
              Chat with Ana (Kyoto Specialist)
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto bg-white/50 rounded-xl p-4 shadow-sm border border-olive-light/10">
            <p className="text-on-surface-variant">Chat messages go here...</p>
          </div>
        </section>
      </main>
    </div>
  );
}