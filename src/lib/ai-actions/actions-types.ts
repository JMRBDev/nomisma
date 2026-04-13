import { z } from "zod"
import type { ConvexHttpClient } from "convex/browser"

export type Frequency = "daily" | "weekly" | "monthly" | "yearly"
export type RouteScope = "overview" | "accounts" | "transactions" | "budgets" | "recurring"
export type PlannerCategory = { id: string; name: string; archived: boolean }
export type PlannerBudget = { id: string; month: string; categoryId: string | null; limitAmount: number }
export type ClarifyOption = { id: string; label: string }
export type ActionExecutionResult = { message: string }
export type PlannerTransaction = {
  id: string
  type: "income" | "expense" | "transfer"
  date: string
  amount: number
  description: string
  categoryId: string | null
  categoryName: string | null
  recurringRuleId: string | null
}
export type PlannerContext = {
  locale: string
  today: string
  currentMonth: string
  settings: { baseCurrency: string } | null
  categories: Array<PlannerCategory>
  budgets: Array<PlannerBudget>
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
export const frequencyValues = ["daily", "weekly", "monthly", "yearly"] as const
const toOpts = <T extends string>(v: ReadonlyArray<T>) =>
  v.map((x) => ({ id: x as string, label: x[0].toUpperCase() + x.slice(1) }))
export const frequencyOptions = toOpts(frequencyValues)
const s1 = z.string().trim().min(1)
const pn = z.number().finite().positive()
const ds = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
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
