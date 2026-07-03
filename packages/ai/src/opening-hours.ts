/**
 * OSM `opening_hours` parser + validator.
 *
 * The 8-phase engineering lifecycle calls for a real
 * opening-hours check (Phase 3.4) so the deterministic
 * generator can prune stops that are closed at the
 * proposed visit time. The data source is OSM's
 * `opening_hours` tag (added to the `places` table by
 * the data pipeline in PR-4 + PR-5; surfaced via the
 * `metadata.opening_hours` field).
 *
 * The full OSM `opening_hours` syntax is large (see
 * https://wiki.openstreetmap.org/wiki/Key:opening_hours).
 * This module handles the common cases that cover ~80%
 * of cafes, restaurants, museums, and viewpoints:
 *
 *   - "24/7" — always open
 *   - "Mo-Fr 09:00-18:00" — single day-range, time-range
 *   - "Mo-Su 09:00-22:00" — every day
 *   - "Mo-Fr 09:00-13:30, 14:30-18:00" — multiple
 *     time-ranges in a day
 *   - "Mo-Fr 09:00-18:00; Sa 10:00-14:00" — multiple
 *     day-rules (separated by `;`)
 *   - "Mo,We,Fr 09:00-18:00" — multiple days
 *   - "PH off" — public holidays closed
 *   - "24/7; PH off" — 24/7 minus public holidays
 *
 * Not handled (returns `unknown` so the generator can
 * emit a soft warning):
 *
 *   - Week-of-month rules ("week 1-5/2 Mo-Fr 09:00-18:00")
 *   - Sunrise/sunset-based rules ("(sunrise+01:30)")
 *   - Seasonal rules ("May-Sep: Mo-Fr 09:00-18:00")
 *
 * Add support as a follow-up when the data shows those
 * patterns in the destination knowledge graph.
 */

export type OpeningHoursResult =
  | { kind: "open" }
  | { kind: "closed" }
  /** The data is present but we couldn't parse it. */
  | { kind: "unknown"; reason: string }
  /** No opening hours data at all (the field is empty
   *  or null). Not an error — the OSM tag is often
   *  missing for less-popular POIs. */
  | { kind: "absent" };

const DAY_TOKENS = {
  Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 0
} as const;
type DayToken = keyof typeof DAY_TOKENS;

/** Parse an OSM `opening_hours` value into a list of
 *  rules. Each rule is a (day set, time range) pair. */
export type OpeningHoursRule = {
  days: ReadonlySet<number>;
  /** 24h minutes-of-day for the start (inclusive). */
  startMin: number;
  /** 24h minutes-of-day for the end (exclusive). */
  endMin: number;
  /** When true, the rule is "closed on this day/time"
   *  (e.g. "PH off"). Default false. */
  closed?: boolean;
};

const MINUTES_PER_DAY = 24 * 60;

