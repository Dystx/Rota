"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@repo/ui";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/console/pipeline", label: "Pipeline", icon: "check-circle" },
  { href: "/console/workspace", label: "Revision Workspace", icon: "note-pencil" },
  { href: "/console/messages", label: "Messaging Hub", icon: "chat-circle" },
  { href: "/console/graph", label: "Knowledge Graph", icon: "tree-structure" },
  { href: "/console/metrics", label: "Metrics", icon: "chart-line-up" },
  { href: "/console/config", label: "System Config", icon: "gear" }
];

/**
 * ConsoleNav — shared side nav for /console/* routes.
 *
 * Source: docs/prototype.html (ConsoleNav component, lines 164-181).
 * Olive-dark sidebar with: Rumia Console wordmark, 6 nav items.
 *
 * UX Pass 3: active-state highlighting via usePathname +
 * aria-current. Operators on a 6-page console surface used
 * to have no affordance to know where they were without
 * reading the page heading.
 */
export function ConsoleNav() {
  const pathname = usePathname();

  const navItems = (
    <ul className="grid gap-1">
      {NAV_ITEMS.map((item) => {
        // Exact match for /console/pipeline so /console/pipeline/foo
        // doesn't light up the Pipeline nav item. Prefix match
        // for the rest so /console/messages/123 still highlights
        // "Messaging Hub".
        const isActive =
          item.href === "/console/pipeline"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              data-testid={`console-nav-${item.href.replace("/console/", "")}`}
              data-active={isActive ? "true" : "false"}
              className={
                "flex min-h-11 items-center gap-3 rounded-lg p-3 font-body-md text-body-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 " +
                (isActive
                  ? "border-l-2 border-ochre-dark bg-ochre-light/15 text-ochre-dark"
                  : "text-on-surface-variant hover:bg-white/60 hover:text-primary")
              }
            >
              <Icon name={item.icon} aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <nav
        aria-label="Console navigation"
        data-surface="linen"
        data-surface-texture="none"
        className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-olive-light/15 bg-[var(--color-linen)] px-gutter py-section-gap text-primary shadow-none md:flex"
      >
        <div className="mb-8 px-3">
          <Link href="/" className="block font-headline-sm text-headline-sm italic text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2">
            Rumia Console
          </Link>
          <p className="mt-1 font-mono-micro text-mono-micro uppercase tracking-widest text-on-surface-variant">
            Management Portal
          </p>
        </div>
        <div className="flex-1">{navItems}</div>
      </nav>

      <details className="relative z-50 border-b border-olive-light/15 bg-[var(--color-linen)] text-primary md:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
          <span className="font-headline-sm text-headline-sm italic">Rumia Console</span>
          <span className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">Menu</span>
        </summary>
        <div className="border-t border-olive-light/10 px-4 py-3">{navItems}</div>
      </details>
    </>
  );
}
