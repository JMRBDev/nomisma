import type { RecurringRuleDoc } from "./types"

export function monthKeyFromDate(date: string) {
  return date.slice(0, 7)
}

function parseDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(dayKey: string, days: number) {
  const next = parseDayKey(dayKey)
  next.setUTCDate(next.getUTCDate() + days)
  return toDayKey(next)
}

export function addFrequency(
  dayKey: string,
  frequency: RecurringRuleDoc["frequency"]
) {
  const next = parseDayKey(dayKey)

  if (frequency === "daily") next.setUTCDate(next.getUTCDate() + 1)
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7)
  if (frequency === "monthly") next.setUTCMonth(next.getUTCMonth() + 1)
  if (frequency === "yearly") next.setUTCFullYear(next.getUTCFullYear() + 1)

  return toDayKey(next)
}

export function getCurrentCalendarMonth(now: Date) {
  return now.toISOString().slice(0, 7)
}

export function getCurrentCalendarMonthRange(now: Date) {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 0))

  return {
    start: toDayKey(start),
    end: toDayKey(end),
  }
}

export function inRange(dayKey: string, start: string, end: string) {
  return dayKey >= start && dayKey <= end
}

export function getBudgetStatus(progress: number) {
  if (progress >= 1) return "over" as const
  if (progress >= 0.8) return "near" as const
  return "healthy" as const
}
