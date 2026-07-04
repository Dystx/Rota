import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { specialistLanguageLabels, specialistLanguages } from "@repo/types";
import { LanguagesPicker } from "./languages-picker";

afterEach(() => cleanup());

describe("LanguagesPicker", () => {
  it("renders one checkbox per allowed language, with the friendly label", () => {
    render(<LanguagesPicker value={[]} onChange={() => {}} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(
      specialistLanguages.length
    );
    for (const lang of specialistLanguages) {
      expect(screen.getByText(specialistLanguageLabels[lang])).toBeDefined();
    }
  });

  it("checks the boxes whose values are in the input list", () => {
    render(<LanguagesPicker value={["en", "pt"]} onChange={() => {}} />);
    expect(
      (screen.getByTestId("languages-picker-en") as HTMLInputElement).checked
    ).toBe(true);
    expect(
      (screen.getByTestId("languages-picker-pt") as HTMLInputElement).checked
    ).toBe(true);
    expect(
      (screen.getByTestId("languages-picker-es") as HTMLInputElement).checked
    ).toBe(false);
  });

  it("fires onChange with the new full set when the user toggles a box", () => {
    const onChange = vi.fn();
    render(<LanguagesPicker value={["en"]} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("languages-picker-pt"));
    expect(onChange).toHaveBeenCalledWith(["en", "pt"]);
  });

  it("removes a language when the user un-toggles a box", () => {
    const onChange = vi.fn();
    render(<LanguagesPicker value={["en", "pt"]} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("languages-picker-en"));
    expect(onChange).toHaveBeenCalledWith(["pt"]);
  });

  it("ignores unknown language ids in the input (forward-compatible)", () => {
    render(
      <LanguagesPicker
        value={["en", "klingon", "pt"]}
        onChange={() => {}}
      />
    );
    // klingon is unknown — it must not check any box.
    expect(
      (screen.getByTestId("languages-picker-en") as HTMLInputElement).checked
    ).toBe(true);
    expect(
      (screen.getByTestId("languages-picker-pt") as HTMLInputElement).checked
    ).toBe(true);
    expect(screen.getAllByRole("checkbox")).toHaveLength(
      specialistLanguages.length
    );
  });
});
