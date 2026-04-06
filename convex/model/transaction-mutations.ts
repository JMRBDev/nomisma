import { ConvexError } from "convex/values"
import {
  applyTransactionToBalances,
  assertNoNegativeBalances,
  buildBalanceMap,
  validateTransactionShape,
} from "./balances"
import {
  getAccountsByUserId,
  getOwnedAccount,
  getOwnedCategory,
  getOwnedTransaction,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import { monthKeyFromDate } from "./dates"
import type { MutationCtx } from "../_generated/server"
import type { TransactionDoc } from "./types"

type TxArgs = {
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

export async function createTransaction(
  ctx: MutationCtx,
  args: TxArgs & { recurringRuleId?: TransactionDoc["recurringRuleId"] }
) {
  const user = await requireUser(ctx)
  validateTransactionShape(args)
  await getOwnedAccount(ctx, user._id, args.accountId)
  if (args.toAccountId) await getOwnedAccount(ctx, user._id, args.toAccountId)
  if (args.categoryId) {
    const category = await getOwnedCategory(ctx, user._id, args.categoryId)
    if (category.kind !== args.type) {
      throw new ConvexError(
        "Pick a category that matches the transaction type."
      )
    }
  }

  const [accounts, existingTransactions] = await Promise.all([
    getAccountsByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

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
  args: TxArgs & { transactionId: Parameters<typeof getOwnedTransaction>[2] }
) {
  const user = await requireUser(ctx)
  await getOwnedTransaction(ctx, user._id, args.transactionId)
  validateTransactionShape(args)
  await getOwnedAccount(ctx, user._id, args.accountId)
  if (args.toAccountId) await getOwnedAccount(ctx, user._id, args.toAccountId)
  if (args.categoryId) {
    const category = await getOwnedCategory(ctx, user._id, args.categoryId)
    if (category.kind !== args.type) {
      throw new ConvexError(
        "Pick a category that matches the transaction type."
      )
    }
  }

  const [accounts, existingTransactions] = await Promise.all([
    getAccountsByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

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
      existingTransactions.filter((t) => t._id !== args.transactionId)
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
