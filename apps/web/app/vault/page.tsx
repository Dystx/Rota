import Link from "next/link";

/**
 * Vault page — saved archive
 *
 * Source: docs/prototype.html (VaultPage component, lines 292-305).
 */
export default function VaultPage() {
  return (
    <div className="min-h-screen flex flex-col font-body-md">
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
      <main className="flex-grow pt-[88px] px-container-padding-sm max-w-7xl mx-auto w-full">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Saved Vault</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="bg-glass-light p-4 rounded-xl border border-white/20 shadow-sm">
            <h2 className="font-headline-sm text-primary">Portugal Escape</h2>
            <p className="text-sm">7 DAYS</p>
          </div>
        </div>
      </main>
    </div>
  );
}