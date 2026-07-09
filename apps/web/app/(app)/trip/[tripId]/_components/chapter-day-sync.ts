/** Chapters only exist for geocoded stops. Keep the selected day stable when
 * navigation lands on a day that has no map coordinates yet. */
export function deriveSelectedDayFromChapter(
  chapterId: string | undefined,
  days: readonly { dayIndex: number; stops: readonly ({ placeName?: string; lng?: number; lat?: number } | string)[] }[],
  previousDay?: number
): number | undefined {
  const match = chapterId?.match(/^day-(\d+)-/);
  const dayIndex = match?.[1] ? Number(match[1]) : undefined;
  if (!dayIndex) return previousDay;
  const day = days.find((item) => item.dayIndex === dayIndex);
  const hasGeocodedStops = (day?.stops ?? []).some(
    (stop) => typeof stop !== "string" && stop.lng !== undefined && stop.lat !== undefined
  );
  return hasGeocodedStops ? dayIndex : previousDay;
}
