import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import type { WeekStartsOnPreference } from "@/components/dashboard/settings/settings-shared"
import { formatDateLabel } from "@/lib/money"
import { toWeekStartsOnDayIndex } from "@/components/dashboard/settings/settings-shared"

const ISO_DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export type OverviewDateFilterSearch = {
  from?: string
  to?: string
}

export type OverviewDateFilterValues = {
  fromDate: string
  toDate: string
}

export type OverviewDateFilterPreset = {
  label: string
  values: OverviewDateFilterValues
}

export const DEFAULT_OVERVIEW_DATE_FILTER_VALUES: OverviewDateFilterValues = {
  fromDate: "",
  toDate: "",
}

function isValidDayKey(value: unknown): value is string {
  return typeof value === "string" && ISO_DAY_KEY_PATTERN.test(value)
}

export function normalizeOverviewDateRange(startDate: string, endDate: string) {
  return startDate <= endDate
    ? { startDate, endDate }
    : { startDate: endDate, endDate: startDate }
}

export function parseOverviewDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function toOverviewDayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function createOverviewDateFilterValues(
  startDate: Date,
  endDate: Date = startDate
): OverviewDateFilterValues {
  return {
    fromDate: toOverviewDayKey(startDate),
    toDate: toOverviewDayKey(endDate),
  }
}

export function getOverviewDateFilterPresets(
  referenceDate: Date = new Date(),
  weekStartsOn: WeekStartsOnPreference = "sunday"
): Array<OverviewDateFilterPreset> {
  const previousDay = addDays(referenceDate, -1)
  const previousWeek = addDays(referenceDate, -7)
  const previousMonth = subMonths(referenceDate, 1)
  const weekStartsOnDayIndex = toWeekStartsOnDayIndex(weekStartsOn)

  return [
    {
      label: "Today",
      values: createOverviewDateFilterValues(referenceDate),
    },
    {
      label: "Yesterday",
      values: createOverviewDateFilterValues(previousDay),
    },
    {
      label: "This week",
      values: createOverviewDateFilterValues(
        startOfWeek(referenceDate, { weekStartsOn: weekStartsOnDayIndex }),
        endOfWeek(referenceDate, { weekStartsOn: weekStartsOnDayIndex })
      ),
    },
    {
      label: "Last week",
      values: createOverviewDateFilterValues(
        startOfWeek(previousWeek, { weekStartsOn: weekStartsOnDayIndex }),
        endOfWeek(previousWeek, { weekStartsOn: weekStartsOnDayIndex })
      ),
    },
    {
      label: "This month",
      values: createOverviewDateFilterValues(
        startOfMonth(referenceDate),
        endOfMonth(referenceDate)
      ),
    },
    {
      label: "Last month",
      values: createOverviewDateFilterValues(
        startOfMonth(previousMonth),
        endOfMonth(previousMonth)
      ),
    },
  ]
}

export function parseOverviewDateFilterSearch(
  search: Record<string, unknown>
): OverviewDateFilterSearch {
  const from = isValidDayKey(search.from) ? search.from : undefined
  const to = isValidDayKey(search.to) ? search.to : undefined

  if (from && to) {
    const range = normalizeOverviewDateRange(from, to)

    return {
      from: range.startDate,
      to: range.endDate,
    }
  }

  if (from) {
    return {
      from,
    }
  }

  return {}
}

export function resolveOverviewDateFilterValues(
  search: OverviewDateFilterSearch
): OverviewDateFilterValues {
  if (search.from && search.to) {
    const range = normalizeOverviewDateRange(search.from, search.to)

    return {
      fromDate: range.startDate,
      toDate: range.endDate,
    }
  }

  if (search.from) {
    return {
      fromDate: search.from,
      toDate: "",
    }
  }

  return DEFAULT_OVERVIEW_DATE_FILTER_VALUES
}

export function normalizeOverviewDateFilterValues(
  values: OverviewDateFilterValues
): OverviewDateFilterValues {
  if (values.fromDate && values.toDate) {
    const range = normalizeOverviewDateRange(values.fromDate, values.toDate)

    return {
      fromDate: range.startDate,
      toDate: range.endDate,
    }
  }

  return {
    fromDate: values.fromDate,
    toDate: values.toDate,
  }
}

export function hasOverviewDateFilter(values: OverviewDateFilterValues) {
  return Boolean(values.fromDate)
}

export function createOverviewDateFilterSearch(
  values: OverviewDateFilterValues
): OverviewDateFilterSearch {
  const normalized = normalizeOverviewDateFilterValues(values)

  if (!hasOverviewDateFilter(normalized)) {
    return {}
  }

  if (!normalized.toDate || normalized.fromDate === normalized.toDate) {
    return {
      from: normalized.fromDate,
    }
  }

  return {
    from: normalized.fromDate,
    to: normalized.toDate,
  }
}

export function getOverviewDateFilterQuery(values: OverviewDateFilterValues): {
  startDate?: string
  endDate?: string
} {
  if (values.fromDate && !values.toDate) {
    return {
      startDate: values.fromDate,
      endDate: values.fromDate,
    }
  }

  if (values.fromDate && values.toDate) {
    const range = normalizeOverviewDateRange(values.fromDate, values.toDate)

    return {
      startDate: range.startDate,
      endDate: range.endDate,
    }
  }

  return {}
}

export function getOverviewDateFilterLabel(values: OverviewDateFilterValues) {
  if (
    values.fromDate &&
    (!values.toDate || values.fromDate === values.toDate)
  ) {
    return formatDateLabel(values.fromDate)
  }

  if (values.fromDate && values.toDate) {
    return `${formatDateLabel(values.fromDate)} - ${formatDateLabel(values.toDate)}`
  }

  return "All dates"
}
