"use client";

import { type JSX, useId } from "react";
import { ChipGroup } from "./form-primitives";

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
}): JSX.Element {
  const labelId = useId();
  const multiple = props.multiple ?? true;

  function handleChange(values: string[]): void {
    props.onChange(multiple ? values : values.slice(-1));
  }

  return (
    <section className="grid gap-3">
      <p id={labelId} className="text-sm font-medium text-[var(--color-foreground)]">
        {props.label}
      </p>
      <ChipGroup
        multiple
        ariaLabel={props.label}
        aria-labelledby={labelId}
        options={props.options.map((option) => ({
          value: option.value,
          label: option.label,
          description: option.description ?? option.consequence
        }))}
        value={multiple ? props.selected : props.selected.slice(0, 1)}
        onChange={handleChange}
      />
    </section>
  );
}
