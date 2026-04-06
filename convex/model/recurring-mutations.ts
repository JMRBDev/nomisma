import { ConvexError } from "convex/values"
import {
  getOwnedAccount,
  getOwnedCategory,
  getOwnedRecurringRule,
  requireUser,
} from "./queries"
import type { MutationCtx } from "../_generated/server"
import type { RecurringRuleDoc } from "./types"

export async function createRecurringRule(
  ctx: MutationCtx,
  args: {
    type: "income" | "expense"
    amount: number
    accountId: Parameters<typeof getOwnedAccount>[2]
    categoryId: Parameters<typeof getOwnedCategory>[2]
    description: string
    frequency: RecurringRuleDoc["frequency"]
    startDate: string
    nextDueDate: string
    endDate?: string
  }
) {
  const user = await requireUser(ctx)

  if (args.amount <= 0) {
    throw new ConvexError("Amount must be greater than zero.")
  }

  await getOwnedAccount(ctx, user._id, args.accountId)
  const category = await getOwnedCategory(ctx, user._id, args.categoryId)
  if (category.kind !== args.type) {
    throw new ConvexError("The category must match the recurring item type.")
  }

  return ctx.db.insert("recurringRules", {
    userId: user._id,
    type: args.type,
    amount: args.amount,
    accountId: args.accountId,
    categoryId: args.categoryId,
    description: args.description.trim() || "Recurring item",
    frequency: args.frequency,
    startDate: args.startDate,
    nextDueDate: args.nextDueDate,
    endDate: args.endDate?.trim() || undefined,
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}

export async function updateRecurringRule(
  ctx: MutationCtx,
  args: {
    ruleId: Parameters<typeof getOwnedRecurringRule>[2]
    type?: "income" | "expense"
    amount?: number
    accountId?: Parameters<typeof getOwnedAccount>[2]
    categoryId?: Parameters<typeof getOwnedCategory>[2]
    description?: string
    frequency?: RecurringRuleDoc["frequency"]
    startDate?: string
    nextDueDate?: string
    endDate?: string
  }
) {
  const user = await requireUser(ctx)
  const rule = await getOwnedRecurringRule(ctx, user._id, args.ruleId)
  const patch: Record<string, unknown> = { updatedAt: Date.now() }

  if (args.amount !== undefined) {
    if (args.amount <= 0) {
      throw new ConvexError("Amount must be greater than zero.")
    }
    patch.amount = args.amount
  }

  if (args.type !== undefined) {
    patch.type = args.type
  }

  if (args.accountId !== undefined) {
    await getOwnedAccount(ctx, user._id, args.accountId)
    patch.accountId = args.accountId
  }

  if (args.categoryId !== undefined) {
    const category = await getOwnedCategory(ctx, user._id, args.categoryId)
    const ruleType = args.type ?? rule.type
    if (category.kind !== ruleType) {
      throw new ConvexError("The category must match the recurring item type.")
    }
    patch.categoryId = args.categoryId
  }

  if (args.description !== undefined) {
    patch.description = args.description.trim() || "Recurring item"
  }

  if (args.frequency !== undefined) {
    patch.frequency = args.frequency
  }

  if (args.startDate !== undefined) {
    patch.startDate = args.startDate
  }

  if (args.nextDueDate !== undefined) {
    patch.nextDueDate = args.nextDueDate
  }

  if (args.endDate !== undefined) {
    patch.endDate = args.endDate.trim() || undefined
  }

  await ctx.db.patch(rule._id, patch)
}
