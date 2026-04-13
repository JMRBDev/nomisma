import {
  getAccountsByUserId,
  getBudgetsByUserId,
  getCategoriesByUserId,
  getRecurringRulesByUserId,
  requireUser,
} from "./queries"
import {
  buildAccountsResults,
  buildBudgetResults,
  buildRecurringResults,
  normalizeSearchQuery,
} from "./search_shared"
import type { TransactionSearchResult } from "./search_shared"
import type { QueryCtx } from "../_generated/server"

const TRANSACTION_RESULT_LIMIT = 8

export async function getGlobalSearchResults(
  ctx: QueryCtx,
  args: {
    query: string
    currentMonth?: string
  }
) {
  const normalizedQuery = normalizeSearchQuery(args.query)

  if (!normalizedQuery) {
    return {
      accounts: [] as Array<ReturnType<typeof buildAccountsResults>[number]>,
      budgets: [] as Array<ReturnType<typeof buildBudgetResults>[number]>,
      recurring: [] as Array<ReturnType<typeof buildRecurringResults>[number]>,
      transactions: [] as Array<TransactionSearchResult>,
    }
  }

  const user = await requireUser(ctx)
  const [accounts, categories, budgets, recurringRules, transactions] =
    await Promise.all([
      getAccountsByUserId(ctx, user._id),
      getCategoriesByUserId(ctx, user._id),
      getBudgetsByUserId(ctx, user._id),
      getRecurringRulesByUserId(ctx, user._id),
      ctx.db
        .query("transactions")
        .withSearchIndex("search_description", (q) =>
          q.search("description", normalizedQuery).eq("userId", user._id)
        )
        .take(TRANSACTION_RESULT_LIMIT),
    ])

  const accountMap = new Map(accounts.map((account) => [account._id, account]))
  const categoryMap = new Map(
    categories.map((category) => [category._id, category])
  )

  return {
    transactions: transactions.map<TransactionSearchResult>((transaction) => ({
      id: transaction._id,
      title: transaction.description,
      type: transaction.type,
      date: transaction.date,
      accountName: accountMap.get(transaction.accountId)?.name ?? null,
      accountMissing: accountMap.get(transaction.accountId) === undefined,
      categoryName: transaction.categoryId
        ? (categoryMap.get(transaction.categoryId)?.name ?? null)
        : null,
      categoryDisplayState:
        transaction.type === "transfer"
          ? "none"
          : transaction.categoryId === undefined
            ? "uncategorized"
            : categoryMap.get(transaction.categoryId) === undefined
              ? "deleted"
              : "named",
    })),
    accounts: buildAccountsResults(accounts, normalizedQuery),
    budgets: buildBudgetResults(
      budgets,
      categories,
      normalizedQuery,
      args.currentMonth
    ),
    recurring: buildRecurringResults(
      recurringRules,
      accounts,
      categories,
      normalizedQuery
    ),
  }
}
