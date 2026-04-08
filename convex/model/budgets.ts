import { ConvexError } from "convex/values"
import { buildMappedTransactions } from "./read_models_transactions"
import { buildBudgetStatuses } from "./read_models_budgets"
import { groupCategories } from "./read_models_categories"
import {
  getAccountsByUserId,
  getBudgetsByUserId,
  getCategoriesByUserId,
  getOwnedBudget,
  getOwnedCategory,
  getResolvedSettings,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import { getCurrentCalendarMonth } from "./dates"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export async function getBudgetsPageData(
  ctx: QueryCtx,
  args: { currentMonth?: string }
) {
  const user = await requireUser(ctx)
  const now = new Date()
  const [{ settings }, accounts, categories, transactions, budgets] =
    await Promise.all([
      getResolvedSettings(ctx, user._id),
      getAccountsByUserId(ctx, user._id),
      getCategoriesByUserId(ctx, user._id),
      getTransactionsByUserId(ctx, user._id),
      getBudgetsByUserId(ctx, user._id),
    ])

  const currentMonth = args.currentMonth ?? getCurrentCalendarMonth(now)
  const dashboardTransactions = buildMappedTransactions(
    accounts,
    categories,
    transactions
  )

  return {
    settings,
    categories: groupCategories(categories),
    budgets: buildBudgetStatuses(
      budgets,
      categories,
      dashboardTransactions,
      currentMonth
    ),
  }
}

export async function upsertBudget(
  ctx: MutationCtx,
  args: {
    month: string
    categoryId?: Parameters<typeof getOwnedCategory>[2]
    limitAmount: number
  }
) {
  const user = await requireUser(ctx)

  if (args.limitAmount <= 0) {
    throw new ConvexError("Budget amount must be greater than zero.")
  }

  if (args.categoryId) {
    const category = await getOwnedCategory(ctx, user._id, args.categoryId)
    if (category.kind !== "expense") {
      throw new ConvexError("Budgets only work with expense categories.")
    }
  }

  const categoryKey = args.categoryId ?? "total"
  const existing = await ctx.db
    .query("budgets")
    .withIndex("by_userId_month_categoryKey", (q) =>
      q
        .eq("userId", user._id)
        .eq("month", args.month)
        .eq("categoryKey", categoryKey)
    )
    .unique()

  if (existing) {
    await ctx.db.patch(existing._id, {
      limitAmount: args.limitAmount,
      categoryId: args.categoryId,
      updatedAt: Date.now(),
    })
    return existing._id
  }

  return ctx.db.insert("budgets", {
    userId: user._id,
    month: args.month,
    categoryKey,
    categoryId: args.categoryId,
    limitAmount: args.limitAmount,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}

export async function deleteBudget(
  ctx: MutationCtx,
  args: {
    budgetId: Parameters<typeof getOwnedBudget>[2]
  }
) {
  const user = await requireUser(ctx)
  const budget = await getOwnedBudget(ctx, user._id, args.budgetId)
  await ctx.db.delete(budget._id)
}
