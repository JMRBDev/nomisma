import { ConvexError } from "convex/values"
import { buildMappedTransactions } from "./read_models_transactions"
import {
  getAccountsByUserId,
  getBudgetsByUserId,
  getCategoriesByUserId,
  getOwnedCategory,
  getOwnedTransaction,
  getResolvedSettings,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import type { Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export async function getPlannerContext(
  ctx: QueryCtx,
  args: {
    selectedIds?: Array<string>
  }
) {
  const user = await requireUser(ctx)
  const [{ settings }, accounts, categories, budgets, transactions] =
    await Promise.all([
      getResolvedSettings(ctx, user._id),
      getAccountsByUserId(ctx, user._id),
      getCategoriesByUserId(ctx, user._id),
      getBudgetsByUserId(ctx, user._id),
      getTransactionsByUserId(ctx, user._id),
    ])

  const mappedTransactions = buildMappedTransactions(
    accounts,
    categories,
    transactions
  )
  const selectedIds = new Set(args.selectedIds ?? [])

  return {
    settings: { baseCurrency: settings.baseCurrency },
    categories: categories.map((category) => ({
      id: category._id,
      name: category.name,
      archived: category.archived,
    })),
    budgets: budgets.map((budget) => ({
      id: budget._id,
      month: budget.month,
      categoryId: budget.categoryId ?? null,
      limitAmount: budget.limitAmount,
    })),
    recentTransactions: mappedTransactions.slice(0, 50).map((transaction) => ({
      id: transaction._id,
      type: transaction.type,
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
      categoryId: transaction.categoryId ?? null,
      categoryName: transaction.categoryName,
      recurringRuleId: transaction.recurringRuleId ?? null,
    })),
    selectedTransactions: mappedTransactions
      .filter((transaction) => selectedIds.has(transaction._id))
      .map((transaction) => ({
        id: transaction._id,
        type: transaction.type,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        categoryId: transaction.categoryId ?? null,
        categoryName: transaction.categoryName,
        recurringRuleId: transaction.recurringRuleId ?? null,
      })),
  }
}

export async function categorizeTransactions(
  ctx: MutationCtx,
  args: {
    transactionIds: Array<Id<"transactions">>
    categoryId: Id<"categories">
  }
) {
  const user = await requireUser(ctx)
  await getOwnedCategory(ctx, user._id, args.categoryId)

  if (args.transactionIds.length === 0) {
    throw new ConvexError("Select at least one transaction.")
  }

  const transactions = await Promise.all(
    args.transactionIds.map((transactionId) =>
      getOwnedTransaction(ctx, user._id, transactionId)
    )
  )

  for (const transaction of transactions) {
    if (transaction.type === "transfer") {
      throw new ConvexError("Transfers cannot be categorized.")
    }
  }

  const updatedAt = Date.now()
  await Promise.all(
    transactions.map((transaction) =>
      ctx.db.patch(transaction._id, {
        categoryId: args.categoryId,
        updatedAt,
      })
    )
  )

  return {
    count: transactions.length,
  }
}
