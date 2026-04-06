import { buildMappedTransactions } from "./read-models-transactions"
import {
  buildAccountSummaries,
  groupAccountSummaries,
} from "./read-models-accounts"
import { groupCategories } from "./read-models-categories"
import {
  getAccountsByUserId,
  getCategoriesByUserId,
  getResolvedSettings,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import type { QueryCtx } from "../_generated/server"

export { createTransaction, updateTransaction } from "./transaction-mutations"
export { deleteTransaction } from "./transaction-delete"

export async function getTransactionsPageData(ctx: QueryCtx) {
  const user = await requireUser(ctx)
  const [{ settings }, accounts, categories, transactions] = await Promise.all([
    getResolvedSettings(ctx, user._id),
    getAccountsByUserId(ctx, user._id),
    getCategoriesByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

  const dashboardTransactions = buildMappedTransactions(
    accounts,
    categories,
    transactions
  )
  const accountSummaries = buildAccountSummaries(
    accounts,
    transactions,
    dashboardTransactions
  )

  return {
    settings,
    accounts: groupAccountSummaries(accountSummaries),
    categories: groupCategories(categories),
    transactions: dashboardTransactions,
  }
}
