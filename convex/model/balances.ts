import { ConvexError } from "convex/values"
import type { Id } from "../_generated/dataModel"
import type {
  AccountDoc,
  CategoryDoc,
  TransactionDoc,
  TransactionKind,
} from "./types"

export function buildBalanceMap(
  accounts: Array<AccountDoc>,
  transactions: Array<TransactionDoc>
) {
  const balances = new Map<Id<"accounts">, number>()

  for (const account of accounts) {
    balances.set(account._id, account.openingBalance)
  }

  for (const transaction of transactions) {
    if (transaction.status !== "posted") continue
    applyTransactionToBalances(balances, transaction)
  }

  return balances
}

export function applyTransactionToBalances(
  balances: Map<Id<"accounts">, number>,
  transaction: Pick<
    TransactionDoc,
    "type" | "amount" | "status" | "accountId" | "toAccountId"
  >
) {
  if (transaction.status !== "posted") return

  const currentSourceBalance = balances.get(transaction.accountId) ?? 0

  if (transaction.type === "income") {
    balances.set(
      transaction.accountId,
      currentSourceBalance + transaction.amount
    )
    return
  }

  if (transaction.type === "expense") {
    balances.set(
      transaction.accountId,
      currentSourceBalance - transaction.amount
    )
    return
  }

  if (!transaction.toAccountId) {
    throw new ConvexError("Transfers need a destination account.")
  }

  balances.set(transaction.accountId, currentSourceBalance - transaction.amount)
  balances.set(
    transaction.toAccountId,
    (balances.get(transaction.toAccountId) ?? 0) + transaction.amount
  )
}

export function assertNoNegativeBalances(
  balances: Map<Id<"accounts">, number>,
  accountIds: Array<Id<"accounts"> | undefined>
) {
  for (const accountId of accountIds) {
    if (!accountId) continue
    if ((balances.get(accountId) ?? 0) < 0) {
      throw new ConvexError("This would leave one of your accounts below zero.")
    }
  }
}

export function sortByDateDescending<
  T extends {
    date: string
    createdAt: number
  },
>(items: Array<T>) {
  return [...items].sort((a, b) => {
    if (a.date === b.date) return b.createdAt - a.createdAt
    return a.date < b.date ? 1 : -1
  })
}

export function mapTransaction(
  transaction: TransactionDoc,
  accountMap: Map<Id<"accounts">, AccountDoc>,
  categoryMap: Map<Id<"categories">, CategoryDoc>
) {
  const account = accountMap.get(transaction.accountId)
  const toAccount = transaction.toAccountId
    ? accountMap.get(transaction.toAccountId)
    : null
  const category = transaction.categoryId
    ? categoryMap.get(transaction.categoryId)
    : null

  return {
    ...transaction,
    accountName: account?.name ?? "Unknown account",
    categoryName: category?.name ?? null,
    toAccountName: toAccount?.name ?? null,
  }
}

export function validateTransactionShape(args: {
  type: TransactionKind
  amount: number
  accountId: Id<"accounts">
  toAccountId?: Id<"accounts">
  categoryId?: Id<"categories">
}) {
  if (args.amount <= 0) {
    throw new ConvexError("Amount must be greater than zero.")
  }

  if (args.type === "transfer") {
    if (!args.toAccountId) {
      throw new ConvexError("Transfers need a destination account.")
    }
    if (args.toAccountId === args.accountId) {
      throw new ConvexError("Pick two different accounts for a transfer.")
    }
    return
  }

  if (!args.categoryId) {
    throw new ConvexError("Pick a category for income and expenses.")
  }
}
