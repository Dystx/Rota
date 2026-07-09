"use client";

import { Card } from "./card";
import type { JSX } from "react";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { cn } from "../lib/cn";

export function ChoiceCard(props: {
  id: string;
  name: string;
  value: string;
  label: string;
  description: string;
  consequence?: string;
  imageSrc?: string;
  selected: boolean;
  onSelect: (value: string) => void;
}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const localImageSrc = props.imageSrc?.startsWith("/") ? props.imageSrc : undefined;

  return (
    <button
      id={props.id}
      name={props.name}
      type="button"
      role="radio"
      aria-checked={props.selected}
      data-selected={props.selected || undefined}
      onClick={() => props.onSelect(props.value)}
      className={cn(
        "w-full rounded-xl text-left focus-visible:outline-none focus-visible:shadow-focus",
        !reducedMotion && "transition-transform duration-base ease-standard active:scale-[0.99]"
      )}
    >
      <Card
        as="span"
        padding="none"
        className={cn(
          "grid gap-3 p-5",
          props.selected
            ? "border-[var(--color-accent)] bg-olive-light/10 shadow-focus"
            : "hover:border-[var(--color-accent)] hover:shadow-raised"
        )}
      >
        {localImageSrc ? (
          <img
            src={localImageSrc}
            alt=""
            className="h-36 w-full rounded-lg object-cover"
          />
        ) : null}
        <span className="grid gap-1">
          <span className="font-display text-title text-[var(--color-foreground)]">
            {props.label}
          </span>
          <span className="text-body leading-relaxed text-[var(--color-muted-foreground)]">
            {props.description}
          </span>
        </span>
        {props.consequence ? (
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {props.consequence}
          </span>
        ) : null}
      </Card>
    </button>
  );
}
