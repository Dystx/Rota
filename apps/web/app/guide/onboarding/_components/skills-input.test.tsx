import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SkillsInput } from "./skills-input";

afterEach(() => cleanup());

describe("SkillsInput", () => {
  it("renders the draft input and Add button", () => {
    render(<SkillsInput value={[]} onChange={() => {}} />);
    expect(screen.getByTestId("skills-input-draft")).toBeDefined();
    expect(screen.getByTestId("skills-input-add")).toBeDefined();
  });

  it("renders existing skills as chips", () => {
    render(
      <SkillsInput
        value={["Sintra Expert", "Wine Tours"]}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Sintra Expert")).toBeDefined();
    expect(screen.getByText("Wine Tours")).toBeDefined();
  });

  it("appends a chip when the user clicks Add", () => {
    const onChange = vi.fn();
    render(<SkillsInput value={[]} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("skills-input-draft"), {
      target: { value: "Sintra Expert" }
    });
    fireEvent.click(screen.getByTestId("skills-input-add"));
    expect(onChange).toHaveBeenCalledWith(["Sintra Expert"]);
  });

  it("appends a chip when the user presses Enter", () => {
    const onChange = vi.fn();
    render(<SkillsInput value={[]} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("skills-input-draft"), {
      target: { value: "Wine Tours" }
    });
    fireEvent.keyDown(screen.getByTestId("skills-input-draft"), {
      key: "Enter"
    });
    expect(onChange).toHaveBeenCalledWith(["Wine Tours"]);
  });

  it("trims whitespace and dedupes case-insensitively", () => {
    const onChange = vi.fn();
    render(<SkillsInput value={["Sintra Expert"]} onChange={onChange} />);
    // "  SINTRA EXPERT  " trimmed and lower-cased is a
    // duplicate of the existing "Sintra Expert".
    fireEvent.change(screen.getByTestId("skills-input-draft"), {
      target: { value: "  SINTRA EXPERT  " }
    });
    fireEvent.click(screen.getByTestId("skills-input-add"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("skills-input-error").textContent).toMatch(
      /already/i
    );
  });

  it("adds a different (non-duplicate) trimmed value", () => {
    const onChange = vi.fn();
    render(<SkillsInput value={["Sintra Expert"]} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("skills-input-draft"), {
      target: { value: "  Wine Tours  " }
    });
    fireEvent.click(screen.getByTestId("skills-input-add"));
    expect(onChange).toHaveBeenCalledWith(["Sintra Expert", "Wine Tours"]);
  });

  it("removes a chip when the X is clicked", () => {
    const onChange = vi.fn();
    render(
      <SkillsInput
        value={["Sintra Expert", "Wine Tours"]}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByTestId("skills-input-remove-sintra-expert"));
    expect(onChange).toHaveBeenCalledWith(["Wine Tours"]);
  });

  it("rejects skills longer than 80 chars (DB constraint mirror)", () => {
    const onChange = vi.fn();
    render(<SkillsInput value={[]} onChange={onChange} />);
    const tooLong = "a".repeat(81);
    fireEvent.change(screen.getByTestId("skills-input-draft"), {
      target: { value: tooLong }
    });
    fireEvent.click(screen.getByTestId("skills-input-add"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("skills-input-error").textContent).toMatch(
      /80 characters/
    );
  });
});
