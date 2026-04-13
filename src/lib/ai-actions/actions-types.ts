/* eslint-disable max-lines */
import { z } from "zod"
import type { ConvexHttpClient } from "convex/browser"

export type Frequency = "daily" | "weekly" | "monthly" | "yearly"
export type RouteScope = "overview" | "accounts" | "transactions" | "budgets" | "recurring"
export type PlannerCategory = {
  id: string
  name: string
  archived: boolean
  color: string
  icon: string
}
export type PlannerAccount = {
  id: string
  name: string
  type: "checking" | "savings" | "cash" | "wallet"
  archived: boolean
  includeInTotals: boolean
}
export type PlannerBudget = { id: string; month: string; categoryId: string | null; limitAmount: number }
export type ClarifyOption = { id: string; label: string }
export type ActionExecutionResult = { message: string }
export type PlannerTransaction = {
  id: string
  type: "income" | "expense" | "transfer"
  date: string
  amount: number
  status: "posted" | "planned"
  description: string
  note: string | null
  accountId: string
  accountName: string | null
  toAccountId: string | null
  toAccountName: string | null
  categoryId: string | null
  categoryName: string | null
  recurringRuleId: string | null
}
export type PlannerRecurringRule = {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  frequency: Frequency
  startDate: string
  nextDueDate: string
  endDate?: string
  active: boolean
  accountId: string
  accountName: string | null
  categoryId: string
  categoryName: string | null
}
export type PlannerContext = {
  locale: string
  today: string
  currentMonth: string
  settings: { baseCurrency: string } | null
  accounts: Array<PlannerAccount>
  categories: Array<PlannerCategory>
  budgets: Array<PlannerBudget>
  recurringRules: Array<PlannerRecurringRule>
  recentTransactions: Array<PlannerTransaction>
  selectedTransactions: Array<PlannerTransaction>
}
export type NormalizeReady<T> = { type: "ready"; normalizedInput: T; summary: string }
export type NormalizeClarify = { type: "clarify"; question: string; missingFields?: Array<string>; options?: Array<ClarifyOption> }
export type NormalizeNoMatch = { type: "no_match"; reason: string }
export type NormalizeResult<T> = NormalizeReady<T> | NormalizeClarify | NormalizeNoMatch
export type AiActionDefinition = {
  key: string
  title: string
  description: string
  generatedInputSchema: z.ZodTypeAny
  normalizedInputSchema: z.ZodTypeAny
  routeScopes?: Array<RouteScope>
  requiresTransactions?: boolean
  normalize: (context: PlannerContext, input: Record<string, unknown>) => NormalizeResult<Record<string, unknown>>
  execute: (client: ConvexHttpClient, input: Record<string, unknown>) => Promise<ActionExecutionResult>
}
export const accountTypeValues = ["checking", "savings", "cash", "wallet"] as const
export const transactionTypeValues = ["expense", "income", "transfer"] as const
export const transactionStatusValues = ["posted", "planned"] as const
export const frequencyValues = ["daily", "weekly", "monthly", "yearly"] as const
const toOpts = <T extends string>(v: ReadonlyArray<T>) =>
  v.map((x) => ({ id: x as string, label: x[0].toUpperCase() + x.slice(1) }))
export const frequencyOptions = toOpts(frequencyValues)
export const accountTypeOptions = toOpts(accountTypeValues)
const s1 = z.string().trim().min(1)
const pn = z.number().finite().positive()
const ds = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const transactionSelectionInputSchema = z.object({
  transactionId: s1.optional(),
  transactionIds: z.array(s1).optional(),
  transactionDescription: s1.optional(),
  transactionDate: s1.optional(),
  transactionAmount: pn.or(s1).optional(),
})
const recurringSelectionInputSchema = z.object({
  ruleId: s1.optional(),
  recurringDescription: s1.optional(),
})
export const budgetGeneratedInputSchema = z.object({
  categoryName: s1.optional(),
  amount: pn.or(s1).optional(),
  month: s1.optional(),
})
export const budgetNormalizedInputSchema = z.object({
  categoryId: z.string().optional(),
  categoryName: z.string().min(1),
  amount: pn,
  month: z.string().regex(/^\d{4}-\d{2}$/),
  budgetId: z.string().optional(),
})
export const categorizeGeneratedInputSchema = z.object({
  categoryName: s1.optional(),
  transactionIds: z.array(s1).optional(),
  transactionDescription: s1.optional(),
})
export const categorizeNormalizedInputSchema = z.object({
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  transactionIds: z.string().min(1).array().min(1),
  transactionDescriptions: z.string().min(1).array().min(1),
})
export const recurringGeneratedInputSchema = z.object({
  transactionId: s1.optional(),
  transactionDescription: s1.optional(),
  frequency: z.enum(frequencyValues).optional(),
  startDate: s1.optional(),
  nextDueDate: s1.optional(),
  endDate: s1.optional(),
})
export const recurringNormalizedInputSchema = z.object({
  transactionId: z.string().min(1),
  transactionDescription: z.string().min(1),
  frequency: z.enum(frequencyValues),
  startDate: ds,
  nextDueDate: ds,
  endDate: z.optional(ds),
})
export const transactionCreateGeneratedInputSchema = z.object({
  type: z.enum(transactionTypeValues).optional(),
  amount: pn.or(s1).optional(),
  date: s1.optional(),
  status: z.enum(transactionStatusValues).optional(),
  accountName: s1.optional(),
  toAccountName: s1.optional(),
  categoryName: s1.optional(),
  description: s1.optional(),
  note: s1.optional(),
})
export const transactionCreateNormalizedInputSchema = z.object({
  type: z.enum(transactionTypeValues),
  amount: pn,
  date: ds,
  status: z.enum(transactionStatusValues),
  accountId: z.string().min(1),
  accountName: z.string().min(1),
  toAccountId: z.string().min(1).optional(),
  toAccountName: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  categoryName: z.string().min(1).optional(),
  description: z.string(),
  note: z.string().optional(),
})
export const transactionUpdateGeneratedInputSchema =
  transactionSelectionInputSchema.extend({
    type: z.enum(transactionTypeValues).optional(),
    amount: pn.or(s1).optional(),
    date: s1.optional(),
    status: z.enum(transactionStatusValues).optional(),
    accountName: s1.optional(),
    toAccountName: s1.optional(),
    categoryName: s1.optional(),
    description: s1.optional(),
    note: s1.optional(),
  })
