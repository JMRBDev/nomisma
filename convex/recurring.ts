import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import * as Recurring from "./model/recurring"
import { categoryKindValidator, recurringFrequencyValidator } from "./schema"

export const getRecurringPageData = query({
  args: {
    today: v.optional(v.string()),
  },
  handler: (ctx, args) => Recurring.getRecurringPageData(ctx, args),
})

export const createRecurringRule = mutation({
  args: {
    type: categoryKindValidator,
    amount: v.number(),
    accountId: v.id("accounts"),
    categoryId: v.id("categories"),
    description: v.string(),
    frequency: recurringFrequencyValidator,
    startDate: v.string(),
    nextDueDate: v.string(),
    endDate: v.optional(v.string()),
  },
  handler: (ctx, args) => Recurring.createRecurringRule(ctx, args),
})

export const updateRecurringRule = mutation({
  args: {
    ruleId: v.id("recurringRules"),
    type: v.optional(categoryKindValidator),
    amount: v.optional(v.number()),
    accountId: v.optional(v.id("accounts")),
    categoryId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    frequency: v.optional(recurringFrequencyValidator),
    startDate: v.optional(v.string()),
    nextDueDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: (ctx, args) => Recurring.updateRecurringRule(ctx, args),
})

export const toggleRecurringRule = mutation({
  args: {
    ruleId: v.id("recurringRules"),
    active: v.boolean(),
  },
  handler: (ctx, args) => Recurring.toggleRecurringRule(ctx, args),
})

export const confirmRecurringRule = mutation({
  args: {
    ruleId: v.id("recurringRules"),
    date: v.optional(v.string()),
  },
  handler: (ctx, args) => Recurring.confirmRecurringRule(ctx, args),
})
