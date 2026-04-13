/* eslint-disable max-lines */
import { ConvexError } from "convex/values"
import { buildMappedTransactions } from "./read_models_transactions"
import {
  getAccountsByUserId,
  getBudgetsByUserId,
  getCategoriesByUserId,
  getOwnedCategory,
  getOwnedTransaction,
  getRecurringRulesByUserId,
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
  const [{ settings }, accounts, categories, budgets, recurringRules, transactions] =
    await Promise.all([
      getResolvedSettings(ctx, user._id),
      getAccountsByUserId(ctx, user._id),
      getCategoriesByUserId(ctx, user._id),
      getBudgetsByUserId(ctx, user._id),
      getRecurringRulesByUserId(ctx, user._id),
      getTransactionsByUserId(ctx, user._id),
    ])

  const mappedTransactions = buildMappedTransactions(
    accounts,
    categories,
    transactions
  )
  const selectedIds = new Set(args.selectedIds ?? [])
  const accountMap = new Map(accounts.map((account) => [account._id, account]))
  const categoryMap = new Map(
    categories.map((category) => [category._id, category])
  )

  return {
    settings: { baseCurrency: settings.baseCurrency },
    accounts: accounts.map((account) => ({
      id: account._id,
      name: account.name,
      type: account.type,
      archived: account.archived,
      includeInTotals: account.includeInTotals,
    })),
    categories: categories.map((category) => ({
      id: category._id,
      name: category.name,
      archived: category.archived,
      color: category.color,
      icon: category.icon,
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
      status: transaction.status,
      description: transaction.description,
      note: transaction.note ?? null,
      accountId: transaction.accountId,
      accountName: transaction.accountName,
      toAccountId: transaction.toAccountId ?? null,
      toAccountName: transaction.toAccountName,
      categoryId: transaction.categoryId ?? null,
      categoryName: transaction.categoryName,
      recurringRuleId: transaction.recurringRuleId ?? null,
    })),
    recurringRules: recurringRules.map((rule) => ({
      id: rule._id,
      type: rule.type,
      amount: rule.amount,
      description: rule.description,
      frequency: rule.frequency,
      startDate: rule.startDate,
      nextDueDate: rule.nextDueDate,
      endDate: rule.endDate,
      active: rule.active,
      accountId: rule.accountId,
      accountName: accountMap.get(rule.accountId)?.name ?? null,
      categoryId: rule.categoryId,
      categoryName: categoryMap.get(rule.categoryId)?.name ?? null,
    })),
    selectedTransactions: mappedTransactions
      .filter((transaction) => selectedIds.has(transaction._id))
      .map((transaction) => ({
        id: transaction._id,
        type: transaction.type,
        date: transaction.date,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description,
        note: transaction.note ?? null,
        accountId: transaction.accountId,
        accountName: transaction.accountName,
        toAccountId: transaction.toAccountId ?? null,
        toAccountName: transaction.toAccountName,
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

export async function autoCategorizeTransactions(
  ctx: MutationCtx,
  args: {
    assignments: Array<{
      transactionId: Id<"transactions">
      categoryId: Id<"categories">
    }>
  }
) {
  const user = await requireUser(ctx)

  if (args.assignments.length === 0) {
    throw new ConvexError("Select at least one transaction.")
  }

  const uniqueAssignments = new Map<
    Id<"transactions">,
    Id<"categories">
  >()

  for (const assignment of args.assignments) {
    uniqueAssignments.set(assignment.transactionId, assignment.categoryId)
  }

  const categoryIds = [...new Set(uniqueAssignments.values())]
  await Promise.all(
    categoryIds.map((categoryId) => getOwnedCategory(ctx, user._id, categoryId))
  )

  const transactions = await Promise.all(
    [...uniqueAssignments.keys()].map((transactionId) =>
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
        categoryId: uniqueAssignments.get(transaction._id),
        updatedAt,
      })
    )
  )

  return {
    count: transactions.length,
  }
}
