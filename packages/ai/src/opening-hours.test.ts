import { describe, expect, it } from "vitest";
import {
  parseOpeningHours,
  validateVisit
} from "./opening-hours";

/** A helper to construct a `Date` for a specific UTC
 *  weekday + minute-of-day. Uses 2026-01-04 (a Sunday)
 *  as the base so dayOfWeek=0 maps to Sunday, 1=Monday,
 *  ..., 6=Saturday. */
function visitAt(dayOfWeek: number, hours: number, minutes: number): Date {
  const base = new Date("2026-01-04T00:00:00.000Z");
  const d = new Date(base);
  d.setUTCDate(base.getUTCDate() + dayOfWeek);
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

describe("parseOpeningHours", () => {
  it("returns null for empty / missing", () => {
    expect(parseOpeningHours(null)).toBeNull();
    expect(parseOpeningHours(undefined)).toBeNull();
    expect(parseOpeningHours("")).toBeNull();
    expect(parseOpeningHours("   ")).toBeNull();
  });

  it("parses 24/7 as a single all-day, all-week rule", () => {
    const rules = parseOpeningHours("24/7");
    expect(rules).toHaveLength(1);
    const rule = rules![0]!;
    expect(rule.days.size).toBe(7);
    expect(rule.startMin).toBe(0);
    expect(rule.endMin).toBe(24 * 60);
  });

  it("parses Mo-Fr 09:00-18:00", () => {
    const rules = parseOpeningHours("Mo-Fr 09:00-18:00");
    expect(rules).toHaveLength(1);
    const rule = rules![0]!;
    expect(rule.days).toEqual(new Set([1, 2, 3, 4, 5]));
    expect(rule.startMin).toBe(9 * 60);
    expect(rule.endMin).toBe(18 * 60);
  });

  it("parses Mo-Su (wrap-around from Mo to Su)", () => {
    const rules = parseOpeningHours("Mo-Su 09:00-22:00");
    expect(rules![0]!.days).toEqual(new Set([1, 2, 3, 4, 5, 6, 0]));
  });

  it("parses We 10:00-12:00 (single day)", () => {
    const rules = parseOpeningHours("We 10:00-12:00");
    expect(rules![0]!.days).toEqual(new Set([3]));
  });

  it("parses multiple time ranges in one day", () => {
    const rules = parseOpeningHours("Mo-Fr 09:00-13:30, 14:30-18:00");
    // Two rules, same days, different time ranges.
    expect(rules).toHaveLength(2);
    expect(rules![0]!.startMin).toBe(9 * 60);
    expect(rules![0]!.endMin).toBe(13 * 60 + 30);
    expect(rules![1]!.startMin).toBe(14 * 60 + 30);
    expect(rules![1]!.endMin).toBe(18 * 60);
  });

  it("parses multiple day rules separated by ;", () => {
    const rules = parseOpeningHours("Mo-Fr 09:00-18:00; Sa 10:00-14:00");
    expect(rules).toHaveLength(2);
    expect(rules![0]!.days).toEqual(new Set([1, 2, 3, 4, 5]));
    expect(rules![1]!.days).toEqual(new Set([6]));
  });

  it("parses PH off as a closed rule", () => {
    const rules = parseOpeningHours("PH off");
    expect(rules).toHaveLength(1);
    expect(rules![0]!.closed).toBe(true);
  });

  it("returns null for unparseable input", () => {
    expect(parseOpeningHours("not-a-rule")).toBeNull();
    expect(parseOpeningHours("Mo-Fr forever")).toBeNull();
  });
});

describe("validateVisit", () => {
  it("returns absent for empty opening hours", () => {
    const result = validateVisit(null, visitAt(1, 12, 0));
    expect(result).toEqual({ kind: "absent" });
  });

  it("returns open for 24/7", () => {
    const result = validateVisit("24/7", visitAt(0, 3, 0));
    expect(result).toEqual({ kind: "open" });
  });

  it("returns open during Mo-Fr 09:00-18:00", () => {
    // Monday at 12:00 — within hours
    expect(validateVisit("Mo-Fr 09:00-18:00", visitAt(1, 12, 0))).toEqual({
      kind: "open"
    });
    // Monday at 09:00 — boundary, inclusive
    expect(validateVisit("Mo-Fr 09:00-18:00", visitAt(1, 9, 0))).toEqual({
      kind: "open"
    });
    // Monday at 17:59 — still open
    expect(validateVisit("Mo-Fr 09:00-18:00", visitAt(1, 17, 59))).toEqual({
      kind: "open"
    });
  });

  it("returns closed before/after hours", () => {
    // Monday at 08:59 — before opening
    expect(validateVisit("Mo-Fr 09:00-18:00", visitAt(1, 8, 59))).toEqual({
      kind: "closed"
    });
    // Monday at 18:00 — end is exclusive
    expect(validateVisit("Mo-Fr 09:00-18:00", visitAt(1, 18, 0))).toEqual({
      kind: "closed"
    });
  });

  it("returns closed on a non-Monday-Friday day", () => {
    // Saturday at 12:00 — outside Mo-Fr
    expect(validateVisit("Mo-Fr 09:00-18:00", visitAt(6, 12, 0))).toEqual({
      kind: "closed"
    });
    // Sunday at 12:00
    expect(validateVisit("Mo-Fr 09:00-18:00", visitAt(0, 12, 0))).toEqual({
      kind: "closed"
    });
  });

  it("handles multiple time ranges in one day", () => {
    // Lunch break: closed 13:30-14:30
    expect(
      validateVisit("Mo-Fr 09:00-13:30, 14:30-18:00", visitAt(1, 13, 45))
    ).toEqual({ kind: "closed" });
    // After lunch
    expect(
      validateVisit("Mo-Fr 09:00-13:30, 14:30-18:00", visitAt(1, 14, 30))
    ).toEqual({ kind: "open" });
  });

  it("handles multiple day rules", () => {
    // Saturday at 12:00 — covered by the second rule
    expect(validateVisit("Mo-Fr 09:00-18:00; Sa 10:00-14:00", visitAt(6, 12, 0))).toEqual({
      kind: "open"
    });
    // Saturday at 15:00 — outside the Saturday window
    expect(validateVisit("Mo-Fr 09:00-18:00; Sa 10:00-14:00", visitAt(6, 15, 0))).toEqual({
      kind: "closed"
    });
  });

  it("returns unknown for unparseable data", () => {
    const result = validateVisit("totally-broken-syntax", visitAt(1, 12, 0));
    expect(result.kind).toBe("unknown");
  });
});
