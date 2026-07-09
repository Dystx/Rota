import type { ReactNode } from "react";

export type AnchorBadgeTone = "error" | "neutral" | "olive";

const badgeClass: Record<AnchorBadgeTone, string> = {
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
  olive: "bg-secondary-fixed text-on-secondary-fixed",
};

export interface ClientAnchorCardProps {
  icon: string;
  title: string;
  badge: { label: string; tone: AnchorBadgeTone };
  body: string;
  quote?: string;
  tags?: string[];
}

export function ClientAnchorCard({
  icon,
  title,
  badge,
  body,
  quote,
  tags,
}: ClientAnchorCardProps) {
  return (
    <article className="bg-surface-container-lowest border border-olive-dark/5 rounded-xl p-card-padding shadow-sm">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="ph text-ochre-dark"
          >
            {icon}
          </span>
          <h4 className="font-label-ui text-label-ui uppercase tracking-wider text-primary">
            {title}
          </h4>
        </div>
        <span
          className={`font-mono-micro text-mono-micro uppercase tracking-wider px-2 py-1 rounded ${badgeClass[badge.tone]}`}
        >
          {badge.label}
        </span>
      </header>
      <p className="font-body-md text-body-md text-on-surface mb-3">{body}</p>
      {quote ? (
        <blockquote className="italic text-on-surface-variant border-l-2 border-ochre-light pl-3 text-body-md">
          {quote}
        </blockquote>
      ) : null}
      {tags && tags.length ? (
        <ul className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <li
              key={tag}
              className="font-mono-micro text-mono-micro uppercase tracking-wider px-2 py-1 rounded bg-surface-container-high text-on-surface-variant"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export type AnchorChildren = ReactNode;