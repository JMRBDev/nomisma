import { getCurrentCalendarMonth } from "./dates"
import type {
  getAccountsByUserId,
  getBudgetsByUserId,
  getCategoriesByUserId,
  getRecurringRulesByUserId,
} from "./queries"

const ACCOUNT_RESULT_LIMIT = 5
const BUDGET_RESULT_LIMIT = 5
const RECURRING_RESULT_LIMIT = 5

export type SearchResult = {
  id: string
  title: string
  subtitle: string
}

export function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase()
}

function matchesSearch(value: string | undefined, query: string) {
  return value?.toLowerCase().includes(query) ?? false
}

function formatRecurringFrequency(
  frequency: "daily" | "weekly" | "monthly" | "yearly"
) {
  if (frequency === "daily") return "Daily"
  if (frequency === "weekly") return "Weekly"
  if (frequency === "monthly") return "Monthly"
  return "Yearly"
}

export function buildAccountsResults(
  accounts: Awaited<ReturnType<typeof getAccountsByUserId>>,
  query: string
) {
  return accounts
    .filter(
      (account) =>
        matchesSearch(account.name, query) || matchesSearch(account.type, query)
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, ACCOUNT_RESULT_LIMIT)
    .map<SearchResult>((account) => ({
      id: account._id,
      title: account.name,
      subtitle: `${account.archived ? "Archived " : ""}${account.type} account`,
    }))
}

export function buildBudgetResults(
  budgets: Awaited<ReturnType<typeof getBudgetsByUserId>>,
  categories: Awaited<ReturnType<typeof getCategoriesByUserId>>,
  query: string
) {
  const currentMonth = getCurrentCalendarMonth(new Date())
  const categoryMap = new Map(
    categories.map((category) => [category._id, category])
  )

  return budgets
    .filter((budget) => budget.month === currentMonth)
    .map((budget) => ({
      budget,
      categoryName: budget.categoryId
        ? (categoryMap.get(budget.categoryId)?.name ?? "Deleted category")
        : "Total spending",
    }))
    .filter(
      ({ budget, categoryName }) =>
        matchesSearch(categoryName, query) || matchesSearch(budget.month, query)
    )
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
    .slice(0, BUDGET_RESULT_LIMIT)
    .map<SearchResult>(({ budget, categoryName }) => ({
      id: budget._id,
      title: categoryName,
      subtitle: `Budget for ${budget.month}`,
    }))
}

export function buildRecurringResults(
  recurringRules: Awaited<ReturnType<typeof getRecurringRulesByUserId>>,
  accounts: Awaited<ReturnType<typeof getAccountsByUserId>>,
  categories: Awaited<ReturnType<typeof getCategoriesByUserId>>,
  query: string
) {
  const accountMap = new Map(accounts.map((account) => [account._id, account]))
  const categoryMap = new Map(
    categories.map((category) => [category._id, category])
  )

  return recurringRules
    .filter((rule) => rule.active)
    .map((rule) => ({
      rule,
      accountName: accountMap.get(rule.accountId)?.name ?? "Unknown account",
      categoryName: categoryMap.get(rule.categoryId)?.name ?? "Unknown category",
    }))
    .filter(
      ({ rule, accountName, categoryName }) =>
        matchesSearch(rule.description, query) ||
        matchesSearch(accountName, query) ||
        matchesSearch(categoryName, query) ||
        matchesSearch(rule.nextDueDate, query) ||
        matchesSearch(rule.frequency, query)
    )
    .sort((a, b) => a.rule.nextDueDate.localeCompare(b.rule.nextDueDate))
    .slice(0, RECURRING_RESULT_LIMIT)
    .map<SearchResult>(({ rule, accountName, categoryName }) => ({
      id: rule._id,
      title: rule.description,
      subtitle: `${formatRecurringFrequency(rule.frequency)} • ${categoryName} • ${accountName}`,
    }))
}
