"use client";

import type { ReactNode } from "react";

export type KanbanBadgeTone = "error" | "ochre" | "ochre-dark" | "neutral";

import * as React from "react";

export interface KanbanCardProps {
  title: string;
  body: string;
  clientName: string;
  badge?: { label: ReactNode; tone: KanbanBadgeTone };
  indicator?: ReactNode;
  avatar?: { src?: string; initials?: string; alt: string };
  accent?: "ochre";
  onClick?: () => void;
  /** Set false when the parent owns keyboard/drag interaction. */
  interactive?: boolean;
}

const badgeToneClass: Record<KanbanBadgeTone, string> = {
  error: "text-error bg-error-container/30",
  ochre: "text-ochre-dark bg-secondary-container/30",
  "ochre-dark": "text-ochre-dark bg-ochre-light/20",
  neutral: "text-on-surface-variant bg-surface-container-high",
};

export function KanbanCard({
  title,
  body,
  clientName,
  badge,
  indicator,
  avatar,
  accent,
  onClick,
  interactive = true,
}: KanbanCardProps) {
  const cardClassName = [
    "bg-surface-container-lowest p-4 rounded-lg shadow-sm border",
    interactive ? "cursor-grab active:cursor-grabbing" : "",
    interactive ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre-light focus-visible:ring-offset-2" : "",
    accent === "ochre"
      ? "border-l-2 border-l-ochre-light"
      : "border-olive-dark/5 hover:border-olive-dark/20",
  ].join(" ");

  const content = (
    <>
      <header className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-headline-sm text-headline-sm text-primary leading-tight">
          {title}
        </h3>
        {badge ? (
          <span
            className={`font-mono-micro text-mono-micro uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap ${badgeToneClass[badge.tone]}`}
          >
            {badge.label}
          </span>
        ) : null}
      </header>
      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
        {body}
      </p>
      <footer className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {avatar ? (
            avatar.src ? (
              <img
                src={avatar.src}
                alt={avatar.alt}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="w-6 h-6 rounded-full bg-olive-light text-on-primary text-[10px] font-mono-technical font-medium flex items-center justify-center"
              >
                {avatar.initials}
              </span>
            )
          ) : null}
          <span className="font-label-ui text-label-ui text-primary truncate">
            {clientName}
          </span>
        </div>
        {indicator}
      </footer>
    </>
  );

  if (!interactive) {
    return <article className={cardClassName}>{content}</article>;
  }

  return (
    <div
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`${title} — ${clientName}`}
      className={cardClassName}
    >
      {content}
    </div>
  );
}
