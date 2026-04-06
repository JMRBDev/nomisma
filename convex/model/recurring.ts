import { buildMappedTransactions } from "./read_models_transactions"
import {
  buildAccountSummaries,
  groupAccountSummaries,
} from "./read_models_accounts"
import { groupCategories } from "./read_models_categories"
import { buildRecurringItems } from "./read_models_recurring"
import {
  getAccountsByUserId,
  getCategoriesByUserId,
  getRecurringRulesByUserId,
  getResolvedSettings,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import { toDayKey } from "./dates"
import type { QueryCtx } from "../_generated/server"

export { createRecurringRule, updateRecurringRule } from "./recurring_mutations"
export { toggleRecurringRule, confirmRecurringRule } from "./recurring_actions"

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
