import { ConvexError } from "convex/values"
import { authComponent } from "../auth"
import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export type MoneyCtx = QueryCtx | MutationCtx
export type AccountDoc = Doc<"accounts">
export type CategoryDoc = Doc<"categories">
export type TransactionDoc = Doc<"transactions">
export type RecurringRuleDoc = Doc<"recurringRules">
export type BudgetDoc = Doc<"budgets">
export type SettingsDoc = Doc<"userSettings">
export type TransactionKind = TransactionDoc["type"]

export function monthKeyFromDate(date: string) {
  return date.slice(0, 7)
}

function parseDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(dayKey: string, days: number) {
  const next = parseDayKey(dayKey)
  next.setUTCDate(next.getUTCDate() + days)
  return toDayKey(next)
}

export function addFrequency(
  dayKey: string,
  frequency: RecurringRuleDoc["frequency"]
) {
  const next = parseDayKey(dayKey)

  if (frequency === "daily") next.setUTCDate(next.getUTCDate() + 1)
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7)
  if (frequency === "monthly") next.setUTCMonth(next.getUTCMonth() + 1)
  if (frequency === "yearly") next.setUTCFullYear(next.getUTCFullYear() + 1)

  return toDayKey(next)
}

export function getCurrentCalendarMonth(now: Date) {
  return now.toISOString().slice(0, 7)
}

export function getCurrentCalendarMonthRange(now: Date) {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 0))

  return {
    start: toDayKey(start),
    end: toDayKey(end),
  }
}

export function inRange(dayKey: string, start: string, end: string) {
  return dayKey >= start && dayKey <= end
}

export function getBudgetStatus(progress: number) {
  if (progress >= 1) return "over" as const
  if (progress >= 0.8) return "near" as const
  return "healthy" as const
}

export async function requireUser(ctx: MoneyCtx) {
  return authComponent.getAuthUser(ctx)
}

export async function getSettingsByUserId(ctx: MoneyCtx, userId: string) {
  return ctx.db
    .query("userSettings")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique()
}

export async function getResolvedSettings(ctx: MoneyCtx, userId: string) {
  const settingsDoc = await getSettingsByUserId(ctx, userId)

  return {
    settingsDoc,
    settings: settingsDoc ?? null,
  }
}

export async function getAccountsByUserId(ctx: MoneyCtx, userId: string) {
  return ctx.db
    .query("accounts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect()
}

export async function getCategoriesByUserId(ctx: MoneyCtx, userId: string) {
  return ctx.db
    .query("categories")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect()
}

export async function getTransactionsByUserId(ctx: MoneyCtx, userId: string) {
  return ctx.db
    .query("transactions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect()
}

export async function getBudgetsByUserId(ctx: MoneyCtx, userId: string) {
  return ctx.db
    .query("budgets")
    .withIndex("by_userId_month", (q) => q.eq("userId", userId))
    .collect()
}

export async function getRecurringRulesByUserId(ctx: MoneyCtx, userId: string) {
  return ctx.db
    .query("recurringRules")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect()
}

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

export async function getOwnedAccount(
  ctx: MoneyCtx,
  userId: string,
  accountId: Id<"accounts">
) {
  const account = await ctx.db.get(accountId)
  if (!account || account.userId !== userId) {
    throw new ConvexError("Account not found.")
  }
  return account
}

export async function getOwnedCategory(
  ctx: MoneyCtx,
  userId: string,
  categoryId: Id<"categories">
) {
  const category = await ctx.db.get(categoryId)
  if (!category || category.userId !== userId) {
    throw new ConvexError("Category not found.")
  }
  return category
}

export async function getOwnedTransaction(
  ctx: MoneyCtx,
  userId: string,
  transactionId: Id<"transactions">
) {
  const transaction = await ctx.db.get(transactionId)
  if (!transaction || transaction.userId !== userId) {
    throw new ConvexError("Transaction not found.")
  }
  return transaction
}

export async function getOwnedBudget(
  ctx: MoneyCtx,
  userId: string,
  budgetId: Id<"budgets">
) {
  const budget = await ctx.db.get(budgetId)
  if (!budget || budget.userId !== userId) {
    throw new ConvexError("Budget not found.")
  }
  return budget
}

export async function getOwnedRecurringRule(
  ctx: MoneyCtx,
  userId: string,
  ruleId: Id<"recurringRules">
) {
  const rule = await ctx.db.get(ruleId)
  if (!rule || rule.userId !== userId) {
    throw new ConvexError("Recurring item not found.")
  }
  return rule
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
