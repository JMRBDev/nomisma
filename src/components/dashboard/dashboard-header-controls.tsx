import { Suspense, lazy, startTransition, useState } from "react"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { CalendarRangeIcon } from "lucide-react"
import type { WeekStartsOnPreference } from "@/components/dashboard/settings/settings-shared"
import type { OverviewDateFilterValues } from "@/components/dashboard/overview/overview-date-filter"
import {
  DEFAULT_OVERVIEW_DATE_FILTER_VALUES,
  createOverviewDateFilterSearch,
  getOverviewDateFilterLabel,
  hasOverviewDateFilter,
  normalizeOverviewDateFilterValues,
  resolveOverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"
import { DashboardAiActions } from "@/components/dashboard/dashboard-ai-actions"
import { DashboardSearch } from "@/components/dashboard/dashboard-search"
import { Button } from "@/components/ui/button"

const dashboardRouteApi = getRouteApi("/_authenticated/dashboard")
const loadOverviewDateFilterSheet = () =>
  import("@/components/dashboard/overview/overview-date-filter-sheet")
const LazyOverviewDateFilterSheet = lazy(async () => ({
  default: (await loadOverviewDateFilterSheet()).OverviewDateFilterSheet,
}))

function OverviewDateFilterControl({
  weekStartsOn,
}: {
  weekStartsOn: WeekStartsOnPreference
}) {
  const navigate = useNavigate()
  const appliedSearch = dashboardRouteApi.useSearch()
  const appliedValues = resolveOverviewDateFilterValues(appliedSearch)
  const appliedActive = hasOverviewDateFilter(appliedValues)
  const filterLabel = getOverviewDateFilterLabel(appliedValues)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<OverviewDateFilterValues>(appliedValues)
  const draftActive = hasOverviewDateFilter(draft)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(appliedValues)
    }

    setOpen(nextOpen)
  }

  const handleOpen = () => {
    void loadOverviewDateFilterSheet()
    startTransition(() => {
      handleOpenChange(true)
    })
  }

  const handleApply = () => {
    const normalized = normalizeOverviewDateFilterValues(draft)
    const nextSearch = createOverviewDateFilterSearch(normalized)

    void navigate({
      to: ".",
      search: (previous) => ({
        ...previous,
        from: nextSearch.from,
        to: nextSearch.to,
      }),
    })

    setOpen(false)
  }

  const handleReset = () => {
    setDraft(DEFAULT_OVERVIEW_DATE_FILTER_VALUES)

    void navigate({
      to: ".",
      search: (previous) => ({
        ...previous,
        from: undefined,
        to: undefined,
      }),
    })

    setOpen(false)
  }

  return (
    <>
      <Button
        variant={appliedActive ? "secondary" : "outline"}
        className="max-w-56 min-w-0 justify-start"
        title={filterLabel}
        onClick={handleOpen}
        onFocus={() => {
          void loadOverviewDateFilterSheet()
        }}
        onPointerEnter={() => {
          void loadOverviewDateFilterSheet()
        }}
      >
        <span className="truncate">{filterLabel}</span>
        <CalendarRangeIcon className="size-4 shrink-0" />
      </Button>

      {open ? (
        <Suspense fallback={null}>
          <LazyOverviewDateFilterSheet
            open={open}
            onOpenChange={handleOpenChange}
            values={draft}
            onChange={setDraft}
            onApply={handleApply}
            onReset={handleReset}
            canApply={hasOverviewDateFilter(draft)}
            canReset={draftActive || appliedActive}
            weekStartsOn={weekStartsOn}
          />
        </Suspense>
      ) : null}
    </>
  )
}

export function DashboardHeaderControls({
  weekStartsOn,
}: {
  weekStartsOn: WeekStartsOnPreference
}) {
  return (
    <div className="flex items-center gap-2 md:ml-auto">
      <OverviewDateFilterControl weekStartsOn={weekStartsOn} />
      <DashboardAiActions />
      <DashboardSearch />
    </div>
  )
}
