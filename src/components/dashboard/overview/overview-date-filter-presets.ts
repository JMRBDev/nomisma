import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import type { WeekStartsOnPreference } from "@/components/dashboard/settings/settings-shared"
import type {
  OverviewDateFilterPreset,
  OverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"
import { toWeekStartsOnDayIndex } from "@/components/dashboard/settings/settings-shared"
import { toOverviewDayKey } from "@/components/dashboard/overview/overview-date-filter"

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
