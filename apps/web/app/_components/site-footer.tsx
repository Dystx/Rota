import * as React from "react";
import Link from "next/link";
import { BrandMark } from "@repo/ui";

/**
 * SiteFooter — global footer.
 *
 * PR-4 layout polish:
 *   - 5-column layout on `md+` (Brand / Portugal / Product / Help / Legal)
 *   - On mobile, columns stack; legal becomes a horizontal pill row
 *   - Pre-footer CTA band removed in this PR (was a stretch; lives in a
 *     separate "Plan your trip" hook on the marketing pages)
 *   - "All systems operational" status indicator is a static label
 *     today; a real /status page wires the dot color
 *   - Year is rendered server-side via Date (Next.js will hydrate this
 *     from the server response)
 */

const PORTUGAL_LINKS = [
  { href: "/portugal", label: "Portugal activities" },
  { href: "/local-expertise", label: "Local expertise" }
];

const PRODUCT_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/planner", label: "Shape a day" }
];

const HELP_LINKS = [
  { href: "/support", label: "Support" },
  { href: "/offline", label: "Offline help" }
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/sustainability", label: "Sustainability" }
];

export function SiteFooter() {
  return (
    <footer
      data-testid="site-footer"
      className="bg-linen-dark w-full border-t border-olive-dark/5 mt-section-gap"
    >
      <div className="mx-auto max-w-wide px-container-padding-lg py-12 md:py-16">
        <div
          data-testid="site-footer-grid"
          className="grid gap-10 md:grid-cols-5 md:gap-10"
        >
          {/* Brand column */}
          <div className="grid gap-3">
            <Link
              href="/"
              aria-label="Rumia — go to home"
              className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
            >
              <BrandMark size="sm" tone="light" />
              <span className="font-headline-lg text-headline-lg italic text-primary">
                Rumia
              </span>
            </Link>
            <p className="font-body text-body text-olive-light max-w-xs">
              Intentional Humanism in Travel — Portugal-first, independently curated.
            </p>
            <p className="font-mono-micro text-mono-micro text-olive-light">
              Built for considered Portugal journeys.
            </p>
          </div>

          <nav aria-label="Portugal" className="grid gap-3">
            <p className="font-label-ui text-label-ui uppercase tracking-widest text-olive-light">
              Portugal
            </p>
            <ul className="grid gap-2 list-none p-0 m-0">
              {PORTUGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-body text-on-surface-variant hover:text-primary transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Product" className="grid gap-3">
            <p className="font-label-ui text-label-ui uppercase tracking-widest text-olive-light">
              Product
            </p>
            <ul className="grid gap-2 list-none p-0 m-0">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-body text-on-surface-variant hover:text-primary transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help" className="grid gap-3">
            <p className="font-label-ui text-label-ui uppercase tracking-widest text-olive-light">Help</p>
            <ul className="grid gap-2 list-none p-0 m-0">{HELP_LINKS.map((link) => <li key={link.href}><Link href={link.href} className="font-body text-body text-on-surface-variant hover:text-primary transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus rounded-sm">{link.label}</Link></li>)}</ul>
          </nav>

          <nav aria-label="Legal" className="grid gap-3">
            <p className="font-label-ui text-label-ui uppercase tracking-widest text-olive-light">
              Legal
            </p>
            <ul className="grid gap-2 list-none p-0 m-0">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-body text-on-surface-variant hover:text-primary transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom row — copyright + locale */}
        <div className="mt-12 flex flex-col items-start gap-2 border-t border-olive-dark/5 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono-micro text-mono-micro text-olive-light">
            © {new Date().getFullYear()} Rumia. All rights reserved.
          </p>
          <p className="font-mono-micro text-mono-micro text-olive-light">
            Made in Portugal · English
          </p>
        </div>
      </div>
    </footer>
  );
}
