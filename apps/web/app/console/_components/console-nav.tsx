"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/console/pipeline", label: "Pipeline", icon: "assignment_turned_in" },
  { href: "/console/workspace", label: "Revision Workspace", icon: "edit_note" },
  { href: "/console/messages", label: "Messaging Hub", icon: "chat_bubble" },
  { href: "/console/graph", label: "Knowledge Graph", icon: "account_tree" },
  { href: "/console/metrics", label: "Metrics", icon: "analytics" },
  { href: "/console/config", label: "System Config", icon: "settings" }
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

  return (
    <nav
      aria-label="Console navigation"
      className="hidden md:flex flex-col h-full py-section-gap px-gutter z-50 fixed left-0 top-0 w-64 bg-olive-dark shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-8 px-3">
        <Link href="/" className="font-headline-sm text-headline-sm text-ochre-light block">
          Rumia Console
        </Link>
        <p className="font-mono-micro text-mono-micro text-linen-dark opacity-70 mt-1 uppercase">
          Management Portal
        </p>
      </div>
      <ul className="flex-1 space-y-2">
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
                  "p-3 flex items-center gap-3 rounded-lg font-body-md text-body-md transition-colors " +
                  (isActive
                    ? "bg-ochre-light/15 text-ochre-light border-l-4 border-ochre-light"
                    : "text-on-primary-container/70 hover:bg-primary-container/50 hover:text-linen-dark")
                }
              >
                <span
                  aria-hidden
                  className="material-symbols-outlined"
                >
                  {item.icon}
                </span>{" "}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
