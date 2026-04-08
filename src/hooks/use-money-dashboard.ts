import { useQuery } from "@tanstack/react-query"
import {
  getAccountsPageDataQueryOptions,
  getBudgetsPageDataQueryOptions,
  getGlobalSearchQueryOptions,
  getOverviewDataQueryOptions,
  getRecurringPageDataQueryOptions,
  getTransactionsPageDataQueryOptions,
  getUserSettingsQueryOptions,
} from "@/lib/dashboard-query-options"

export function useOverviewData(args?: {
  startDate?: string
  endDate?: string
}) {
  return useQuery(getOverviewDataQueryOptions(args))
}

export function useAccountsPageData() {
  return useQuery(getAccountsPageDataQueryOptions())
}

export function useTransactionsPageData() {
  return useQuery(getTransactionsPageDataQueryOptions())
}

export function useBudgetsPageData() {
  return useQuery(getBudgetsPageDataQueryOptions())
}

export function useRecurringPageData() {
  return useQuery(getRecurringPageDataQueryOptions())
}

export function useUserSettings() {
  return useQuery(getUserSettingsQueryOptions())
}

export function useGlobalSearch(query: string) {
  const normalizedQuery = query.trim()

  return useQuery({
    ...getGlobalSearchQueryOptions(query),
    enabled: normalizedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
  })
}
