import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../convex/_generated/api"

export function useOverviewData() {
  return useQuery(convexQuery(api.overview.getOverviewData, {}))
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
