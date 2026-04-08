import { useQuery } from "@tanstack/react-query"
import {
  getAccountsPageDataQueryOptions,
  getBudgetsPageDataQueryOptions,
  getGlobalSearchQueryOptions,
  getOverviewDataQueryOptions,
  getRecurringPageDataQueryOptions,
  getTransactionsPageDataQueryOptions,
} from "@/lib/dashboard-query-options"
import { useCalendarContext } from "@/hooks/use-calendar-context"

export function useOverviewData(args?: {
  startDate?: string
  endDate?: string
}) {
  const calendarContext = useCalendarContext()

  return useQuery(getOverviewDataQueryOptions(calendarContext, args))
}

export function useAccountsPageData() {
  return useQuery(getAccountsPageDataQueryOptions())
}

export function useTransactionsPageData() {
  return useQuery(getTransactionsPageDataQueryOptions())
}

export function useBudgetsPageData() {
  const calendarContext = useCalendarContext()

  return useQuery(getBudgetsPageDataQueryOptions(calendarContext))
}

export function useRecurringPageData() {
  const calendarContext = useCalendarContext()

  return useQuery(getRecurringPageDataQueryOptions(calendarContext))
}

export function useGlobalSearch(query: string) {
  const normalizedQuery = query.trim()
  const calendarContext = useCalendarContext()

  return useQuery({
    ...getGlobalSearchQueryOptions(query, calendarContext),
    enabled: normalizedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
  })
}
