import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { m } from "@/lib/i18n-client"
import type { WeekStartsOnPreference } from "@/components/dashboard/settings/settings-shared"
import type {
  OverviewDateFilterPreset,
  OverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"
import { toWeekStartsOnDayIndex } from "@/components/dashboard/settings/settings-shared"
import { toOverviewDayKey } from "@/components/dashboard/overview/overview-date-filter"
import { DEFAULT_WEEK_STARTS_ON } from "../../../../shared/settings"

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
  weekStartsOn: WeekStartsOnPreference = DEFAULT_WEEK_STARTS_ON
): Array<OverviewDateFilterPreset> {
  const previousDay = addDays(referenceDate, -1)
  const previousWeek = addDays(referenceDate, -7)
  const previousMonth = subMonths(referenceDate, 1)
  const weekStartsOnDayIndex = toWeekStartsOnDayIndex(weekStartsOn)

  return [
    {
      label: m.date_filter_preset_today(),
      values: createOverviewDateFilterValues(referenceDate),
    },
    {
      label: m.date_filter_preset_yesterday(),
      values: createOverviewDateFilterValues(previousDay),
    },
    {
      label: m.date_filter_preset_this_week(),
      values: createOverviewDateFilterValues(
        startOfWeek(referenceDate, { weekStartsOn: weekStartsOnDayIndex }),
        endOfWeek(referenceDate, { weekStartsOn: weekStartsOnDayIndex })
      ),
    },
    {
      label: m.date_filter_preset_last_week(),
      values: createOverviewDateFilterValues(
        startOfWeek(previousWeek, { weekStartsOn: weekStartsOnDayIndex }),
        endOfWeek(previousWeek, { weekStartsOn: weekStartsOnDayIndex })
      ),
    },
    {
      label: m.date_filter_preset_this_month(),
      values: createOverviewDateFilterValues(
        startOfMonth(referenceDate),
        endOfMonth(referenceDate)
      ),
    },
    {
      label: m.date_filter_preset_last_month(),
      values: createOverviewDateFilterValues(
        startOfMonth(previousMonth),
        endOfMonth(previousMonth)
      ),
    },
  ]
}
