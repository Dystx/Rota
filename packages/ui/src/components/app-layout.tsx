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

export type AppSurface = "linen" | "sage" | "midnight" | "ochre";

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
  /**
   * Semantic page field. The default follows the layout variant, while
   * authored routes can opt into a reading or planning chapter explicitly.
   */
  surface?: AppSurface;
}

const variantSurface: Record<AppLayoutVariant, AppSurface> = {
  marketing: "sage",
  app: "linen",
  operator: "midnight",
  checkout: "linen",
  auth: "linen"
};

const variantClassName: Record<AppLayoutVariant, string> = {
  marketing: "text-primary",
  app: "text-primary",
  operator: "text-white",
  checkout: "text-primary",
  auth: "text-primary"
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
  surface,
  className,
  children,
  ...props
}: AppLayoutProps) {
  const resolvedSurface = surface ?? variantSurface[variant];
  const texture = variant === "operator" ? "none" : "editorial";

  return (
    <div
      data-surface={resolvedSurface}
      data-surface-texture={texture}
      className={cn(
        "min-h-screen flex flex-col antialiased",
        "rumia-surface",
        `rumia-surface-${resolvedSurface}`,
        variantClassName[variant],
        className
      )}
      {...props}
    >
      {bare ? null : topNav}
      <main id="main-content" className={cn("flex-1", bare ? "" : "pt-header-height")}>
        {children}
      </main>
      {bare ? null : siteFooter}
    </div>
  );
}
