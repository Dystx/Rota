import Link from "next/link";

/**
 * SiteFooter — global footer (Stitch 1.1 home reference layout:
 * brand wordmark + tagline + 4 legal links).
 *
 * The 4 legal links are now real routes — `href="#"` would be a
 * silent dead-link (the audit flagged this). The pages are
 * intentionally minimal placeholders so the routes resolve; each
 * one will get its own content pass in a follow-up.
 */
const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/support", label: "Global Support" }
];

export function SiteFooter() {
  return (
    <footer
      data-testid="site-footer"
      className="bg-linen-dark w-full border-t border-olive-dark/5 py-12 px-container-padding-lg flex flex-col md:flex-row justify-between items-center gap-4 mt-section-gap"
    >
      <Link
        href="/"
        className="font-headline-sm text-headline-sm italic text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
      >
        Rumia
      </Link>
      <p className="font-label-ui text-label-ui text-olive-light text-center md:text-left">
        © 2024 Rumia. All rights reserved. Intentional Humanism in Travel.
      </p>
      <ul className="flex flex-wrap justify-center gap-6">
        {LEGAL_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-label-ui text-label-ui text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}
