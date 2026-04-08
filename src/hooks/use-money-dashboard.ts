import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../convex/_generated/api"

export function useOverviewData(args?: {
  startDate?: string
  endDate?: string
}) {
  return useQuery(convexQuery(api.overview.getOverviewData, args ?? {}))
}

export function useAccountsPageData() {
  return useQuery(convexQuery(api.accounts.getAccountsPageData, {}))
}

export function useTransactionsPageData() {
  return useQuery(convexQuery(api.transactions.getTransactionsPageData, {}))
}

export function useBudgetsPageData() {
  return useQuery(convexQuery(api.budgets.getBudgetsPageData, {}))
}

export function useRecurringPageData() {
  return useQuery(convexQuery(api.recurring.getRecurringPageData, {}))
}

export function useSettingsPageData() {
  return useQuery(convexQuery(api.settings.getSettingsPageData, {}))
}

export function useUserSettings() {
  return useQuery(convexQuery(api.settings.getUserSettings, {}))
}

export function useGlobalSearch(query: string) {
  const normalizedQuery = query.trim()

  return useQuery({
    ...convexQuery(api.search.getGlobalSearchResults, {
      query: normalizedQuery,
    }),
    enabled: normalizedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
  })
}
