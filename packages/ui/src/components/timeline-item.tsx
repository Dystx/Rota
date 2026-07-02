"use client"

import * as React from "react"
import { m, useReducedMotion, AnimatePresence } from "motion/react"
import { cn } from "../lib/cn"

export interface TimelineActivity {
  id: string
  timeLabel?: string
  title: string
  description?: string
  locked?: boolean
  lockedTeaser?: string
}

export interface TimelineDay {
  id: string
  dateLabel: string
  activities: TimelineActivity[]
}

export interface ItineraryTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  days: TimelineDay[]
  activeActivityId?: string | null
  onActivitySelect?: (activityId: string) => void
  readOnly?: boolean
}

export function ItineraryTimeline({
  days,
  activeActivityId,
  onActivitySelect,
  readOnly = false,
  className,
  ...props
}: ItineraryTimelineProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {days.map((day, dayIndex) => (
        <TimelineDaySection
          key={day.id}
          day={day}
          isLastDay={dayIndex === days.length - 1}
          activeActivityId={activeActivityId}
          onActivitySelect={onActivitySelect}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

interface TimelineDaySectionProps {
  day: TimelineDay
  isLastDay: boolean
  activeActivityId?: string | null
  onActivitySelect?: (id: string) => void
  readOnly: boolean
}

function TimelineDaySection({
  day,
  isLastDay,
  activeActivityId,
  onActivitySelect,
  readOnly,
}: TimelineDaySectionProps) {
  return (
    <div className="relative pl-6 pb-8 md:pl-8 md:pb-12">
      <div 
        className={cn(
          "absolute left-0 top-3 bottom-0 w-[2px] bg-[var(--color-aqua)]",
          isLastDay && "bottom-auto h-full"
        )}
      />

      <div className="relative mb-6">
        <div className="absolute -left-6 top-1.5 md:-left-8 w-4 h-4 rounded-full bg-[var(--color-atlantic)] -translate-x-[7px] border-2 border-[var(--color-paper)]" />
        <h3 className="font-display text-xl md:text-2xl text-[var(--color-ink)]">
          {day.dateLabel}
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {day.activities.map((activity, i) => (
          <TimelineItem
            key={activity.id}
            activity={activity}
            isActive={activeActivityId === activity.id}
            onSelect={() => !readOnly && onActivitySelect?.(activity.id)}
            readOnly={readOnly}
            isLast={isLastDay && i === day.activities.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

interface TimelineItemProps {
  activity: TimelineActivity
  isActive: boolean
  onSelect?: () => void
  readOnly: boolean
  isLast: boolean
}

export function TimelineItem({
  activity,
  isActive,
  onSelect,
  readOnly,
}: TimelineItemProps) {
  const shouldReduceMotion = useReducedMotion()
  const isLocked = activity.locked

  return (
    <div className="relative group">
      <div 
        className={cn(
          "absolute -left-6 top-1.5 md:-left-8 w-2 h-2 rounded-full -translate-x-[3px] border border-[var(--color-paper)] transition-colors duration-300",
          isActive ? "bg-[var(--color-atlantic)]" : "bg-[var(--color-aqua)] group-hover:bg-[var(--color-atlantic)]"
        )} 
      />

      <button
        type="button"
        disabled={readOnly || isLocked}
        onClick={onSelect}
        className={cn(
          "w-full text-left flex flex-col gap-1 p-3 -mt-3 rounded-[var(--radius-soft)] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-aqua)]",
          !readOnly && !isLocked && "hover:bg-[var(--color-row-hover)] cursor-pointer",
          isActive && "bg-[var(--color-row-hover)]",
          (readOnly || isLocked) && "cursor-default"
        )}
        aria-current={isActive ? "step" : undefined}
      >
        <div className="flex items-baseline gap-3">
          {activity.timeLabel && (
            <span className="font-display text-sm md:text-base text-[var(--color-atlantic)] shrink-0">
              {activity.timeLabel}
            </span>
          )}
          <span className="font-body text-base md:text-lg text-[var(--color-ink)] font-medium">
            {activity.title}
          </span>
          {isLocked && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)] border border-[var(--color-status-warning-border)]">
              Premium
            </span>
          )}
        </div>
      </button>

      {shouldReduceMotion ? (
        (isActive || isLocked) && (
          <div className="overflow-hidden">
            <div className="pl-3 md:pl-[4.5rem] pr-3 pb-4 pt-1 text-[var(--color-muted-foreground)] text-sm md:text-base leading-relaxed">
              {isLocked ? (
                <span className="italic">{activity.lockedTeaser || "Unlock this itinerary to view full details."}</span>
              ) : (
                activity.description
              )}
            </div>
          </div>
        )
      ) : (
        <AnimatePresence initial={false}>
          {(isActive || isLocked) && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pl-3 md:pl-[4.5rem] pr-3 pb-4 pt-1 text-[var(--color-muted-foreground)] text-sm md:text-base leading-relaxed">
                {isLocked ? (
                  <span className="italic">{activity.lockedTeaser || "Unlock this itinerary to view full details."}</span>
                ) : (
                  activity.description
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
