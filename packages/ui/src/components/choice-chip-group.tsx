"use client";

import { type JSX, useId } from "react";
import { ChipGroup } from "./form-primitives";
import { cn } from "../lib/cn";

export type ChoiceGroupOption = {
  value: string;
  label: string;
  description?: string;
  consequence?: string;
  imageSrc?: string;
};

export function ChoiceChipGroup(props: {
  label: string;
  options: ChoiceGroupOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  labelClassName?: string;
}): JSX.Element {
  const labelId = useId();
  const multiple = props.multiple ?? true;
  const options = props.options.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.description ?? option.consequence
  }));

  function handleSingleChange(value: string): void {
    props.onChange([value]);
  }

  return (
    <section className="grid gap-3">
      <p id={labelId} className={cn("text-sm font-medium text-[var(--color-foreground)]", props.labelClassName)}>
        {props.label}
      </p>
      {multiple ? (
        <ChipGroup
          multiple
          ariaLabel={props.label}
          aria-labelledby={labelId}
          options={options}
          value={props.selected}
          onChange={props.onChange}
        />
      ) : (
        <ChipGroup
          multiple={false}
          ariaLabel={props.label}
          aria-labelledby={labelId}
          options={options}
          value={props.selected[0] ?? null}
          onChange={handleSingleChange}
        />
      )}
    </section>
  );
}
