import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../convex/_generated/api"
import { getCurrentCalendarContext } from "@/lib/date-keys"

export function useOverviewData(args?: {
  startDate?: string
  endDate?: string
}) {
  const calendar = getCurrentCalendarContext()

  return useQuery(
    convexQuery(api.overview.getOverviewData, {
      ...args,
      today: calendar.today,
      currentMonth: calendar.currentMonth,
    })
  )
}

export function useAccountsPageData() {
  return useQuery(convexQuery(api.accounts.getAccountsPageData, {}))
}

export function useTransactionsPageData() {
  return useQuery(convexQuery(api.transactions.getTransactionsPageData, {}))
}

export function useBudgetsPageData() {
  const calendar = getCurrentCalendarContext()

  return useQuery(
    convexQuery(api.budgets.getBudgetsPageData, {
      currentMonth: calendar.currentMonth,
    })
  )
}

export function useRecurringPageData() {
  const calendar = getCurrentCalendarContext()

  return useQuery(
    convexQuery(api.recurring.getRecurringPageData, {
      today: calendar.today,
    })
  )
}

export function useSettingsPageData() {
  return useQuery(convexQuery(api.settings.getSettingsPageData, {}))
}

export function useUserSettings() {
  return useQuery(convexQuery(api.settings.getUserSettings, {}))
}

export function useGlobalSearch(query: string) {
  const normalizedQuery = query.trim()
  const calendar = getCurrentCalendarContext()

  return useQuery({
    ...convexQuery(api.search.getGlobalSearchResults, {
      query: normalizedQuery,
      currentMonth: calendar.currentMonth,
    }),
    enabled: normalizedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
  })
}
