import type { MoneyCtx } from "./types"

export function getTransactionsByUserIdQuery(ctx: MoneyCtx, userId: string) {
  return ctx.db
    .query("transactions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
}

export async function getTransactionsByUserIdDateRange(
  ctx: MoneyCtx,
  userId: string,
  startDate: string,
  endDate: string
) {
  return ctx.db
    .query("transactions")
    .withIndex("by_userId_date", (q) =>
      q.eq("userId", userId).gte("date", startDate).lte("date", endDate)
    )
    .collect()
}

export async function getTransactionsByUserIdMonth(
  ctx: MoneyCtx,
  userId: string,
  month: string
) {
  return ctx.db
    .query("transactions")
    .withIndex("by_userId_month", (q) =>
      q.eq("userId", userId).eq("month", month)
    )
    .collect()
}

export async function getRecentTransactionsByUserId(
  ctx: MoneyCtx,
  userId: string,
  limit: number
) {
  return ctx.db
    .query("transactions")
    .withIndex("by_userId_date", (q) => q.eq("userId", userId))
    .order("desc")
    .take(limit)
}

export async function getBudgetsByUserIdMonth(
  ctx: MoneyCtx,
  userId: string,
  month: string
) {
  return ctx.db
    .query("budgets")
    .withIndex("by_userId_month", (q) =>
      q.eq("userId", userId).eq("month", month)
    )
    .collect()
}