export const transactionUpdateNormalizedInputSchema = z.object({
  transactionId: z.string().min(1),
  transactionDescription: z.string().min(1),
  type: z.enum(transactionTypeValues),
  amount: pn,
  date: ds,
  status: z.enum(transactionStatusValues),
  accountId: z.string().min(1),
  accountName: z.string().min(1),
  toAccountId: z.string().min(1).optional(),
  toAccountName: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  categoryName: z.string().min(1).optional(),
  description: z.string(),
  note: z.string().optional(),
})
export const transactionDeleteGeneratedInputSchema = transactionSelectionInputSchema
export const transactionDeleteNormalizedInputSchema = z.object({
  transactionId: z.string().min(1),
  transactionDescription: z.string().min(1),
})
export const transactionAutocategorizeGeneratedInputSchema =
  transactionSelectionInputSchema
export const transactionAutocategorizeNormalizedInputSchema = z.object({
  assignments: z
    .array(
      z.object({
        transactionId: z.string().min(1),
        transactionDescription: z.string().min(1),
        categoryId: z.string().min(1),
        categoryName: z.string().min(1),
      })
    )
    .min(1),
})
export const accountCreateGeneratedInputSchema = z.object({
  name: s1.optional(),
  type: z.enum(accountTypeValues).optional(),
  openingBalance: z.number().finite().or(s1).optional(),
  includeInTotals: z.boolean().optional(),
})
export const accountCreateNormalizedInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(accountTypeValues),
  openingBalance: z.number().finite().min(0),
  includeInTotals: z.boolean(),
  color: z.string().min(1),
  icon: z.string().min(1),
})
export const categoryCreateGeneratedInputSchema = z.object({
  name: s1.optional(),
})
export const categoryCreateNormalizedInputSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().min(1),
})
export const categoryUpdateGeneratedInputSchema = z.object({
  categoryName: s1.optional(),
  newName: s1.optional(),
  color: s1.optional(),
  icon: s1.optional(),
})
export const categoryUpdateNormalizedInputSchema = z.object({
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  newName: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().min(1),
})
export const recurringRuleGeneratedInputSchema = z.object({
  ...recurringSelectionInputSchema.shape,
  type: z.enum(["income", "expense"]).optional(),
  amount: pn.or(s1).optional(),
  accountName: s1.optional(),
  categoryName: s1.optional(),
  description: s1.optional(),
  frequency: z.enum(frequencyValues).optional(),
  startDate: s1.optional(),
  nextDueDate: s1.optional(),
  endDate: s1.optional(),
})
export const recurringRuleNormalizedInputSchema = z.object({
  ruleId: z.string().min(1).optional(),
  recurringDescription: z.string().min(1),
  type: z.enum(["income", "expense"]),
  amount: pn,
  accountId: z.string().min(1),
  accountName: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  description: z.string(),
  frequency: z.enum(frequencyValues),
  startDate: ds,
  nextDueDate: ds,
  endDate: z.optional(ds),
  active: z.boolean(),
})
export const recurringToggleGeneratedInputSchema = recurringSelectionInputSchema
export const recurringToggleNormalizedInputSchema = z.object({
  ruleId: z.string().min(1),
  recurringDescription: z.string().min(1),
  active: z.boolean(),
})
export const recurringConfirmGeneratedInputSchema =
  recurringSelectionInputSchema.extend({
    date: s1.optional(),
  })
export const recurringConfirmNormalizedInputSchema = z.object({
  ruleId: z.string().min(1),
  recurringDescription: z.string().min(1),
  date: ds,
})
