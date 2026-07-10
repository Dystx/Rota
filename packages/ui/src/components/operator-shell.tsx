import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "../lib/cn";

/**
 * OperatorShell — shared layout for the /reviewer and /admin
 * console surfaces (12 pages total).
 *
 * The previous surface had two problems:
 * 1. The reviewer pages had no nav at all — a manual
 *    3-link strip on the queue page was the only cross-page
 *    affordance.
 * 2. The admin pages also had no nav — moving between
 *    `/admin/regions` and `/admin/analytics` required
 *    editing the URL or pressing back.
 *
 * This shell renders a persistent left sidebar with two
 * sections (Reviewer / Admin) and a footer with the signed-in
 * user's display name and a sign-out link. The active route
 * is highlighted via `aria-current="page"`.
 *
 * On `<lg` the sidebar collapses to a top-bar with a
 * hamburger that opens a full-width sheet. The mobile
 * pattern is intentionally light — most operator workflows
 * are desktop-first; mobile is a read-only fallback.
 *
 * The shell is a server component. Callers pass the auth
 * context they already loaded (don't re-fetch here). The
 * nav items are keyed off `section` so a reviewer never
 * sees admin links and vice versa — the role-gating lives
 * in the layout that wraps the shell, not in the shell.
 */
export type OperatorSection = "reviewer" | "admin";

interface NavItem {
  href: string;
  label: string;
  /** Optional Material Symbols icon name. Falls back to a
   *  small dot if omitted. */
  icon?: string;
  /** Optional short description under the label. */
  hint?: string;
}

const REVIEWER_NAV: NavItem[] = [
  { href: "/reviewer/queue", label: "Queue", icon: "inbox", hint: "Active assignments" },
  { href: "/reviewer/history", label: "History", icon: "history", hint: "Completed reviews" },
  { href: "/reviewer/operations", label: "Operations", icon: "sync", hint: "Worker pipeline" },
  { href: "/reviewer/profile", label: "Profile", icon: "person", hint: "Reviewer settings" }
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/regions", label: "Regions", icon: "map", hint: "Curation" },
  { href: "/admin/countries", label: "Countries", icon: "public", hint: "Rollout" },
  { href: "/admin/places", label: "Places", icon: "place", hint: "Place database" },
  { href: "/admin/specialists", label: "Specialists", icon: "support_agent", hint: "Reviewer roster" },
  { href: "/admin/partners", label: "Partners", icon: "handshake", hint: "Booking sources" },
  { href: "/admin/reviewers", label: "Reviewers", icon: "verified", hint: "Reviewer pool" },
  { href: "/admin/quality", label: "Quality", icon: "fact_check", hint: "Trust markers" },
  { href: "/admin/analytics", label: "Analytics", icon: "monitoring", hint: "Pipeline health" }
];

const SECTION_META: Record<OperatorSection, { label: string; kicker: string }> = {
  reviewer: { label: "Reviewer workspace", kicker: "Reviewer" },
  admin: { label: "Admin CMS", kicker: "Admin" }
};

export interface OperatorShellUser {
  /** Display name (e.g. reviewer.fullName or user.email). */
  name: string;
  /** Optional avatar URL. */
  avatarUrl?: string | null;
  /** Optional email shown under the name on `<lg`. */
  email?: string | null;
}

export interface OperatorShellProps {
  section: OperatorSection;
  /** Current pathname — used to highlight the active nav item.
   *  Pass from the layout via `headers().get('x-pathname')` or
   *  a server-action context; the shell reads it as a prop so
   *  it stays a pure server component. */
  currentPath: string;
  user: OperatorShellUser;
  /** Optional sign-out form action. If omitted, no sign-out
   *  link is rendered. */
  signOutAction?: string;
  children: ReactNode;
}

const NavLink = ({
  item,
  active
}: {
  item: NavItem;
  active: boolean;
}) => (
  <Link
    href={item.href}
    aria-current={active ? "page" : undefined}
    data-testid={`operator-nav-${item.label.toLowerCase()}`}
    data-active={active ? "true" : "false"}
    className={cn(
      "group flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2",
      active
        ? "bg-ochre-light/15 text-ochre-dark font-medium"
        : "text-on-surface-variant hover:bg-white/40 hover:text-primary"
    )}
  >
    {item.icon ? (
      <span
        aria-hidden
        className={cn(
          "material-symbols-outlined text-[20px] mt-0.5 shrink-0",
          active ? "text-ochre-dark" : "text-olive-light group-hover:text-ochre-dark"
        )}
      >
        {item.icon}
      </span>
    ) : (
      <span
        aria-hidden
        className={cn(
          "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
          active ? "bg-ochre-dark" : "bg-olive-light/40"
        )}
      />
    )}
    <span className="grid gap-0.5 min-w-0">
      <span className="leading-tight">{item.label}</span>
      {item.hint ? (
        <span className="text-[11px] text-on-surface-variant/70 leading-tight font-normal truncate">
          {item.hint}
        </span>
      ) : null}
    </span>
  </Link>
);

