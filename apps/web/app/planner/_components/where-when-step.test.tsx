/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WhereStep } from "./where-step";
import { WhenStep } from "./when-step";

afterEach(cleanup);

describe("WhereStep", () => {
  it("offers supported destinations as choices without text controls", () => {
    const onChange = vi.fn();
    const { container } = render(<WhereStep value="portugal" onChange={onChange} />);

    expect(container.querySelectorAll("input, select, textarea")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /Portugal Change/i }));
    expect(screen.getByRole("radiogroup", { name: /destination/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /Lisbon/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /the Algarve/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /the Azores/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: /Porto/i }));
    expect(onChange).toHaveBeenCalledWith("porto");
  });

  it("keeps destination choices keyboard accessible", () => {
    const onChange = vi.fn();
    render(<WhereStep value="portugal" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Portugal Change/i }));
    const lisbon = screen.getByRole("radio", { name: /Lisbon/i });

    fireEvent.keyDown(lisbon, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("lisbon");
  });
});

describe("WhenStep", () => {
  it("offers duration and season choices without text controls", () => {
    const onChangeDays = vi.fn();
    const onChangeMonth = vi.fn();
    const { container } = render(
      <WhenStep days={7} month="" onChangeDays={onChangeDays} onChangeMonth={onChangeMonth} />
    );

    expect(container.querySelectorAll("input, select, textarea")).toHaveLength(0);
    expect(screen.getByRole("radiogroup", { name: /travel window/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Any time" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Spring" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Summer" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Autumn" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Winter" })).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Spring" }));
    expect(onChangeMonth).toHaveBeenCalledWith("spring");
  });

  it("supports choosing a season with the keyboard", () => {
    const onChangeDays = vi.fn();
    const onChangeMonth = vi.fn();
    render(<WhenStep days={7} month="" onChangeDays={onChangeDays} onChangeMonth={onChangeMonth} />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Winter" }), { key: " " });
    expect(onChangeMonth).toHaveBeenCalledWith("winter");
  });
});
