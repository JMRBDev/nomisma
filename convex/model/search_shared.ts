import { getCurrentCalendarMonth } from "./dates"
import {
  ACCOUNT_RESULT_LIMIT,
  ACCOUNT_TYPE_SEARCH_TERMS,
  ARCHIVED_SEARCH_TERMS,
  BUDGET_RESULT_LIMIT,
  BUDGET_TOTAL_SEARCH_TERMS,
  DELETED_CATEGORY_SEARCH_TERMS,
  RECURRING_FREQUENCY_SEARCH_TERMS,
  RECURRING_RESULT_LIMIT,
  getMonthSearchTerms,
  matchesSearchTerms,
} from "./search_terms"
import type {
  AccountSearchResult,
  BudgetSearchResult,
  RecurringSearchResult,
} from "./search_terms"
import type {
  getAccountsByUserId,
  getBudgetsByUserId,
  getCategoriesByUserId,
  getRecurringRulesByUserId,
} from "./queries"

export type {
  TransactionSearchResult,
  AccountSearchResult,
  BudgetSearchResult,
  RecurringSearchResult,
} from "./search_terms"
export { normalizeSearchQuery } from "./search_terms"

export function buildAccountsResults(
  accounts: Awaited<ReturnType<typeof getAccountsByUserId>>,
  query: string
) {
  return accounts
    .filter((account) =>
      matchesSearchTerms(
        [
          account.name,
          account.type,
          ...ACCOUNT_TYPE_SEARCH_TERMS[account.type],
          ...(account.archived ? ARCHIVED_SEARCH_TERMS : []),
        ],
        query
      )
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, ACCOUNT_RESULT_LIMIT)
    .map<AccountSearchResult>((account) => ({
      id: account._id,
      title: account.name,
      type: account.type,
      archived: account.archived,
    }))
}

export function buildBudgetResults(
  budgets: Awaited<ReturnType<typeof getBudgetsByUserId>>,
  categories: Awaited<ReturnType<typeof getCategoriesByUserId>>,
  query: string,
  currentMonth: string = getCurrentCalendarMonth(new Date())
) {
  const categoryMap = new Map(categories.map((c) => [c._id, c]))

  return budgets
    .filter((budget) => budget.month === currentMonth)
    .map((budget) => ({
      budget,
      categoryName: budget.categoryId
        ? (categoryMap.get(budget.categoryId)?.name ?? null)
        : null,
      categoryMissing:
        budget.categoryId !== undefined &&
        categoryMap.get(budget.categoryId) === undefined,
      isTotal: budget.categoryId === undefined,
    }))
    .filter(({ budget, categoryName, categoryMissing, isTotal }) =>
      matchesSearchTerms(
        [
          categoryName,
          budget.month,
          ...getMonthSearchTerms(budget.month),
          ...(isTotal ? BUDGET_TOTAL_SEARCH_TERMS : []),
          ...(categoryMissing ? DELETED_CATEGORY_SEARCH_TERMS : []),
        ],
        query
      )
    )
    .sort((a, b) => (a.categoryName ?? "").localeCompare(b.categoryName ?? ""))
    .slice(0, BUDGET_RESULT_LIMIT)
    .map<BudgetSearchResult>(
      ({ budget, categoryName, categoryMissing, isTotal }) => ({
        id: budget._id,
        title: categoryName,
        month: budget.month,
        isTotal,
        categoryMissing,
      })
    )
}

export function buildRecurringResults(
  recurringRules: Awaited<ReturnType<typeof getRecurringRulesByUserId>>,
  accounts: Awaited<ReturnType<typeof getAccountsByUserId>>,
  categories: Awaited<ReturnType<typeof getCategoriesByUserId>>,
  query: string
) {
  const accountMap = new Map(accounts.map((account) => [account._id, account]))
  const categoryMap = new Map(categories.map((c) => [c._id, c]))

  return recurringRules
    .filter((rule) => rule.active)
    .map((rule) => ({
      rule,
      accountName: accountMap.get(rule.accountId)?.name ?? null,
      accountMissing: accountMap.get(rule.accountId) === undefined,
      categoryName: categoryMap.get(rule.categoryId)?.name ?? null,
      categoryMissing: categoryMap.get(rule.categoryId) === undefined,
    }))
    .filter(({ rule, accountName, categoryName, categoryMissing }) =>
      matchesSearchTerms(
        [
          rule.description,
          accountName,
          categoryName,
          rule.nextDueDate,
          rule.frequency,
          ...RECURRING_FREQUENCY_SEARCH_TERMS[rule.frequency],
          ...(categoryMissing ? DELETED_CATEGORY_SEARCH_TERMS : []),
        ],
        query
      )
    )
    .sort((a, b) => a.rule.nextDueDate.localeCompare(b.rule.nextDueDate))
    .slice(0, RECURRING_RESULT_LIMIT)
    .map<RecurringSearchResult>(
      ({
        rule,
        accountName,
        accountMissing,
        categoryName,
        categoryMissing,
      }) => ({
        id: rule._id,
        title: rule.description,
        frequency: rule.frequency,
        accountName,
        accountMissing,
        categoryName,
        categoryMissing,
      })
    )
}