const NavList = ({ items, currentPath }: { items: NavItem[]; currentPath: string }) => (
  <ul role="list" className="grid gap-0.5 list-none p-0 m-0">
    {items.map((item) => (
      <li key={item.href}>
        <NavLink item={item} active={currentPath === item.href || currentPath.startsWith(item.href + "/")} />
      </li>
    ))}
  </ul>
);

export function OperatorShell({
  section,
  currentPath,
  user,
  signOutAction,
  children
}: OperatorShellProps) {
  const meta = SECTION_META[section];
  const navItems = section === "reviewer" ? REVIEWER_NAV : ADMIN_NAV;
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background text-primary">
      {/* Desktop layout: sidebar + content */}
      <div className="lg:flex lg:min-h-screen">
        {/* Sidebar — visible from `lg` up. Below `lg` it becomes
            a top-bar with a hamburger that toggles the mobile
            sheet (rendered as a `<details>` for zero-JS). */}
        <aside
          aria-label={`${meta.kicker} navigation`}
          data-testid="operator-sidebar"
          className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-olive-light/15 lg:bg-paper/40"
        >
          <div className="flex flex-1 flex-col gap-6 p-6 sticky top-0 h-screen">
            <Link
              href="/"
              data-testid="operator-brand"
              className="font-headline-lg text-headline-lg italic text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2 rounded-md"
            >
              Rumia
            </Link>

            <div>
              <p className="font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark font-medium mb-3">
                {meta.kicker}
              </p>
              <NavList items={navItems} currentPath={currentPath} />
            </div>

            <div className="mt-auto flex items-center gap-3 rounded-lg border border-olive-light/15 bg-white/60 p-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="h-9 w-9 shrink-0 rounded-full bg-olive-light/15 flex items-center justify-center font-label-ui text-label-ui text-olive-dark"
                >
                  {initial}
                </div>
              )}
              <div className="grid gap-0.5 min-w-0 flex-1">
                <p className="text-sm font-medium text-primary truncate">{user.name}</p>
                {user.email ? (
                  <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                ) : null}
              </div>
              {signOutAction ? (
                <form action={signOutAction} method="post">
                  <button
                    type="submit"
                    data-testid="operator-sign-out"
                    className="text-[11px] text-on-surface-variant hover:text-ochre-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-1 rounded px-1.5 py-1"
                    aria-label="Sign out"
                  >
                    Sign out
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </aside>

        <div
          data-testid="operator-main"
          className="flex-1 min-w-0"
        >
          {/* Mobile top-bar — visible below `lg`. Uses a
              native <details> for zero-JS disclosure. */}
          <details className="lg:hidden border-b border-olive-light/15 bg-paper/40">
            <summary
              data-testid="operator-mobile-toggle"
              className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2"
            >
              <Link href="/" className="font-headline-md text-headline-md italic text-primary">
                Rumia
              </Link>
              <span className="flex items-center gap-2 font-mono-micro text-mono-micro uppercase tracking-widest text-ochre-dark">
                {meta.kicker}
                <span aria-hidden className="material-symbols-outlined text-[20px]">menu</span>
              </span>
            </summary>
            <div className="p-4 grid gap-4 border-t border-olive-light/10">
              <NavList items={navItems} currentPath={currentPath} />
              <div className="flex items-center gap-3 border-t border-olive-light/10 pt-4">
                <div
                  aria-hidden
                  className="h-9 w-9 shrink-0 rounded-full bg-olive-light/15 flex items-center justify-center font-label-ui text-label-ui text-olive-dark"
                >
                  {initial}
                </div>
                <div className="grid gap-0.5 min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">{user.name}</p>
                  {user.email ? (
                    <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                  ) : null}
                </div>
                {signOutAction ? (
                  <form action={signOutAction} method="post">
                    <button
                      type="submit"
                      className="text-[11px] text-on-surface-variant hover:text-ochre-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-1 rounded px-1.5 py-1"
                    >
                      Sign out
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </details>

          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
