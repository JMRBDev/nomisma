import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import * as Budgets from "./model/budgets"

export const getBudgetsPageData = query({
  args: {
    currentMonth: v.optional(v.string()),
  },
  handler: (ctx, args) => Budgets.getBudgetsPageData(ctx, args),
})

export const upsertBudget = mutation({
  args: {
    month: v.string(),
    categoryId: v.optional(v.id("categories")),
    limitAmount: v.number(),
  },
  handler: (ctx, args) => Budgets.upsertBudget(ctx, args),
})

export const deleteBudget = mutation({
  args: {
    budgetId: v.id("budgets"),
  },
  handler: (ctx, args) => Budgets.deleteBudget(ctx, args),
})
