import { ConvexError } from "convex/values"
import {
  buildAccountSummaries,
  buildMappedTransactions,
  groupAccountSummaries,
  groupCategories,
} from "./readModels"
import {
  applyTransactionToBalances,
  assertNoNegativeBalances,
  buildBalanceMap,
  getAccountsByUserId,
  getCategoriesByUserId,
  getOwnedTransaction,
  getResolvedSettings,
  getTransactionsByUserId,
  monthKeyFromDate,
  requireUser,
  validateTransactionShape,
} from "./shared"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import type { TransactionDoc } from "./shared"

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

export async function createTransaction(
  ctx: MutationCtx,
  args: {
    type: TransactionDoc["type"]
    amount: number
    date: string
    status: TransactionDoc["status"]
    accountId: TransactionDoc["accountId"]
    toAccountId?: TransactionDoc["toAccountId"]
    categoryId?: TransactionDoc["categoryId"]
    description: string
    note?: string
    recurringRuleId?: TransactionDoc["recurringRuleId"]
  }
) {
  const user = await requireUser(ctx)
  validateTransactionShape(args)

  const [accounts, categories, existingTransactions] = await Promise.all([
    getAccountsByUserId(ctx, user._id),
    getCategoriesByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

  const accountIds = new Set(accounts.map((account) => account._id))
  if (!accountIds.has(args.accountId)) {
    throw new ConvexError("Account not found.")
  }
  if (args.toAccountId && !accountIds.has(args.toAccountId)) {
    throw new ConvexError("Destination account not found.")
  }

  if (args.categoryId) {
    const category = categories.find((item) => item._id === args.categoryId)
    if (!category) {
      throw new ConvexError("Category not found.")
    }
    if (category.kind !== args.type) {
      throw new ConvexError(
        "Pick a category that matches the transaction type."
      )
    }
  }

  const transaction: Omit<
    TransactionDoc,
    "_id" | "_creationTime" | "createdAt" | "month" | "updatedAt" | "userId"
  > = {
    type: args.type,
    amount: args.amount,
    date: args.date,
    status: args.status,
    accountId: args.accountId,
    toAccountId: args.type === "transfer" ? args.toAccountId : undefined,
    categoryId: args.type === "transfer" ? undefined : args.categoryId,
    description:
      args.description.trim() ||
      (args.type === "transfer" ? "Transfer" : "Money movement"),
    note: args.note?.trim() || undefined,
    recurringRuleId: args.recurringRuleId,
  }

  if (transaction.status === "posted") {
    const balances = buildBalanceMap(accounts, existingTransactions)
    applyTransactionToBalances(balances, transaction)
    assertNoNegativeBalances(balances, [
      transaction.accountId,
      transaction.toAccountId,
    ])
  }

  const timestamp = Date.now()
  return ctx.db.insert("transactions", {
    userId: user._id,
    ...transaction,
    month: monthKeyFromDate(transaction.date),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

export async function updateTransaction(
  ctx: MutationCtx,
  args: {
    transactionId: Parameters<typeof getOwnedTransaction>[2]
    type: TransactionDoc["type"]
    amount: number
    date: string
    status: TransactionDoc["status"]
    accountId: TransactionDoc["accountId"]
    toAccountId?: TransactionDoc["toAccountId"]
    categoryId?: TransactionDoc["categoryId"]
    description: string
    note?: string
  }
) {
  const user = await requireUser(ctx)
  await getOwnedTransaction(ctx, user._id, args.transactionId)
  validateTransactionShape(args)

  const [accounts, categories, existingTransactions] = await Promise.all([
    getAccountsByUserId(ctx, user._id),
    getCategoriesByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

  const accountIds = new Set(accounts.map((account) => account._id))
  if (!accountIds.has(args.accountId)) {
    throw new ConvexError("Account not found.")
  }
  if (args.toAccountId && !accountIds.has(args.toAccountId)) {
    throw new ConvexError("Destination account not found.")
  }

  if (args.categoryId) {
    const category = categories.find((item) => item._id === args.categoryId)
    if (!category) {
      throw new ConvexError("Category not found.")
    }
    if (category.kind !== args.type) {
      throw new ConvexError(
        "Pick a category that matches the transaction type."
      )
    }
  }

  const candidate: Pick<
    TransactionDoc,
    "type" | "amount" | "status" | "accountId" | "toAccountId"
  > = {
    type: args.type,
    amount: args.amount,
    status: args.status,
    accountId: args.accountId,
    toAccountId: args.type === "transfer" ? args.toAccountId : undefined,
  }

  if (candidate.status === "posted") {
    const balances = buildBalanceMap(
      accounts,
      existingTransactions.filter(
        (transaction) => transaction._id !== args.transactionId
      )
    )
    applyTransactionToBalances(balances, candidate)
    assertNoNegativeBalances(balances, [
      candidate.accountId,
      candidate.toAccountId,
    ])
  }

  await ctx.db.patch(args.transactionId, {
    type: args.type,
    amount: args.amount,
    date: args.date,
    month: monthKeyFromDate(args.date),
    status: args.status,
    accountId: args.accountId,
    toAccountId: args.type === "transfer" ? args.toAccountId : undefined,
    categoryId: args.type === "transfer" ? undefined : args.categoryId,
    description:
      args.description.trim() ||
      (args.type === "transfer" ? "Transfer" : "Money movement"),
    note: args.note?.trim() || undefined,
    updatedAt: Date.now(),
  })
}

export async function deleteTransaction(
  ctx: MutationCtx,
  args: {
    transactionId: Parameters<typeof getOwnedTransaction>[2]
  }
) {
  const user = await requireUser(ctx)
  const transaction = await getOwnedTransaction(
    ctx,
    user._id,
    args.transactionId
  )
  const [accounts, existingTransactions] = await Promise.all([
    getAccountsByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

  const balances = buildBalanceMap(
    accounts,
    existingTransactions.filter((item) => item._id !== transaction._id)
  )
  assertNoNegativeBalances(balances, [
    transaction.accountId,
    transaction.toAccountId,
  ])

  await ctx.db.delete(transaction._id)
}
