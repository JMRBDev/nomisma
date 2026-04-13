import { ConvexError } from "convex/values"
import { getOwnedCategory, getOwnedTransaction, requireUser } from "./queries"
import type { Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"

export async function createRecurringRuleFromTransaction(
  ctx: MutationCtx,
  args: {
    transactionId: Id<"transactions">
    frequency: "daily" | "weekly" | "monthly" | "yearly"
    startDate: string
    nextDueDate: string
    endDate?: string
  }
) {
  const user = await requireUser(ctx)
  const transaction = await getOwnedTransaction(
    ctx,
    user._id,
    args.transactionId
  )

  if (transaction.type === "transfer") {
    throw new ConvexError("Transfers cannot become recurring reminders.")
  }

  if (!transaction.categoryId) {
    throw new ConvexError("Pick a category before making this recurring.")
  }

  if (transaction.recurringRuleId) {
    return {
      recurringRuleId: transaction.recurringRuleId,
      created: false,
    }
  }

  await getOwnedCategory(ctx, user._id, transaction.categoryId)
  const now = Date.now()
  const recurringRuleId = await ctx.db.insert("recurringRules", {
    userId: user._id,
    type: transaction.type === "income" ? "income" : "expense",
    amount: transaction.amount,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    description: transaction.description.trim() || "Recurring item",
    frequency: args.frequency,
    startDate: args.startDate,
    nextDueDate: args.nextDueDate,
    endDate: args.endDate?.trim() || undefined,
    active: true,
    createdAt: now,
    updatedAt: now,
  })

  await ctx.db.patch(transaction._id, {
    recurringRuleId,
    updatedAt: now,
  })

  return {
    recurringRuleId,
    created: true,
  }
}
