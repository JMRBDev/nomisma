import type { DateRange } from "react-day-picker"
import type { OverviewDateFilterValues } from "@/components/dashboard/overview/overview-date-filter"
import { DashboardFilterSheet } from "@/components/dashboard/dashboard-filter-sheet"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  parseOverviewDayKey,
  toOverviewDayKey,
} from "@/components/dashboard/overview/overview-date-filter"

export function OverviewDateFilterSheet({
  open,
  onOpenChange,
  values,
  onChange,
  onApply,
  onReset,
  canApply,
  canReset,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: OverviewDateFilterValues
  onChange: (value: OverviewDateFilterValues) => void
  onApply: () => void
  onReset: () => void
  canApply: boolean
  canReset: boolean
}) {
  return (
    <DashboardFilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Date filter"
      description="Filter overview activity by a single day or a custom date range."
    >
      <div className="flex flex-col gap-4">
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
            footer={(
              <div className="flex items-center gap-2 mt-4 justify-end">
                {canReset ? (
                  <Button size="sm" variant="outline" onClick={onReset}>
                    Clear all
                  </Button>
                ) : null}
                <Button size="sm" onClick={onApply} disabled={!canApply}>
                  Apply
                </Button>
              </div>
            )}
            className="w-full"
          />
        </div>
      </div>
    </DashboardFilterSheet>
  )
}
