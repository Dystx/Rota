/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

afterEach(() => cleanup());

describe("Accordion", () => {
  it("renders the trigger but not the content initially", () => {
    render(
      <Accordion>
        <AccordionItem value="one">
          <AccordionTrigger value="one">First</AccordionTrigger>
          <AccordionContent value="one">Body 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByRole("button", { name: /First/ })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByText("Body 1")).not.toBeInTheDocument();
  });

  it("toggles the content on click", () => {
    render(
      <Accordion>
        <AccordionItem value="one">
          <AccordionTrigger value="one">First</AccordionTrigger>
          <AccordionContent value="one">Body 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByRole("button", { name: /First/ });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Body 1")).toBeInTheDocument();
  });
});