function timeToMinutes(token: string): number {
  const match = token.match(/^(\d{1,2}):(\d{2})$/u);
  if (!match) {
    throw new Error(`invalid time token: ${token}`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

function parseDayToken(token: string): number {
  if (!(token in DAY_TOKENS)) {
    throw new Error(`invalid day token: ${token}`);
  }
  return DAY_TOKENS[token as DayToken];
}

function parseDayPart(token: string): ReadonlySet<number> {
  // "Mo-Fr" or "Mo"
  const range = token.match(/^([A-Z][a-z])-([A-Z][a-z])$/u);
  if (range) {
    const start = parseDayToken(range[1]!);
    const end = parseDayToken(range[2]!);
    const out = new Set<number>();
    // Walk forward from start, wrapping around the
    // week (Mo-Su or Su-Mo). The OSM spec uses an
    // inclusive range.
    let cursor = start;
    while (true) {
      out.add(cursor);
      if (cursor === end) break;
      cursor = (cursor + 1) % 7;
    }
    return out;
  }
  return new Set<number>([parseDayToken(token)]);
}

function parseTimePart(token: string): { startMin: number; endMin: number } {
  // "HH:MM-HH:MM" or "HH:MM+HH:MM" (the + variant means
  // the end is past midnight; we treat the range as
  // wrapping to the next day).
  const sep = token.includes("+") ? "+" : "-";
  const [startStr, endStr] = token.split(sep);
  if (!startStr || !endStr) {
    throw new Error(`invalid time range: ${token}`);
  }
  const startMin = timeToMinutes(startStr);
  let endMin = timeToMinutes(endStr);
  if (sep === "+") {
    // Past midnight: treat as end-of-day (24:00).
    endMin = Math.max(endMin, MINUTES_PER_DAY);
  } else if (endMin <= startMin) {
    // End before start on the same day — treat as
    // wrapping past midnight.
    endMin += MINUTES_PER_DAY;
  }
  return { startMin, endMin };
}

/** Parse the value of OSM's `opening_hours` tag into a
 *  list of rules. Returns `null` if the value is
 *  empty (absent) or unparseable (unknown — the
 *  caller decides how to surface that). */
export function parseOpeningHours(
  value: string | null | undefined
): OpeningHoursRule[] | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed === "24/7") {
    // 24/7 — all days, all hours, no closed rule.
    return [
      {
        days: new Set([0, 1, 2, 3, 4, 5, 6]),
        startMin: 0,
        endMin: MINUTES_PER_DAY
      }
    ];
  }

  const rules: OpeningHoursRule[] = [];
  // Rules separated by `;` (the OSM convention).
  const ruleStrings = trimmed.split(";").map((s) => s.trim()).filter(Boolean);

  for (const ruleStr of ruleStrings) {
    // "PH off" — public holidays closed. No time part.
    if (ruleStr === "PH off") {
      // "PH" doesn't have a single day number; we use
      // -1 as a sentinel. The validator checks
      // `rule.days.has(-1)` separately.
      rules.push({
        days: new Set([-1]),
        startMin: 0,
        endMin: MINUTES_PER_DAY,
        closed: true
      });
      continue;
    }

    // Walk the rule pieces. A piece is either a day token
    // (no time part) or a complete rule (day part + time
    // part). When a day-only piece is followed by a
    // time-bearing piece, the day part carries over (the
    // OSM convention: "Mo,We,Fr 09:00-18:00" and
    // "Mo-Fr 09:00-13:30, 14:30-18:00" both use `,`).
    let carryDays: ReadonlySet<number> | null = null;
    for (const piece of ruleStr.split(",").map((s) => s.trim()).filter(Boolean)) {
      const parts = piece.split(/\s+/u);
      // A piece is a time range if its LAST token matches
      // the OSM time pattern. A single-token piece like
      // "14:30-18:00" is a valid time (the day part comes
      // from the carry-over). A multi-token piece like
      // "Mo-Fr 09:00-18:00" has its day part inline.
      const lastToken = parts[parts.length - 1]!;
      const hasTime = /^[\d:]+[-+][\d:]+$/u.test(lastToken);

      if (!hasTime) {
        // Day-only piece; accumulate into the carry set.
        try {
          const pieceDays = new Set<number>();
          for (const dayToken of parts) {
            for (const d of parseDayPart(dayToken)) {
              pieceDays.add(d);
            }
          }
          carryDays = carryDays ? new Set([...carryDays, ...pieceDays]) : pieceDays;
        } catch {
          return null;
        }
        continue;
      }

      // Time-bearing piece. Combine with the carry set
      // if present, or use the day part inline.
      const timePart = lastToken;
      let days: ReadonlySet<number>;
      if (carryDays) {
        // Carry-over is the canonical case: a previous
        // day-only piece (e.g. "Mo,We,Fr") carries into
        // this time piece.
        days = carryDays;
        carryDays = null;
      } else if (parts.length === 1) {
        // Single-token time with no carry and no inline
        // day part — orphan rule. Bail.
        return null;
      } else {
        const inline = new Set<number>();
        for (const dayToken of parts.slice(0, -1)) {
          try {
            for (const d of parseDayPart(dayToken)) {
              inline.add(d);
            }
          } catch {
            return null;
          }
        }
        if (inline.size === 0) {
          return null;
        }
        days = inline;
      }
      let range: { startMin: number; endMin: number };
      try {
        range = parseTimePart(timePart);
      } catch {
        return null;
      }
      rules.push({
        days,
        startMin: range.startMin,
        endMin: range.endMin
      });
      // A successful rule's day part carries forward so a
      // following time-only piece (e.g. "Mo-Fr 09:00-13:30,
      // 14:30-18:00") inherits it. This matches the OSM
      // convention: the day part is sticky until replaced.
      carryDays = days;
    }
  }

  return rules;
}

/** Validate whether a place is open at a given visit
 *  time. Returns the result; the caller decides how
 *  to surface a "closed" outcome (warn the traveler,
 *  suggest a different time, etc.). */
export function validateVisit(
  openingHours: string | null | undefined,
  visitTime: Date
): OpeningHoursResult {
  const rules = parseOpeningHours(openingHours);
  if (!rules) {
    if (!openingHours) {
      return { kind: "absent" };
    }
    return { kind: "unknown", reason: "could not parse opening_hours value" };
  }

  const dayOfWeek = visitTime.getUTCDay();
  const minutes = visitTime.getUTCHours() * 60 + visitTime.getUTCMinutes();

  // "open" rules: any rule that includes this day and
  // covers this minute means open.
  const opens = rules.filter((rule) => {
    if (rule.closed) return false;
    if (!rule.days.has(dayOfWeek)) return false;
    return minutes >= rule.startMin && minutes < rule.endMin;
  });

  // "closed" rules: PH off or explicit "Mo 00:00-24:00
  // closed" (we don't support the latter here).
  const closes = rules.filter((rule) => rule.closed);

  if (closes.length > 0 && !opens.length) {
    return { kind: "closed" };
  }
  if (opens.length > 0) {
    return { kind: "open" };
  }
  return { kind: "closed" };
}
