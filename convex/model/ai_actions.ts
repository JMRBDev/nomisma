/* eslint-disable max-lines */
import { ConvexError } from "convex/values"
import { buildMappedTransactions } from "./read_models_transactions"
import {
  getAccountsByUserId,
  getActiveRecurringRulesByUserId,
  getBudgetsByUserIdMonth,
  getCategoriesByUserId,
  getOwnedCategory,
  getOwnedTransaction,
  getRecentTransactionsByUserId,
  getResolvedSettings,
  requireUser,
} from "./queries"
import type { Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import type { TransactionDoc } from "./types"

function serializeTransaction(
  transaction: ReturnType<typeof buildMappedTransactions>[number]
) {
  return {
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
  }
}

export async function getPlannerContext(
  ctx: QueryCtx,
  args: {
    currentMonth: string
    includeAccounts?: boolean
    includeBudgets?: boolean
    includeCategories?: boolean
    includeRecentTransactions?: boolean
    includeRecurringRules?: boolean
    recentTransactionsLimit?: number
    selectedIds?: Array<string>
  }
) {
  const user = await requireUser(ctx)
  const selectedIds = new Set(args.selectedIds ?? [])
  const needsTransactionData =
    selectedIds.size > 0 || args.includeRecentTransactions
  const needsAccountDocs =
    args.includeAccounts || args.includeRecurringRules || needsTransactionData
  const needsCategoryDocs =
    args.includeCategories ||
    args.includeBudgets ||
    args.includeRecurringRules ||
    needsTransactionData
  const recentTransactionsLimit = Math.min(
    Math.max(args.recentTransactionsLimit ?? 12, 1),
    20
  )

  const [
    { settings },
    accountDocs,
    categoryDocs,
    budgets,
    recurringRules,
    recentTransactions,
    selectedTransactions,
  ] = await Promise.all([
    getResolvedSettings(ctx, user._id),
    needsAccountDocs ? getAccountsByUserId(ctx, user._id) : [],
    needsCategoryDocs ? getCategoriesByUserId(ctx, user._id) : [],
    args.includeBudgets
      ? getBudgetsByUserIdMonth(ctx, user._id, args.currentMonth)
      : [],
    args.includeRecurringRules
      ? getActiveRecurringRulesByUserId(ctx, user._id)
      : [],
    args.includeRecentTransactions
      ? getRecentTransactionsByUserId(ctx, user._id, recentTransactionsLimit)
      : [],
    selectedIds.size > 0
      ? Promise.all(
          [...selectedIds].map(async (transactionId) => {
            const transaction = await ctx.db.get(
              transactionId as Id<"transactions">
            )
            return transaction?.userId === user._id ? transaction : null
          })
        )
      : [],
  ])

  const accountMap = new Map(
    accountDocs.map((account) => [account._id, account])
  )
  const categoryMap = new Map(
    categoryDocs.map((category) => [category._id, category])
  )
  const mappedRecentTransactions = args.includeRecentTransactions
    ? buildMappedTransactions(accountDocs, categoryDocs, recentTransactions)
    : []
  const selectedTransactionDocs: Array<TransactionDoc> = []

  for (const transaction of selectedTransactions) {
    if (transaction) {
      selectedTransactionDocs.push(transaction)
    }
  }

  const mappedSelectedTransactions =
    selectedIds.size > 0
      ? buildMappedTransactions(
          accountDocs,
          categoryDocs,
          selectedTransactionDocs
        )
      : []

  return {
    settings: { baseCurrency: settings.baseCurrency },
    accounts: args.includeAccounts
      ? accountDocs.map((account) => ({
          id: account._id,
          name: account.name,
          type: account.type,
          archived: account.archived,
          includeInTotals: account.includeInTotals,
        }))
      : [],
    categories: args.includeCategories
      ? categoryDocs.map((category) => ({
          id: category._id,
          name: category.name,
          archived: category.archived,
          color: category.color,
          icon: category.icon,
        }))
      : [],
    budgets: args.includeBudgets
      ? budgets.map((budget) => ({
          id: budget._id,
          month: budget.month,
          categoryId: budget.categoryId ?? null,
          limitAmount: budget.limitAmount,
        }))
      : [],
    recentTransactions: mappedRecentTransactions.map(serializeTransaction),
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
    selectedTransactions: mappedSelectedTransactions.map(serializeTransaction),
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

  const uniqueAssignments = new Map<Id<"transactions">, Id<"categories">>()

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
