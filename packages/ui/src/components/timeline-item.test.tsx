import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { expect, test, describe, vi, afterEach } from "vitest"
import { ItineraryTimeline, TimelineDay } from "./timeline-item"

afterEach(() => {
  cleanup()
})

const mockDays: TimelineDay[] = [
  {
    id: "day-1",
    dateLabel: "Day 1: Arrival",
    activities: [
      {
        id: "act-1",
        timeLabel: "10:00 AM",
        title: "Check-in at Hotel",
        description: "Drop off your bags and freshen up.",
      },
      {
        id: "act-2",
        timeLabel: "1:00 PM",
        title: "Lunch at Central Market",
        description: "Enjoy some local cuisine.",
      },
    ],
  },
  {
    id: "day-2",
    dateLabel: "Day 2: City Tour",
    activities: [
      {
        id: "act-3",
        title: "Premium Museum Tour",
        locked: true,
        lockedTeaser: "Unlock to see museum details and exclusive access.",
        description: "Full museum details you should not see when locked.",
      },
    ],
  },
]

describe("ItineraryTimeline", () => {
  test("renders chronological/day labels correctly", () => {
    render(<ItineraryTimeline days={mockDays} />)
    
    expect(screen.getByText("Day 1: Arrival")).toBeDefined()
    expect(screen.getByText("Day 2: City Tour")).toBeDefined()
    expect(screen.getByText("Check-in at Hotel")).toBeDefined()
    expect(screen.getByText("10:00 AM")).toBeDefined()
  })

  test("does not render descriptions when not active", () => {
    render(<ItineraryTimeline days={mockDays} activeActivityId={null} />)
    
    expect(screen.queryByText("Drop off your bags and freshen up.")).toBeNull()
  })

  test("renders description when activity is active", () => {
    render(<ItineraryTimeline days={mockDays} activeActivityId="act-1" />)
    
    expect(screen.getByText("Drop off your bags and freshen up.")).toBeDefined()
  })

  test("triggers callback on selection", () => {
    const handleSelect = vi.fn()
    render(<ItineraryTimeline days={mockDays} onActivitySelect={handleSelect} />)
    
    const button = screen.getByText("Check-in at Hotel").closest("button")
    fireEvent.click(button!)
    
    expect(handleSelect).toHaveBeenCalledWith("act-1")
  })

  test("renders locked state and hides full description", () => {
    render(<ItineraryTimeline days={mockDays} />)
    
    expect(screen.getByText("Premium")).toBeDefined()
    expect(screen.getByText("Unlock to see museum details and exclusive access.")).toBeDefined()
    expect(screen.queryByText("Full museum details you should not see when locked.")).toBeNull()
  })

  test("does not trigger callback in readOnly mode", () => {
    const handleSelect = vi.fn()
    render(<ItineraryTimeline days={mockDays} readOnly onActivitySelect={handleSelect} />)
    
    const button = screen.getByText("Check-in at Hotel").closest("button")
    expect(button?.hasAttribute("disabled")).toBe(true)
    fireEvent.click(button!)
    
    expect(handleSelect).not.toHaveBeenCalled()
  })

  test("does not trigger callback when locked", () => {
    const handleSelect = vi.fn()
    render(<ItineraryTimeline days={mockDays} onActivitySelect={handleSelect} />)
    
    const button = screen.getByText("Premium Museum Tour").closest("button")
    expect(button?.hasAttribute("disabled")).toBe(true)
    fireEvent.click(button!)
    
    expect(handleSelect).not.toHaveBeenCalled()
  })
})
