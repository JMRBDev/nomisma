import { format, lastDayOfMonth, parseISO } from "date-fns"
import { getLocale, toCalendarLocale } from "@/lib/i18n"

function padNumber(value: number) {
  return value.toString().padStart(2, "0")
}

function getDateParts(date: Date, timeZone?: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  }
}

export function toDayKey(date: Date = new Date(), timeZone?: string) {
  const { year, month, day } = getDateParts(date, timeZone)
  return `${year}-${padNumber(month)}-${padNumber(day)}`
}

export function toMonthKey(date: Date = new Date(), timeZone?: string) {
  const { year, month } = getDateParts(date, timeZone)
  return `${year}-${padNumber(month)}`
}

export function parseDayKey(dayKey: string) {
  return parseISO(dayKey)
}

export function formatDayKeyLabel(dayKey: string) {
  return new Intl.DateTimeFormat(toCalendarLocale(getLocale()), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDayKey(dayKey))
}

export function formatMonthKeyLabel(monthKey: string) {
  return new Intl.DateTimeFormat(toCalendarLocale(getLocale()), {
    month: "long",
    year: "numeric",
  }).format(parseISO(`${monthKey}-01`))
}

export function getMonthRange(monthKey: string) {
  const monthStart = parseISO(`${monthKey}-01`)
  const monthEnd = lastDayOfMonth(monthStart)

  return {
    start: format(monthStart, "yyyy-MM-dd"),
    end: format(monthEnd, "yyyy-MM-dd"),
  }
}

export function getCurrentCalendarContext(
  referenceDate: Date = new Date(),
  timeZone?: string
) {
  const today = toDayKey(referenceDate, timeZone)
  const currentMonth = toMonthKey(referenceDate, timeZone)

  return {
    today,
    currentMonth,
    currentMonthRange: getMonthRange(currentMonth),
  }
}
