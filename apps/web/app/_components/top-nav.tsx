"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, Icon, NavigationSheet } from "@repo/ui";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/portugal", label: "Portugal" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/local-expertise", label: "Local expertise" },
  { href: "/pricing", label: "Pricing" }
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
 * that the primary public action should match the rest of the design
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
  const firstMobileLinkRef = React.useRef<HTMLAnchorElement>(null);

  // Close the mobile menu whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      aria-label="Primary"
      data-testid="top-nav"
      className="rumia-top-nav fixed top-0 w-full z-50 bg-linen-dark/95 backdrop-blur-md border-b border-olive-light/20 shadow-sm transition-all duration-300"
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
                    "inline-flex min-h-11 min-w-11 items-center justify-center font-label-ui text-label-ui transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded-md px-1 py-0.5 " +
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
          <Link
            href="/explore"
            data-testid="top-nav-worth-doing"
            className="hidden min-h-11 min-w-11 items-center justify-center md:inline-flex bg-olive-light text-on-primary font-label-ui text-label-ui px-5 py-2 rounded-full hover:bg-olive-dark transition-colors duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
          >
            What is worth doing?
          </Link>
          {/* Mobile hamburger — only visible below `md`. */}
          <NavigationSheet
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            title="Primary navigation"
            closeLabel="Close navigation"
            initialFocus={firstMobileLinkRef}
            trigger={
              <button
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="top-nav-mobile"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                data-testid="top-nav-mobile-toggle"
                className="md:hidden inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-primary transition-colors duration-fast hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
              >
                <Icon aria-hidden name={mobileOpen ? "x" : "list"} className="h-5 w-5" />
              </button>
            }
          >
            <div
              id="top-nav-mobile"
              data-testid="top-nav-mobile-panel"
              aria-label="Mobile navigation"
            >
              <ul className="flex flex-col gap-1 px-container-padding-lg py-3">
                {NAV_ITEMS.map((item, index) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        ref={index === 0 ? firstMobileLinkRef : undefined}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        data-testid={`top-nav-mobile-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                        className={
                          "block min-h-11 min-w-11 px-3 py-3 rounded-md font-label-ui text-label-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 " +
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
                    href="/explore"
                    onClick={() => setMobileOpen(false)}
                    data-testid="top-nav-mobile-worth-doing"
                    className="mt-2 inline-flex min-h-11 min-w-11 w-full items-center justify-center bg-olive-light text-on-primary font-label-ui text-label-ui px-5 py-3 rounded-full hover:bg-olive-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
                  >
                    What is worth doing?
                  </Link>
                </li>
              </ul>
            </div>
          </NavigationSheet>
        </div>
      </div>
    </nav>
  );
}
