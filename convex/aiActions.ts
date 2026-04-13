import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import * as AiActions from "./model/ai_actions"
import * as AiActionsRecurring from "./model/ai_actions_recurring"
import { recurringFrequencyValidator } from "./schema"

export const getPlannerContext = query({
  args: {
    selectedIds: v.optional(v.array(v.string())),
  },
  handler: (ctx, args) => AiActions.getPlannerContext(ctx, args),
})

export const categorizeTransactions = mutation({
  args: {
    transactionIds: v.array(v.id("transactions")),
    categoryId: v.id("categories"),
  },
  handler: (ctx, args) => AiActions.categorizeTransactions(ctx, args),
})

export const createRecurringRuleFromTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    frequency: recurringFrequencyValidator,
    startDate: v.string(),
    nextDueDate: v.string(),
    endDate: v.optional(v.string()),
  },
  handler: (ctx, args) =>
    AiActionsRecurring.createRecurringRuleFromTransaction(ctx, args),
})
