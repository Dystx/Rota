"use client";

import { type ReactNode, createContext, useContext, useId, useState } from "react";
import { cn } from "../lib/cn";

/**
 * Accordion — accessible disclosure primitive.
 *
 * PR-5 surface polish:
 *   - single or multiple open items (controlled or uncontrolled)
 *   - keyboard: Tab to focus trigger; Enter / Space to toggle
 *   - aria-expanded, aria-controls on each trigger
 *   - id-wired panel + button for screen readers
 *
 * No Radix dependency.
 */

interface AccordionContextValue {
  openItems: string[];
  toggle: (value: string) => void;
  baseId: string;
  collapsible: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion(component: string) {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <Accordion>.`);
  }
  return ctx;
}

export interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}

function toArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export function Accordion({
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  collapsible = true,
  className,
  children
}: AccordionProps) {
  const baseId = useId();
  const [internal, setInternal] = useState<string[]>(toArray(defaultValue));
  const openItems = controlledValue === undefined ? internal : toArray(controlledValue);

  const toggle = (item: string) => {
    let next: string[];
    if (type === "single") {
      next = openItems.includes(item)
        ? collapsible
          ? []
          : openItems
        : [item];
    } else {
      next = openItems.includes(item)
        ? openItems.filter((v) => v !== item)
        : [...openItems, item];
    }
    if (controlledValue === undefined) setInternal(next);
    if (type === "single") {
      onValueChange?.(next[0] ?? "");
    } else {
      onValueChange?.(next);
    }
  };

  return (
    <AccordionContext.Provider
      value={{ openItems, toggle, baseId, collapsible }}
    >
      <div className={cn("grid gap-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}
export interface AccordionItemProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function AccordionItem({ value, className, children }: AccordionItemProps) {
  return (
    <div
      data-value={value}
      className={cn(
        "rounded-md border border-[var(--color-border)] bg-white/60 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface AccordionTriggerProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function AccordionTrigger({ value, className, children }: AccordionTriggerProps) {
  const { openItems, toggle, baseId } = useAccordion("AccordionTrigger");
  const isOpen = openItems.includes(value);
  const panelId = `${baseId}-panel-${value}`;
  return (
    <h3 className="m-0">
      <button
        type="button"
        id={`${baseId}-trigger-${value}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => toggle(value)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 h-12 text-left",
          "font-medium text-[15px] text-[var(--color-foreground)]",
          "transition-colors duration-fast ease-standard",
          "hover:bg-olive-light/5",
          "focus-visible:outline-none focus-visible:shadow-focus",
          className
        )}
      >
        <span>{children}</span>
        <span
          aria-hidden
          className={cn(
            "material-symbols-outlined text-[20px] text-olive-light transition-transform duration-base ease-standard",
            isOpen && "rotate-180"
          )}
        >
          expand_more
        </span>
      </button>
    </h3>
  );
}

export interface AccordionContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function AccordionContent({ value, className, children }: AccordionContentProps) {
  const { openItems, baseId } = useAccordion("AccordionContent");
  const isOpen = openItems.includes(value);
  if (!isOpen) return null;
  return (
    <div
      id={`${baseId}-panel-${value}`}
      role="region"
      aria-labelledby={`${baseId}-trigger-${value}`}
      className={cn(
        "px-4 py-3 text-body text-[var(--color-muted-foreground)] border-t border-[var(--color-border)]",
        className
      )}
    >
      {children}
    </div>
  );
}
