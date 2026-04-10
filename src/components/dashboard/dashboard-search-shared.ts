import {
  PiggyBankIcon,
  ReceiptTextIcon,
  RepeatIcon,
  TargetIcon,
} from "lucide-react"
import type { useNavigate } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import type { useGlobalSearch } from "@/hooks/use-money-dashboard"
import {
  getSearchAccountSubtitle,
  getSearchBudgetSubtitle,
  getSearchBudgetTitle,
  getSearchRecurringSubtitle,
  getSearchTransactionSubtitle,
} from "@/lib/dashboard-i18n"
import { t } from "@/lib/i18n"
import { getMainNavItems, getSecondaryNavItems } from "@/lib/dashboard-nav"

export type SearchItem = {
  group: string
  icon: LucideIcon
  id: string
  onSelect: () => void
  subtitle?: string
  title: string
  value: string
}

function clearTransactionSearch(
  previous: Record<string, unknown>,
  transactionId?: string
) {
  return {
    ...previous,
    from: undefined,
    to: undefined,
    transactionId,
  }
}

export function buildPageSearchItems(navigate: ReturnType<typeof useNavigate>) {
  const navItems = [...getMainNavItems(), ...getSecondaryNavItems()]

  return navItems.map<SearchItem>((item) => ({
    group: t("search_group_pages"),
    icon: item.icon,
    id: `page-${item.label.toLowerCase()}`,
    onSelect: () => {
      void navigate({
        to: item.to,
        search: (previous) =>
          item.to === "/dashboard/transactions"
            ? clearTransactionSearch(previous)
            : previous,
      })
    },
    title: item.label,
    value: item.searchTerms,
  }))
}

export function buildEntitySearchItems(
  navigate: ReturnType<typeof useNavigate>,
  results: NonNullable<ReturnType<typeof useGlobalSearch>["data"]>
) {
  return [
    ...results.transactions.map<SearchItem>((item) => ({
      group: t("search_group_transactions"),
      icon: ReceiptTextIcon,
      id: `transaction-${item.id}`,
      onSelect: () => {
        void navigate({
          to: "/dashboard/transactions",
          search: (previous) => clearTransactionSearch(previous, item.id),
        })
      },
      title: item.title,
      subtitle: getSearchTransactionSubtitle(item),
      value: `${item.title} ${getSearchTransactionSubtitle(item)}`.trim(),
    })),
    ...results.accounts.map<SearchItem>((item) => ({
      group: t("search_group_accounts"),
      icon: PiggyBankIcon,
      id: `account-${item.id}`,
      onSelect: () => {
        void navigate({
          to: "/dashboard/accounts",
          search: (previous) => previous,
        })
      },
      title: item.title,
      subtitle: getSearchAccountSubtitle(item),
      value: `${item.title} ${getSearchAccountSubtitle(item)}`.trim(),
    })),
    ...results.budgets.map<SearchItem>((item) => ({
      group: t("search_group_budgets"),
      icon: TargetIcon,
      id: `budget-${item.id}`,
      onSelect: () => {
        void navigate({
          to: "/dashboard/budgets",
          search: (previous) => previous,
        })
      },
      title: getSearchBudgetTitle(item),
      subtitle: getSearchBudgetSubtitle(item),
      value: `${getSearchBudgetTitle(item)} ${getSearchBudgetSubtitle(item)}`.trim(),
    })),
    ...results.recurring.map<SearchItem>((item) => ({
      group: t("search_group_recurring"),
      icon: RepeatIcon,
      id: `recurring-${item.id}`,
      onSelect: () => {
        void navigate({
          to: "/dashboard/recurring",
          search: (previous) => previous,
        })
      },
      title: item.title,
      subtitle: getSearchRecurringSubtitle(item),
      value: `${item.title} ${getSearchRecurringSubtitle(item)}`.trim(),
    })),
  ]
}
