import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function PageShell({
  className,
  children,
  variant = "marketing"
}: HTMLAttributes<HTMLDivElement> & {
  variant?: "marketing" | "app" | "reviewer" | "admin";
}) {
  return (
    <div className={cn("min-h-screen bg-[var(--color-background)] selection:bg-[var(--color-accent)]/30", className)}>
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(247,250,249,0.7)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 lg:px-12">
          <div className="flex items-center gap-4">
            <p className="font-[family-name:var(--font-rota-display)] text-2xl text-[var(--color-foreground)]">
              rumia.pt
            </p>
            <div className="h-4 w-px bg-[var(--color-border)]" />
            <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-[var(--color-muted-foreground)]">
              {variant === "marketing"
                ? "Portugal travel concierge"
                : variant === "reviewer"
                  ? "Reviewer workspace"
                  : variant === "admin"
                    ? "Admin CMS"
                    : "Trip planner"}
            </p>
          </div>
          <nav className="hidden gap-8 text-[13px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] md:flex">
            <a href="/" className="hover:text-[var(--color-foreground)] transition-colors">Home</a>
            <a href="/trip/new" className="hover:text-[var(--color-foreground)] transition-colors">Trip brief</a>
            <a href="/reviewer/queue" className="hover:text-[var(--color-foreground)] transition-colors">Reviewer</a>
            <a href="/admin/places" className="hover:text-[var(--color-foreground)] transition-colors">Admin</a>
          </nav>
        </div>
      </header>
      <main id="main-content" className="mx-auto grid max-w-[1400px] gap-20 px-6 py-16 lg:gap-32 lg:px-12 lg:py-24">{children}</main>
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
      <p className="rota-kicker">{eyebrow}</p>
      <div className="grid gap-3 lg:max-w-4xl">
        <TitleTag className="rota-heading">{title}</TitleTag>
        <p className="rota-muted text-lg">{description}</p>
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
          <p className="rota-kicker">Map-first shell</p>
          <h3 className="font-[family-name:var(--font-rota-display)] text-3xl text-[var(--color-foreground)]">
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
