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

export type SiteFooterMode = "full" | "compact" | "utility" | "none";
/** @deprecated Use SiteFooterMode. Kept for existing route callers. */
export type SiteFooterVariant = SiteFooterMode;

interface SiteFooterProps {
  /** Existing callers use `variant`; `mode` is the route-shell vocabulary. */
  variant?: SiteFooterMode;
  mode?: SiteFooterMode;
}

export function SiteFooter({ variant, mode }: SiteFooterProps = {}) {
  const resolvedMode = mode ?? variant ?? "full";

  if (resolvedMode === "none") return null;
  if (resolvedMode === "compact") return <CompactSiteFooter />;
  if (resolvedMode === "utility") return <UtilitySiteFooter />;

  return (
    <footer
      data-testid="site-footer"
      data-variant="full"
      data-mode="full"
      className="rumia-site-footer bg-linen-dark w-full border-t border-olive-dark/5 mt-16 md:mt-24"
    >
      <div className="mx-auto max-w-wide px-container-padding-lg py-12 md:py-16">
        <div
          data-testid="site-footer-grid"
          className="rumia-site-footer__grid grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-5 md:gap-10"
        >
          {/* Brand column */}
          <div className="rumia-site-footer__brand col-span-2 grid gap-3 md:col-span-1">
            <Link
              href="/"
              aria-label="Rumia — go to home"
              className="inline-flex min-h-11 min-w-11 items-center gap-2 focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
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
                    className="inline-flex min-h-11 min-w-11 items-center font-body text-body text-on-surface-variant hover:text-primary transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
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
                    className="inline-flex min-h-11 min-w-11 items-center font-body text-body text-on-surface-variant hover:text-primary transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help" className="grid gap-3">
            <p className="font-label-ui text-label-ui uppercase tracking-widest text-olive-light">Help</p>
            <ul className="grid gap-2 list-none p-0 m-0">{HELP_LINKS.map((link) => <li key={link.href}><Link href={link.href} className="inline-flex min-h-11 min-w-11 items-center font-body text-body text-on-surface-variant hover:text-primary transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus rounded-sm">{link.label}</Link></li>)}</ul>
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
                    className="inline-flex min-h-11 min-w-11 items-center font-body text-body text-on-surface-variant hover:text-primary transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus rounded-sm"
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

function CompactSiteFooter() {
  return (
    <footer
      data-testid="site-footer"
      data-variant="compact"
      data-mode="compact"
      className="rumia-site-footer rumia-site-footer--compact w-full border-t border-olive-dark/5"
    >
      <div className="mx-auto max-w-wide px-container-padding-lg py-8 md:py-10">
        <div className="flex flex-col gap-6 border-b border-olive-dark/10 pb-7 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="grid gap-2">
            <Link
              href="/"
              aria-label="Rumia — go to home"
              className="inline-flex min-h-11 min-w-11 w-fit items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:shadow-focus"
            >
              <BrandMark size="sm" tone="light" />
              <span className="font-headline-lg text-headline-lg italic text-primary">Rumia</span>
            </Link>
            <p className="max-w-md font-body text-body leading-relaxed text-olive-light">
              Considered activity guidance for Portugal, with a clear point of view.
            </p>
          </div>
          <p className="font-mono-micro text-mono-micro uppercase tracking-[0.16em] text-olive-light">
            Portugal · independently curated
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-5 md:gap-8">
          <CompactFooterNav label="Portugal" links={PORTUGAL_LINKS} />
          <CompactFooterNav label="Product" links={PRODUCT_LINKS} />
          <CompactFooterNav label="Help" links={HELP_LINKS} />
          <CompactFooterNav label="Legal" links={LEGAL_LINKS} />
          <nav aria-label="Footer actions" className="grid content-start gap-2">
            <p className="font-label-ui text-label-ui uppercase tracking-widest text-olive-light">Next</p>
            <Link
              href="/explore"
              className="min-h-11 min-w-11 w-fit rounded-sm py-2 font-body text-sm font-medium text-primary underline decoration-ochre-dark/60 underline-offset-4 transition-colors duration-fast ease-standard hover:text-ochre-on-light focus-visible:outline-none focus-visible:shadow-focus"
            >
              Explore activities
            </Link>
          </nav>
        </div>

        <div className="mt-7 flex flex-col gap-2 border-t border-olive-dark/10 pt-5 font-mono-micro text-mono-micro text-olive-light sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rumia. All rights reserved.</p>
          <p>Made in Portugal · English</p>
        </div>
      </div>
    </footer>
  );
}

function CompactFooterNav({ label, links }: { label: string; links: readonly { href: string; label: string }[] }) {
  return (
    <nav aria-label={label} className="grid content-start gap-2">
      <p className="font-label-ui text-label-ui uppercase tracking-widest text-olive-light">{label}</p>
      <ul className="m-0 grid list-none gap-1 p-0">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 min-w-11 items-center rounded-sm py-1 font-body text-sm text-on-surface-variant transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-none focus-visible:shadow-focus"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function UtilitySiteFooter() {
  return (
    <footer
      data-testid="site-footer"
      data-variant="utility"
      data-mode="utility"
      className="rumia-site-footer rumia-site-footer--utility w-full border-t border-olive-dark/10"
    >
      <div className="mx-auto flex max-w-wide flex-col gap-4 px-container-padding-lg py-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          aria-label="Back to Rumia"
          className="inline-flex min-h-11 min-w-11 w-fit items-center gap-2 rounded-sm font-body text-sm font-medium text-primary focus-visible:outline-none focus-visible:shadow-focus"
        >
          <BrandMark size="sm" tone="light" />
          <span>Back to Rumia</span>
        </Link>
        <nav aria-label="Utility footer" className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link href="/support" className="inline-flex min-h-11 min-w-11 items-center rounded-sm font-body text-sm text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:shadow-focus">Support</Link>
          <Link href="/privacy" className="inline-flex min-h-11 min-w-11 items-center rounded-sm font-body text-sm text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:shadow-focus">Privacy</Link>
          <Link href="/terms" className="inline-flex min-h-11 min-w-11 items-center rounded-sm font-body text-sm text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:shadow-focus">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
