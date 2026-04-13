import { ConvexError } from "convex/values"
import { resolveUserSettings } from "../../shared/settings"
import { authComponent } from "../auth"
import type { Id } from "../_generated/dataModel"
import type { MoneyCtx } from "./types"

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
    settings: resolveUserSettings(settingsDoc),
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

export async function getRecurringRulesByUserId(ctx: MoneyCtx, userId: string) {
  return ctx.db
    .query("recurringRules")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect()
}

export async function getActiveRecurringRulesByUserId(
  ctx: MoneyCtx,
  userId: string
) {
  return ctx.db
    .query("recurringRules")
    .withIndex("by_userId_active", (q) =>
      q.eq("userId", userId).eq("active", true)
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
