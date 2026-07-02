import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TestimonialCard } from "./testimonial-card";

describe("TestimonialCard", () => {
  it("renders quote, author, and role", () => {
    render(
      <TestimonialCard author="Elena Rostova" role="Honeymoon Traveler">
        The itinerary was nothing short of perfection.
      </TestimonialCard>
    );
    expect(screen.getByText(/"?The itinerary was nothing short of perfection\.?"?/)).toBeDefined();
    expect(screen.getByText("Elena Rostova")).toBeDefined();
    expect(screen.getByText("Honeymoon Traveler")).toBeDefined();
  });

  it("renders avatar when provided", () => {
    render(
      <TestimonialCard 
        author="John Smith" 
        avatar={<img src="/avatar.jpg" alt="John" data-testid="avatar-img" />}
      >
        A remarkable journey.
      </TestimonialCard>
    );
    expect(screen.getByText("John Smith")).toBeDefined();
    expect(screen.getByTestId("avatar-img")).toBeDefined();
  });
});
