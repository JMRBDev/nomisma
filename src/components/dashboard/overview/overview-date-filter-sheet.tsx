import type { DateRange } from "react-day-picker"
import { m } from "@/paraglide/messages"
import type {
  OverviewDateFilterPreset,
  OverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"
import type { WeekStartsOnPreference } from "@/components/dashboard/settings/settings-shared"
import { DashboardFilterSheet } from "@/components/dashboard/dashboard-filter-sheet"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  createOverviewDateFilterSearch,
  parseOverviewDayKey,
  toOverviewDayKey,
} from "@/components/dashboard/overview/overview-date-filter"
import { getOverviewDateFilterPresets } from "@/components/dashboard/overview/overview-date-filter-presets"
import { toWeekStartsOnDayIndex } from "@/components/dashboard/settings/settings-shared"
import { getDateFnsLocale } from "@/lib/date-locale"

export function OverviewDateFilterSheet({
  open,
  onOpenChange,
  values,
  onChange,
  onApply,
  onReset,
  canApply,
  canReset,
  weekStartsOn,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: OverviewDateFilterValues
  onChange: (value: OverviewDateFilterValues) => void
  onApply: () => void
  onReset: () => void
  canApply: boolean
  canReset: boolean
  weekStartsOn: WeekStartsOnPreference
}) {
  const presets = getOverviewDateFilterPresets(new Date(), weekStartsOn)
  const selectedSearch = createOverviewDateFilterSearch(values)

  const isPresetActive = (preset: OverviewDateFilterPreset) => {
    const presetSearch = createOverviewDateFilterSearch(preset.values)

    return (
      presetSearch.from === selectedSearch.from &&
      presetSearch.to === selectedSearch.to
    )
  }

  return (
    <DashboardFilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title={m.date_filter_title()}
      description={m.date_filter_description()}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              size="sm"
              variant={isPresetActive(preset) ? "secondary" : "outline"}
              onClick={() => onChange(preset.values)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="overflow-hidden rounded-4xl border border-border/60 bg-background/60">
          <Calendar
            mode="range"
            captionLayout="dropdown"
            defaultMonth={
              values.fromDate ? parseOverviewDayKey(values.fromDate) : undefined
            }
            selected={
              values.fromDate || values.toDate
                ? ({
                    from: values.fromDate
                      ? parseOverviewDayKey(values.fromDate)
                      : undefined,
                    to: values.toDate
                      ? parseOverviewDayKey(values.toDate)
                      : undefined,
                  } satisfies DateRange)
                : undefined
            }
            onSelect={(range) =>
              onChange({
                fromDate: range?.from ? toOverviewDayKey(range.from) : "",
                toDate: range?.to ? toOverviewDayKey(range.to) : "",
              })
            }
            locale={getDateFnsLocale()}
            weekStartsOn={toWeekStartsOnDayIndex(weekStartsOn)}
            footer={
              <div className="mt-4 flex items-center justify-end gap-2">
                {canReset ? (
                  <Button size="sm" variant="outline" onClick={onReset}>
                    {m.common_clear_all()}
                  </Button>
                ) : null}
                <Button size="sm" onClick={onApply} disabled={!canApply}>
                  {m.common_apply()}
                </Button>
              </div>
            }
            className="w-full"
          />
        </div>
      </div>
    </DashboardFilterSheet>
  )
}
