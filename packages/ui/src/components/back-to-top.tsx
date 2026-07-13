"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";

/**
 * BackToTop — a small floating button that appears once the user
 * scrolls past 600px and jumps back to the top of the page on
 * click. Mounted once near the app root (the root layout) so
 * it's available on every page without per-page wiring.
 *
 * Why this matters: the trip detail page is ~8000px tall (hero
 * + map + 5-day timeline + unlock + CTA). After reading the
 * timeline the user has to scroll all the way back to the nav
 * or the breadcrumb. This button gives them a one-tap escape.
 *
 * Accessibility: rendered as a real <button> with aria-label.
 * The smooth scroll respects prefers-reduced-motion (the CSS
 * `scroll-behavior: smooth` is suppressed when the user has
 * requested reduced motion in their OS settings — the browser
 * handles that automatically, no JS needed).
 */
export function BackToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      // 600px feels right for a 900px-tall viewport — the user
      // has clearly moved past the fold.
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-4 left-4 z-40 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full",
        "bg-ink text-cream shadow-lg backdrop-blur-sm",
        "flex items-center justify-center",
        "transition-all duration-300",
        "hover:bg-ink-soft hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      )}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="arrow_upward" className="text-[20px]" />
    </button>
  );
}
