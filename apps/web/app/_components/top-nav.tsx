"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@repo/ui";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/itineraries", label: "Itineraries" },
  { href: "/vault", label: "Vault" }
];

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * TopNav — global navigation bar (Stitch 1.1 home + Stitch 1.4
 * workspace shared pattern).
 *
 * Source: docs/prototype.html (TopNavBar) + the user feedback
 * that 'Plan a Trip' should match the rest of the design
 * language (olive-light / olive-dark, not a generic green).
 *
 * The component is "use client" because it reads the
 * pathname to set aria-current. Above `md` the desktop
 * nav links render inline; below `md` a hamburger button
 * toggles a small drop-down panel with the same links.
 */
export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close the mobile menu whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      aria-label="Primary"
      data-testid="top-nav"
      className="fixed top-0 w-full z-50 bg-glass-light/65 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300"
    >
      <div className="flex justify-between items-center h-header-height px-container-padding-lg max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          href="/"
          aria-current={isActivePath(pathname, "/") ? "page" : undefined}
          aria-label="Rumia — go to home"
          className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
        >
          <BrandMark size="sm" tone="light" />
          <span className="font-display italic text-headline-sm text-primary">
            Rumia
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  data-testid={`top-nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  data-active={active ? "true" : "false"}
                  className={
                    "font-label-ui text-label-ui transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded-md px-1 py-0.5 " +
                    (active
                      ? "text-ochre-dark underline underline-offset-8 decoration-2 decoration-ochre-light"
                      : "text-on-surface-variant hover:text-ochre-light")
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Trailing Action & Profile */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Locale switcher — placeholder. Real locale routing lands
              with i18n; today the pill is visual + links back to the
              same page. */}
          <div
            role="group"
            aria-label="Language"
            className="hidden md:inline-flex items-center rounded-full border border-olive-light/20 bg-white/40 backdrop-blur-sm p-0.5 text-[11px] font-medium"
          >
            <span className="px-2.5 py-1 rounded-full bg-olive-light text-on-primary" aria-current="true">EN</span>
            <span className="px-2.5 py-1 text-olive-light" aria-disabled>PT</span>
          </div>
          <Link
            href="/planner"
            data-testid="top-nav-plan-a-trip"
            className="hidden md:inline-flex bg-olive-light text-on-primary font-label-ui text-label-ui px-5 py-2 rounded-full hover:bg-olive-dark transition-colors duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            Plan a Trip
          </Link>
          <Link
            href="/account"
            aria-label="Traveler profile — open account"
            aria-current={isActivePath(pathname, "/account") ? "page" : undefined}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full overflow-hidden border border-white/20 shadow-flat flex items-center justify-center bg-olive-light text-on-primary font-display text-sm scale-95 hover:scale-100 active:opacity-80 transition-all duration-base ease-standard focus-visible:outline-none focus-visible:shadow-focus"
          >
            <span aria-hidden>R</span>
          </Link>

          {/* Mobile hamburger — only visible below `md`. */}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="top-nav-mobile"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            data-testid="top-nav-mobile-toggle"
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            <span aria-hidden className="material-symbols-outlined">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu panel — slides down from the top bar. */}
      {mobileOpen ? (
        <div
          id="top-nav-mobile"
          data-testid="top-nav-mobile-panel"
          className="md:hidden border-t border-white/30 bg-glass-light/95 backdrop-blur-md"
        >
          <ul className="flex flex-col gap-1 px-container-padding-lg py-3">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    data-testid={`top-nav-mobile-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={
                      "block px-3 py-3 rounded-md font-label-ui text-label-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 " +
                      (active
                        ? "bg-ochre-light/15 text-ochre-dark"
                        : "text-on-surface-variant hover:bg-white/40")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/planner"
                data-testid="top-nav-mobile-plan-a-trip"
                className="mt-2 inline-flex w-full justify-center bg-olive-light text-on-primary font-label-ui text-label-ui px-5 py-3 rounded-full hover:bg-olive-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                Plan a Trip
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
