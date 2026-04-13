import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../convex/_generated/api"
import type { BrowserCalendarContext } from "@/lib/browser-calendar"

type DashboardCalendarInput = Pick<
  BrowserCalendarContext,
  "today" | "currentMonth"
>

export function getOverviewDataQueryOptions(
  calendar: DashboardCalendarInput,
  args?: {
    startDate?: string
    endDate?: string
  }
) {
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

export function getBudgetsPageDataQueryOptions(
  calendar: DashboardCalendarInput
) {
  return convexQuery(api.budgets.getBudgetsPageData, {
    currentMonth: calendar.currentMonth,
  })
}

export function getRecurringPageDataQueryOptions(
  calendar: DashboardCalendarInput
) {
  return convexQuery(api.recurring.getRecurringPageData, {
    today: calendar.today,
  })
}

export function getUserSettingsQueryOptions() {
  return convexQuery(api.settings.getUserSettings, {})
}

export function getGlobalSearchQueryOptions(
  query: string,
  calendar: DashboardCalendarInput
) {
  const normalizedQuery = query.trim()
  return convexQuery(api.search.getGlobalSearchResults, {
    query: normalizedQuery,
    currentMonth: calendar.currentMonth,
  })
}
