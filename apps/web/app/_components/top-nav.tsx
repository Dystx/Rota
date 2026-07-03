import Link from "next/link";

/**
 * TopNav — global navigation bar.
 *
 * Source: docs/prototype.html (TopNavBar, lines 1-30 of the new prototype).
 * Structure matches verbatim:
 *   - fixed top-0 glass-morphism bar
 *   - "Rumia" brand wordmark (italic, Playfair Display)
 *   - 3 desktop nav links (Itineraries / Expert Chat / Vault)
 *   - "Plan a Trip" CTA + profile avatar
 */
export function TopNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-glass-light/65 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center h-header-height px-container-padding-lg max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          href="/"
          className="font-headline-lg text-headline-lg italic text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          Rumia
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <Link
              href="/itineraries"
              className="font-label-ui text-label-ui text-on-surface-variant hover:text-ochre-light transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              Itineraries
            </Link>
          </li>
          <li>
            <Link
              href="/expert-chat"
              className="font-label-ui text-label-ui text-on-surface-variant hover:text-ochre-light transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              Expert Chat
            </Link>
          </li>
          <li>
            <Link
              href="/vault"
              className="font-label-ui text-label-ui text-on-surface-variant hover:text-ochre-light transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              Vault
            </Link>
          </li>
        </ul>

        {/* Trailing Action & Profile */}
        <div className="flex items-center gap-6">
          <Link
            href="/planner"
            className="hidden md:block bg-olive-light text-on-primary font-label-ui text-label-ui px-6 py-2 rounded-full hover:bg-olive-dark transition-colors duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Plan a Trip
          </Link>
          <button
            type="button"
            aria-label="Traveler profile"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full overflow-hidden border border-white/20 shadow-sm flex items-center justify-center scale-95 active:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <img
              alt=""
              className="w-10 h-10 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJnCG5lbmqYcEas2Nf4z5hZZPtjVXDRq2TGeX3XdS4r7JVq4OGrFc0rdoTDxgd0_-MXbB4YPoDQGFjWbrRxYGdAgBQKu6_PeaXiwP6ZEx3gBpaqg-Dq7X86ueESI1-bNfV3znqVQyVKMm4FeLnC5BdGm9U1YH_9xnm1nJzp95YcKIclkYAqs6-lFU5bCBsbu10S71THbosiO6wWD4r4a4Fl0LhpERaj1ORLotenFT3_2dyOL8qp8D4BUWyVxfNVchZ9FakGOE-9f4x"
            />
          </button>
        </div>
      </div>
    </nav>
  );
}