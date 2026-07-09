import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

/**
 * BrandMark — Rumia's azulejo R monogram.
 *
 * PR-A1 (first brand surface). A single SVG behind three `tone` variants:
 *   - `light` (default): olive ink + ochre accents on cream/light surfaces
 *   - `dark`: cream ink + ochre-light accents on dark olive/forest surfaces
 *   - `mark` (auto): picks dark when nested under a `.on-dark` context,
 *     light elsewhere. Lets the consumer skip the prop.
 *
 * Sizes (Tailwind h-* utilities so the parent controls layout):
 *   sm = 24px (footer brand column, sidebars)
 *   md = 40px (sign-in top-left, console sidebar)
 *   lg = 64px (404 hero, sign-in hero card, trip hero overlay)
 *
 * Source: `apps/web/public/brand/mark.svg`. This component inlines an
 * equivalent version so it composes cleanly with `currentColor` swaps.
 * Keep the two in sync — the file is the public asset; the inline is
 * the size+role-tagged component.
 */
export type BrandMarkSize = "sm" | "md" | "lg";
export type BrandMarkTone = "light" | "dark" | "mark";

export interface BrandMarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: BrandMarkSize;
  tone?: BrandMarkTone;
  /** Optional accessible label override. Defaults to "Rumia". */
  label?: string;
}

const sizeClassName: Record<BrandMarkSize, string> = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16"
};

export function BrandMark({
  size = "md",
  tone = "light",
  label = "Rumia",
  className,
  ...props
}: BrandMarkProps) {
  // `mark` tone auto-swaps via CSS so consumers can drop the mark into a
  // dark hero card without threading a prop through the call site. The
  // `.on-dark` selector lives in `app/globals.css` and inverts the
  // currentColor on a per-context basis.
  const toneClassName =
    tone === "dark"
      ? "text-cream [&_path[fill='#CE933F']]:fill-[#EAB875]"
      : tone === "mark"
        ? "text-primary [.on-dark_&]:text-cream"
        : "text-primary";

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center align-middle shrink-0",
        sizeClassName[size],
        toneClassName,
        className
      )}
      data-testid="brand-mark"
      data-tone={tone}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        className="h-full w-full"
        aria-hidden
      >
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3 11 A8 8 0 0 1 11 3"
          stroke="#CE933F"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          className="[&_path]:stroke-current"
        />
        <path
          d="M53 3 A8 8 0 0 1 61 11"
          stroke="#CE933F"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M61 53 A8 8 0 0 1 53 61"
          stroke="#CE933F"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M11 61 A8 8 0 0 1 3 53"
          stroke="#CE933F"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M21 13 L25 11 L25 15 L25 48 L25 52 L21 50 Z"
          fill="currentColor"
        />
        <path
          d="M24 11 L38 11 C44 11 46 14 46 19 C46 24 44 27 38 28 L33 28 L46 49 L42 52 L31 32 L24 32 Z"
          fill="#CE933F"
        />
      </svg>
    </span>
  );
}
