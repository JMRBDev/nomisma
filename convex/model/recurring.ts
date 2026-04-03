import { ConvexError } from "convex/values"
import {
  buildAccountSummaries,
  buildMappedTransactions,
  buildRecurringItems,
  groupAccountSummaries,
  groupCategories,
} from "./readModels"
import {
  addFrequency,
  applyTransactionToBalances,
  assertNoNegativeBalances,
  buildBalanceMap,
  getAccountsByUserId,
  getCategoriesByUserId,
  getOwnedAccount,
  getOwnedCategory,
  getOwnedRecurringRule,
  getRecurringRulesByUserId,
  getResolvedSettings,
  getTransactionsByUserId,
  monthKeyFromDate,
  requireUser,
  toDayKey,
} from "./shared"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import type { RecurringRuleDoc, TransactionDoc } from "./shared"

export async function getRecurringPageData(ctx: QueryCtx) {
  const user = await requireUser(ctx)
  const today = toDayKey(new Date())
  const [{ settings }, accounts, categories, transactions, recurringRules] =
    await Promise.all([
      getResolvedSettings(ctx, user._id),
      getAccountsByUserId(ctx, user._id),
      getCategoriesByUserId(ctx, user._id),
      getTransactionsByUserId(ctx, user._id),
      getRecurringRulesByUserId(ctx, user._id),
    ])

  const dashboardTransactions = buildMappedTransactions(
    accounts,
    categories,
    transactions
  )
  const accountSummaries = buildAccountSummaries(
    accounts,
    transactions,
    dashboardTransactions
  )

  return {
    settings,
    accounts: groupAccountSummaries(accountSummaries),
    categories: groupCategories(categories),
    recurring: buildRecurringItems(recurringRules, accounts, categories, today),
  }
}

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
