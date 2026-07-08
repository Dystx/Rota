"use client";

import { type ReactNode, createContext, useContext, useId, useState } from "react";
import { cn } from "../lib/cn";

/**
 * Tabs — accessible tabs primitive (WAI-ARIA Authoring Practices).
 *
 * PR-5 surface polish:
 *   - roving-tabindex + arrow-key navigation
 *   - keyboard: Left/Right cycle tabs; Home/End jump to first/last
 *   - each TabPanel has role=tabpanel + aria-labelledby
 *   - orientation defaults to "horizontal"; can be "vertical"
 *
 * No Radix dependency — the contract is small enough to ship directly.
 */

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  orientation: "horizontal" | "vertical";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  }
  return ctx;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children: ReactNode;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = "horizontal",
  className,
  children
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;
  const baseId = useId();

  const setValue = (next: string) => {
    if (controlledValue === undefined) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue, baseId, orientation }}>
      <div
        className={cn("grid gap-3", className)}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  className?: string;
  children: ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  const { orientation, baseId } = useTabs("TabsList");
  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-full bg-olive-light/10 border border-olive-light/20",
        className
      )}
      onKeyDown={(e) => {
        if (orientation !== "horizontal") return;
        const tabs = Array.from(
          (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
            '[role="tab"]'
          )
        );
        const idx = tabs.findIndex((t) => t === document.activeElement);
        if (idx === -1) return;
        let next = idx;
        if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
        else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        else return;
        e.preventDefault();
        const target = tabs[next];
        if (target) {
          target.focus();
          target.click();
        }
      }}
      data-testid={`${baseId}-list`}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const { value: selected, setValue, baseId } = useTabs("TabsTrigger");
  const isSelected = selected === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isSelected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => setValue(value)}
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "px-4 h-9 rounded-full text-[13px] font-medium transition-all duration-base ease-standard",
        "focus-visible:outline-none focus-visible:shadow-focus",
        isSelected
          ? "bg-white text-ink shadow-flat"
          : "text-olive-light hover:text-ink",
        className
      )}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: selected, baseId } = useTabs("TabsContent");
  if (selected !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cn("focus-visible:outline-none focus-visible:shadow-focus rounded-md", className)}
    >
      {children}
    </div>
  );
}
