import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../convex/_generated/api"
import { getCurrentCalendarContext } from "@/lib/date-keys"

export function getOverviewDataQueryOptions(args?: {
  startDate?: string
  endDate?: string
}) {
  const calendar = getCurrentCalendarContext()

  return convexQuery(api.overview.getOverviewData, {
    ...args,
    today: calendar.today,
    currentMonth: calendar.currentMonth,
  })
}

export function getAccountsPageDataQueryOptions() {
  return convexQuery(api.accounts.getAccountsPageData, {})
}

export function getTransactionsPageDataQueryOptions() {
  return convexQuery(api.transactions.getTransactionsPageData, {})
}

export function getBudgetsPageDataQueryOptions() {
  const calendar = getCurrentCalendarContext()

  return convexQuery(api.budgets.getBudgetsPageData, {
    currentMonth: calendar.currentMonth,
  })
}

export function getRecurringPageDataQueryOptions() {
  const calendar = getCurrentCalendarContext()

  return convexQuery(api.recurring.getRecurringPageData, {
    today: calendar.today,
  })
}

export function getUserSettingsQueryOptions() {
  return convexQuery(api.settings.getUserSettings, {})
}

export function getGlobalSearchQueryOptions(query: string) {
  const normalizedQuery = query.trim()
  const calendar = getCurrentCalendarContext()

  return convexQuery(api.search.getGlobalSearchResults, {
    query: normalizedQuery,
    currentMonth: calendar.currentMonth,
  })
}
