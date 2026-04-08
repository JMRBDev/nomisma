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
import type { SearchResult } from "./search_shared"
import type { QueryCtx } from "../_generated/server"

const TRANSACTION_RESULT_LIMIT = 8

function formatTransactionType(type: "income" | "expense" | "transfer") {
  if (type === "income") return "Income"
  if (type === "expense") return "Expense"
  return "Transfer"
}

export async function getGlobalSearchResults(
  ctx: QueryCtx,
  args: {
    query: string
  }
) {
  const normalizedQuery = normalizeSearchQuery(args.query)

  if (!normalizedQuery) {
    return {
      accounts: [] as Array<SearchResult>,
      budgets: [] as Array<SearchResult>,
      recurring: [] as Array<SearchResult>,
      transactions: [] as Array<SearchResult>,
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
    transactions: transactions.map<SearchResult>((transaction) => ({
      id: transaction._id,
      title: transaction.description,
      subtitle: [
        formatTransactionType(transaction.type),
        transaction.date,
        accountMap.get(transaction.accountId)?.name ?? "Unknown account",
        transaction.categoryId
          ? (categoryMap.get(transaction.categoryId)?.name ?? "Deleted category")
          : null,
      ]
        .filter(Boolean)
        .join(" • "),
    })),
    accounts: buildAccountsResults(accounts, normalizedQuery),
    budgets: buildBudgetResults(budgets, categories, normalizedQuery),
    recurring: buildRecurringResults(
      recurringRules,
      accounts,
      categories,
      normalizedQuery
    ),
  }
}
