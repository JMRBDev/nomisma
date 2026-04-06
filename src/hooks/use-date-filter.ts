import { useMemo } from "react"
import { getRouteApi } from "@tanstack/react-router"
import {
  getOverviewDateFilterLabel,
  getOverviewDateFilterQuery,
  hasOverviewDateFilter,
  resolveOverviewDateFilterValues,
} from "@/components/dashboard/overview/overview-date-filter"

const dashboardRouteApi = getRouteApi("/_authenticated/dashboard")

export function useDateFilter() {
  const search = dashboardRouteApi.useSearch()
  const dateFilter = resolveOverviewDateFilterValues(search)
  const hasDateFilter = hasOverviewDateFilter(dateFilter)
  const filterLabel = getOverviewDateFilterLabel(dateFilter)
  const dateRange = useMemo(
    () => getOverviewDateFilterQuery(dateFilter),
    [dateFilter.fromDate, dateFilter.toDate]
  )

  return { hasDateFilter, filterLabel, dateRange, dateFilter }
}
