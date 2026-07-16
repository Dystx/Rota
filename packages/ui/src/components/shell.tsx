import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function PageShell({
  className,
  children,
  variant = "marketing",
  bare = false
}: HTMLAttributes<HTMLDivElement> & {
  variant?: "marketing" | "app" | "reviewer" | "admin";
  /**
   * When true, suppresses the built-in Cinematic Concierge header so the page
   * can be wrapped externally with a shared TopNav + SiteFooter (used by the
   * marketing pages that match the prototype's visual identity).
   */
  bare?: boolean;
}) {
  return (
    <div
      data-layout-variant={variant}
      data-shell-bare={bare ? "true" : "false"}
      className={cn("rumia-page-shell rumia-page-enter", className)}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  h1
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  h1?: boolean;
}) {
  const TitleTag = h1 ? "h1" : "h2";
  return (
    <div className={cn("grid gap-3", className)}>
      <p className="text-xs uppercase tracking-widest text-ochre-dark font-medium">{eyebrow}</p>
      <div className="grid gap-3 lg:max-w-4xl">
        <TitleTag className="font-display text-primary text-4xl md:text-5xl leading-tight tracking-tight">{title}</TitleTag>
        <p className="text-on-surface-variant leading-loose text-lg">{description}</p>
      </div>
    </div>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex w-fit items-center gap-3 rounded-full border border-[var(--color-border)] bg-white/50 backdrop-blur-sm px-4 py-2 text-[11px] text-[var(--color-muted-foreground)] shadow-sm">
      <span className="uppercase tracking-[0.2em] font-medium">{label}</span>
      <div className="h-3 w-px bg-[var(--color-border)]" />
      <span className="font-semibold text-[var(--color-foreground)] tracking-wide">{value}</span>
    </div>
  );
}

export function PlaceholderMap({ title = "Route map placeholder" }: { title?: string }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(177,232,251,0.15),rgba(247,250,249,0.8))] p-6 shadow-[0_8px_32px_rgba(24,28,28,0.04)] backdrop-blur-xl">
      <div className="grid gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-ochre-dark font-medium">Map-first shell</p>
          <h3 className="font-display text-3xl text-[var(--color-foreground)]">
            {title}
          </h3>
        </div>
        <div className="relative h-[420px] overflow-hidden rounded-[24px] border border-white/60 bg-[radial-gradient(circle_at_top_left,rgba(48,101,118,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(187,201,201,0.45),transparent_30%),linear-gradient(135deg,#f7faf9,#ebeeed)]">
          <div className="absolute inset-x-10 top-16 h-px rotate-[-10deg] bg-[var(--color-accent)]/60" />
          <div className="absolute inset-x-20 top-52 h-px rotate-[8deg] bg-[var(--color-foreground)]/15" />
          <div className="absolute left-16 top-20 h-5 w-5 rounded-full bg-[var(--color-foreground)] ring-8 ring-white/60" />
          <div className="absolute right-20 top-40 h-4 w-4 rounded-full bg-[var(--color-secondary)] ring-8 ring-white/60" />
          <div className="absolute bottom-16 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-[var(--color-accent)] ring-8 ring-white/60" />
        </div>
      </div>
    </div>
  );
}
