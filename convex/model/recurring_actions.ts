import {
  getAccountsByUserId,
  getOwnedRecurringRule,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import {
  applyTransactionToBalances,
  assertNoNegativeBalances,
  buildBalanceMap,
} from "./balances"
import { addFrequency, monthKeyFromDate } from "./dates"
import type { MutationCtx } from "../_generated/server"
import type { TransactionDoc } from "./types"

export async function toggleRecurringRule(
  ctx: MutationCtx,
  args: {
    ruleId: Parameters<typeof getOwnedRecurringRule>[2]
    active: boolean
  }
) {
  const user = await requireUser(ctx)
  const rule = await getOwnedRecurringRule(ctx, user._id, args.ruleId)

  await ctx.db.patch(rule._id, {
    active: args.active,
    updatedAt: Date.now(),
  })
}

export async function confirmRecurringRule(
  ctx: MutationCtx,
  args: {
    ruleId: Parameters<typeof getOwnedRecurringRule>[2]
    date?: string
  }
) {
  const user = await requireUser(ctx)
  const rule = await getOwnedRecurringRule(ctx, user._id, args.ruleId)
  const [accounts, existingTransactions] = await Promise.all([
    getAccountsByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

  const confirmationDate = args.date ?? rule.nextDueDate
  const transaction: Pick<
    TransactionDoc,
    "type" | "amount" | "status" | "accountId" | "toAccountId"
  > = {
    type: rule.type,
    amount: rule.amount,
    status: "posted",
    accountId: rule.accountId,
    toAccountId: undefined,
  }

  const balances = buildBalanceMap(accounts, existingTransactions)
  applyTransactionToBalances(balances, transaction)
  assertNoNegativeBalances(balances, [rule.accountId])

  const timestamp = Date.now()
  await ctx.db.insert("transactions", {
    userId: user._id,
    type: rule.type,
    amount: rule.amount,
    date: confirmationDate,
    month: monthKeyFromDate(confirmationDate),
    status: "posted",
    accountId: rule.accountId,
    categoryId: rule.categoryId,
    description: rule.description,
    recurringRuleId: rule._id,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  let nextDueDate = rule.nextDueDate
  while (nextDueDate <= confirmationDate) {
    nextDueDate = addFrequency(nextDueDate, rule.frequency)
  }

  const shouldStayActive = !rule.endDate || nextDueDate <= rule.endDate
  await ctx.db.patch(rule._id, {
    nextDueDate,
    active: shouldStayActive,
    updatedAt: timestamp,
  })
}
