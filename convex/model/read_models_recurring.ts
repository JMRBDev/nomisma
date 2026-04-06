import { addDays } from "./dates"
import type { AccountDoc, CategoryDoc, RecurringRuleDoc } from "./types"

export function buildRecurringItems(
  recurringRules: Array<RecurringRuleDoc>,
  accounts: Array<AccountDoc>,
  categories: Array<CategoryDoc>,
  today: string
) {
  const accountMap = new Map(accounts.map((account) => [account._id, account]))
  const categoryMap = new Map(
    categories.map((category) => [category._id, category])
  )

  const all = recurringRules
    .filter((rule) => rule.active)
    .map((rule) => {
      const account = accountMap.get(rule.accountId)
      return {
        ...rule,
        accountName: account?.name ?? "Unknown account",
        accountIcon: account?.icon ?? null,
        accountColor: account?.color ?? null,
        categoryName:
          categoryMap.get(rule.categoryId)?.name ?? "Unknown category",
        status:
          rule.nextDueDate < today
            ? ("overdue" as const)
            : rule.nextDueDate <= addDays(today, 7)
              ? ("dueSoon" as const)
              : ("upcoming" as const),
      }
    })
    .sort((a, b) => (a.nextDueDate < b.nextDueDate ? -1 : 1))

  return {
    dueSoon: all.filter((item) => item.status === "dueSoon"),
    overdue: all.filter((item) => item.status === "overdue"),
    upcoming: all.filter((item) => item.status === "upcoming"),
    all,
  }
}
