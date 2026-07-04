import type { ReactNode } from "react";
import { ConsoleNav } from "./_components/console-nav";

/**
 * ConsoleLayout — shared shell for /console/* routes.
 *
 * Source: docs/reference/rumia-console/ (2.1 Operations Pipeline Board, 3.3 System
 * Variable Config, etc.) + docs/roadmap.md §3.10 PR-14a. The SideNavBar (olive-dark
 * + backdrop-blur-xl) is the single piece of chrome every console page needs;
 * the per-page `bg-background` / dark-mode `bg-[#050806]` override stays in the
 * page so the design system doesn't lose its per-route accent.
 *
 * Each child page still owns its own outer `<div>` + `<main>` so it can apply
 * per-page layout decisions (workspace needs `relative` for the validation
 * bar; graph needs dark-mode bg). This layout owns only the nav.
 */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ConsoleNav />
      {children}
    </>
  );
}
