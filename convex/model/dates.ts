import type { RecurringRuleDoc } from "./types"

function padNumber(value: number) {
  return value.toString().padStart(2, "0")
}

export function monthKeyFromDate(date: string) {
  return date.slice(0, 7)
}

function parseDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function toDayKey(date: Date) {
  return [
    date.getUTCFullYear(),
    padNumber(date.getUTCMonth() + 1),
    padNumber(date.getUTCDate()),
  ].join("-")
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
  return `${now.getUTCFullYear()}-${padNumber(now.getUTCMonth() + 1)}`
}

export function getCalendarMonthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()

  return {
    start: `${monthKey}-01`,
    end: `${monthKey}-${padNumber(lastDay)}`,
  }
}

export function getCurrentCalendarMonthRange(now: Date) {
  return getCalendarMonthRange(getCurrentCalendarMonth(now))
}

export function dayKeyDistance(startDayKey: string, endDayKey: string) {
  return Math.round(
    (parseDayKey(endDayKey).getTime() - parseDayKey(startDayKey).getTime()) /
      86400000
  )
}

export function inRange(dayKey: string, start: string, end: string) {
  return dayKey >= start && dayKey <= end
}

export function getBudgetStatus(progress: number) {
  if (progress >= 1) return "over" as const
  if (progress >= 0.8) return "near" as const
  return "healthy" as const
}
