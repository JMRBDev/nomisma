import type { Doc } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export type MoneyCtx = QueryCtx | MutationCtx
export type AccountDoc = Doc<"accounts">
export type CategoryDoc = Doc<"categories">
export type TransactionDoc = Doc<"transactions">
export type RecurringRuleDoc = Doc<"recurringRules">
export type BudgetDoc = Doc<"budgets">
export type SettingsDoc = Doc<"userSettings">
export type TransactionKind = TransactionDoc["type"]
