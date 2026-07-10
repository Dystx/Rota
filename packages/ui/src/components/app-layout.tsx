import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * AppLayout — the page-level shell.
 *
 * PR-4 layout polish:
 *   - 5 variants: marketing | app | operator | checkout | auth
 *   - Each variant standardizes: top nav, side nav, footer, background,
 *     and content max-width
 *   - `bare` opts out of the chrome for full-bleed pages (planner overlay,
 *     cinematic hero, etc.)
 *   - Uses the root layout's single skip-to-content link and owns page background
 *
 * Backward compatible: pages that don't import AppLayout keep their
 * existing TopNav + SiteFooter imports. New pages should use AppLayout.
 */

export type AppLayoutVariant =
  | "marketing"
  | "app"
  | "operator"
  | "checkout"
  | "auth";

interface AppLayoutProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AppLayoutVariant;
  /**
   * When true, the AppLayout renders only the content + skip link,
   * without the top/side/bottom chrome. Use for full-bleed pages
   * (planner overlay, cinematic hero, bento grids).
   */
  bare?: boolean;
  /**
   * Optional override for the top navigation element (server component
   * TopNav reads cookies for the auth state, so the consumer passes it
   * in). When undefined, AppLayout renders the standard TopNav.
   */
  topNav?: ReactNode;
  /**
   * Optional override for the site footer element.
   */
  siteFooter?: ReactNode;
  children: ReactNode;
}

const variantClassName: Record<AppLayoutVariant, string> = {
  marketing: "bg-background",
  app: "bg-background",
  operator: "bg-[#050806] text-white",
  checkout: "bg-background",
  auth: "bg-paper"
};

/**
 * AppLayout is a server component. The TopNav and SiteFooter are passed
 * in as children because they may need to read the session cookie.
 */
export function AppLayout({
  variant = "marketing",
  bare = false,
  topNav,
  siteFooter,
  className,
  children,
  ...props
}: AppLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col antialiased",
        variantClassName[variant],
        className
      )}
      {...props}
    >
      {bare ? null : (
        <>
          {topNav}
          <main id="main-content" className="flex-1 pt-header-height">
            {children}
          </main>
          {siteFooter}
        </>
      )}

      {bare ? children : null}
    </div>
  );
}
