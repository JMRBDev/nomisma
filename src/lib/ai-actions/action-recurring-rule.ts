/* eslint-disable max-lines */
import { api } from "../../../convex/_generated/api"
import {
  recurringConfirmGeneratedInputSchema,
  recurringConfirmNormalizedInputSchema,
  recurringRuleGeneratedInputSchema,
  recurringRuleNormalizedInputSchema,
  recurringToggleGeneratedInputSchema,
  recurringToggleNormalizedInputSchema,
} from "./actions-types"
import { formatCurrency, resolveAmount, resolveDate } from "./actions-helpers"
import {
  resolveAccount,
  resolveCategory,
  resolveRecurringRule,
} from "./actions-resolvers"
import type {
  AiActionDefinition,
  NormalizeClarify,
  NormalizeNoMatch,
  NormalizeResult,
  PlannerContext,
  PlannerRecurringRule,
} from "./actions-types"
import type { z } from "zod"

function getRecurringRuleById(context: PlannerContext, ruleId: string) {
  return context.recurringRules.find((rule) => rule.id === ruleId) ?? null
}

type RuleLookupFailure = NormalizeClarify | NormalizeNoMatch

function isRuleLookupFailure(
  value: PlannerRecurringRule | RuleLookupFailure
): value is RuleLookupFailure {
  return (
    typeof value === "object" &&
    "type" in value &&
    (value.type === "clarify" || value.type === "no_match")
  )
}

function resolveRuleOrAsk(
  context: PlannerContext,
  input: {
    ruleId?: string
    recurringDescription?: string
  },
  options?: {
    activeOnly?: boolean
    allowSingleDueItem?: boolean
  }
):
  | PlannerRecurringRule
  | RuleLookupFailure {
  if (options?.allowSingleDueItem && !input.ruleId && !input.recurringDescription) {
    const dueRules = context.recurringRules.filter(
      (rule) => rule.active && rule.nextDueDate <= context.today
    )

    if (dueRules.length === 1) {
      return dueRules[0]
    }
  }

  const resolvedRule = resolveRecurringRule(context, {
    ruleId: input.ruleId,
    recurringDescription: input.recurringDescription,
    activeOnly: options?.activeOnly,
  })

  if (Array.isArray(resolvedRule)) {
    return {
      type: "clarify",
      question: "Which recurring item do you mean?",
      missingFields: ["recurringDescription"],
      options: resolvedRule.slice(0, 8),
    }
  }

  if (!resolvedRule) {
    return {
      type: "clarify",
      question: "Which recurring item should I use?",
      missingFields: ["recurringDescription"],
      options: context.recurringRules
        .filter((rule) => !options?.activeOnly || rule.active)
        .slice(0, 8)
        .map((rule) => ({
          id: rule.id,
          label: `${rule.description} (${rule.nextDueDate})`,
        })),
    }
  }

  const rule = getRecurringRuleById(context, resolvedRule.id)

  return (
    rule ?? {
      type: "no_match",
      reason: "I couldn't find that recurring item.",
    }
  )
}

function resolveRecurringCreateAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof recurringRuleNormalizedInputSchema>> {
  const parsed = recurringRuleGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The recurring input was invalid." }
  }

  if (!parsed.data.type) {
    return {
      type: "clarify",
      question: "Is this recurring income or recurring expense?",
      missingFields: ["type"],
    }
  }

  const amount = resolveAmount(parsed.data.amount)

  if (!amount) {
    return {
      type: "clarify",
      question: "What amount should I use?",
      missingFields: ["amount"],
    }
  }

  const resolvedAccount = resolveAccount(context, parsed.data.accountName, {
    fallbackToSingleActive: true,
  })

  if (Array.isArray(resolvedAccount)) {
    return {
      type: "clarify",
      question: "Which account should I use?",
      missingFields: ["accountName"],
      options: resolvedAccount.slice(0, 8),
    }
  }

  if (!resolvedAccount) {
    return {
      type: "clarify",
      question: "Which account should I use?",
      missingFields: ["accountName"],
    }
  }

  const resolvedCategory = resolveCategory(context, parsed.data.categoryName)

  if (Array.isArray(resolvedCategory)) {
    return {
      type: "clarify",
      question: "Which category should I use?",
      missingFields: ["categoryName"],
      options: resolvedCategory.slice(0, 8),
    }
  }

  if (!resolvedCategory?.id) {
    return {
      type: "clarify",
      question: "Which category should I use?",
      missingFields: ["categoryName"],
    }
  }

  if (!parsed.data.frequency) {
    return {
      type: "clarify",
      question: "How often should this repeat?",
      missingFields: ["frequency"],
    }
  }

  const startDate = resolveDate(parsed.data.startDate, context.today)
  const nextDueDate = resolveDate(parsed.data.nextDueDate, startDate ?? context.today)
  const endDate = resolveDate(parsed.data.endDate)

  if (!startDate || !nextDueDate) {
    return {
      type: "clarify",
      question: "Which dates should I use? Please answer with YYYY-MM-DD.",
      missingFields: ["startDate", "nextDueDate"],
    }
  }

  if (nextDueDate < startDate) {
    return {
      type: "clarify",
      question: "The first due date must be on or after the start date.",
      missingFields: ["nextDueDate"],
    }
  }

  if (endDate && endDate < nextDueDate) {
    return {
      type: "clarify",
      question: "The end date must be on or after the first due date.",
      missingFields: ["endDate"],
    }
  }

  const description =
    parsed.data.description?.trim() || resolvedCategory.name || "Recurring item"
  const normalizedInput = {
    ruleId: undefined,
    recurringDescription: description,
    type: parsed.data.type,
    amount,
    accountId: resolvedAccount.id,
    accountName: resolvedAccount.name,
    categoryId: resolvedCategory.id,
    categoryName: resolvedCategory.name,
    description,
    frequency: parsed.data.frequency,
    startDate,
    nextDueDate,
    endDate: endDate ?? undefined,
    active: true,
  }

  return {
    type: "ready",
    normalizedInput,
    summary: `This will create a recurring ${parsed.data.type} of ${formatCurrency(amount, context.settings?.baseCurrency, context.locale)} for ${description}.`,
  }
}

function resolveRecurringUpdateAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof recurringRuleNormalizedInputSchema>> {
  const parsed = recurringRuleGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The recurring input was invalid." }
  }

  const ruleResolution = resolveRuleOrAsk(context, parsed.data)

  if (isRuleLookupFailure(ruleResolution)) {
    return ruleResolution
  }

  const rule = ruleResolution
  const type = parsed.data.type ?? rule.type
  const amount =
    parsed.data.amount === undefined ? rule.amount : resolveAmount(parsed.data.amount)

  if (!amount) {
    return {
      type: "clarify",
      question: "What amount should I use?",
      missingFields: ["amount"],
    }
  }

  const resolvedAccount = parsed.data.accountName
    ? resolveAccount(context, parsed.data.accountName)
    : { id: rule.accountId, name: rule.accountName ?? "Account" }

  if (Array.isArray(resolvedAccount)) {
    return {
      type: "clarify",
      question: "Which account should I use?",
      missingFields: ["accountName"],
      options: resolvedAccount.slice(0, 8),
    }
  }

  if (!resolvedAccount) {
    return {
      type: "clarify",
      question: "Which account should I use?",
      missingFields: ["accountName"],
    }
  }

  const resolvedCategory = parsed.data.categoryName
    ? resolveCategory(context, parsed.data.categoryName)
    : { id: rule.categoryId, name: rule.categoryName ?? "Category" }

  if (Array.isArray(resolvedCategory)) {
    return {
      type: "clarify",
      question: "Which category should I use?",
      missingFields: ["categoryName"],
      options: resolvedCategory.slice(0, 8),
    }
  }

  if (!resolvedCategory?.id) {
    return {
      type: "clarify",
      question: "Which category should I use?",
      missingFields: ["categoryName"],
    }
  }

  const frequency = parsed.data.frequency ?? rule.frequency
  const startDate = resolveDate(parsed.data.startDate, rule.startDate)
  const nextDueDate = resolveDate(parsed.data.nextDueDate, rule.nextDueDate)
  const endDate =
    parsed.data.endDate === undefined
      ? rule.endDate
      : resolveDate(parsed.data.endDate)

  if (!startDate || !nextDueDate) {
    return {
      type: "clarify",
      question: "Which dates should I use? Please answer with YYYY-MM-DD.",
      missingFields: ["startDate", "nextDueDate"],
    }
  }

  if (nextDueDate < startDate) {
    return {
      type: "clarify",
      question: "The first due date must be on or after the start date.",
      missingFields: ["nextDueDate"],
    }
  }

  if (endDate && endDate < nextDueDate) {
    return {
      type: "clarify",
      question: "The end date must be on or after the first due date.",
      missingFields: ["endDate"],
    }
  }

  const description = parsed.data.description?.trim() || rule.description
  const normalizedInput = {
    ruleId: rule.id,
    recurringDescription: rule.description,
    type,
    amount,
    accountId: resolvedAccount.id,
    accountName: resolvedAccount.name,
    categoryId: resolvedCategory.id,
    categoryName: resolvedCategory.name,
    description,
    frequency,
    startDate,
    nextDueDate,
    endDate: endDate ?? undefined,
    active: rule.active,
  }

  if (
    normalizedInput.type === rule.type &&
    normalizedInput.amount === rule.amount &&
    normalizedInput.accountId === rule.accountId &&
    normalizedInput.categoryId === rule.categoryId &&
    normalizedInput.description === rule.description &&
    normalizedInput.frequency === rule.frequency &&
    normalizedInput.startDate === rule.startDate &&
    normalizedInput.nextDueDate === rule.nextDueDate &&
    (normalizedInput.endDate ?? null) === (rule.endDate ?? null)
  ) {
    return {
      type: "no_match",
      reason: "There is nothing to update for that recurring item.",
    }
  }

  return {
    type: "ready",
    normalizedInput,
    summary: `This will update the recurring item "${rule.description}".`,
  }
}

function resolveRecurringToggleAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>,
  nextActive: boolean
): NormalizeResult<z.infer<typeof recurringToggleNormalizedInputSchema>> {
  const parsed = recurringToggleGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The recurring input was invalid." }
  }

  const ruleResolution = resolveRuleOrAsk(context, parsed.data)

  if (isRuleLookupFailure(ruleResolution)) {
    return ruleResolution
  }

  if (ruleResolution.active === nextActive) {
    return {
      type: "no_match",
      reason: nextActive
        ? "That recurring item is already active."
        : "That recurring item is already paused.",
    }
  }

  return {
    type: "ready",
    normalizedInput: {
      ruleId: ruleResolution.id,
      recurringDescription: ruleResolution.description,
      active: nextActive,
    },
    summary: `${nextActive ? "This will resume" : "This will pause"} "${ruleResolution.description}".`,
  }
}

function resolveRecurringConfirmAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof recurringConfirmNormalizedInputSchema>> {
  const parsed = recurringConfirmGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The recurring input was invalid." }
  }

  const ruleResolution = resolveRuleOrAsk(context, parsed.data, {
    activeOnly: true,
    allowSingleDueItem: true,
  })

  if (isRuleLookupFailure(ruleResolution)) {
    return ruleResolution
  }

  const date = resolveDate(parsed.data.date, ruleResolution.nextDueDate)

  if (!date) {
    return {
      type: "clarify",
      question: "Which date should I use? Please answer with YYYY-MM-DD.",
      missingFields: ["date"],
    }
  }

  return {
    type: "ready",
    normalizedInput: {
      ruleId: ruleResolution.id,
      recurringDescription: ruleResolution.description,
      date,
    },
    summary: `This will confirm "${ruleResolution.description}" on ${date}.`,
  }
}

export const recurringCreateRuleDefinition: AiActionDefinition = {
  key: "recurring.create",
  title: "Create recurring item",
  description: "Create a recurring item directly.",
  domains: ["recurring"],
  contextFields: ["accounts", "categories", "recurringRules"],
  generatedInputSchema: recurringRuleGeneratedInputSchema,
  normalizedInputSchema: recurringRuleNormalizedInputSchema,
  routeScopes: ["recurring", "overview"],
  normalize: resolveRecurringCreateAction,
  execute: async (client, input) => {
    const parsed = recurringRuleNormalizedInputSchema.parse(input)
    await client.mutation(api.recurring.createRecurringRule, {
      type: parsed.type,
      amount: parsed.amount,
      accountId: parsed.accountId as any,
      categoryId: parsed.categoryId as any,
      description: parsed.description,
      frequency: parsed.frequency,
      startDate: parsed.startDate,
      nextDueDate: parsed.nextDueDate,
      endDate: parsed.endDate,
    })

    return {
      message: `Recurring item created: ${parsed.description}.`,
    }
  },
}

export const recurringUpdateDefinition: AiActionDefinition = {
  key: "recurring.update",
  title: "Update recurring item",
  description: "Update an existing recurring item.",
  domains: ["recurring"],
  contextFields: ["accounts", "categories", "recurringRules"],
  generatedInputSchema: recurringRuleGeneratedInputSchema,
  normalizedInputSchema: recurringRuleNormalizedInputSchema,
  routeScopes: ["recurring", "overview"],
  normalize: resolveRecurringUpdateAction,
  execute: async (client, input) => {
    const parsed = recurringRuleNormalizedInputSchema.parse(input)
    await client.mutation(api.recurring.updateRecurringRule, {
      ruleId: parsed.ruleId as any,
      type: parsed.type,
      amount: parsed.amount,
      accountId: parsed.accountId as any,
      categoryId: parsed.categoryId as any,
      description: parsed.description,
      frequency: parsed.frequency,
      startDate: parsed.startDate,
      nextDueDate: parsed.nextDueDate,
      endDate: parsed.endDate,
    })

    return {
      message: `Recurring item updated: ${parsed.recurringDescription}.`,
    }
  },
}

export const recurringPauseDefinition: AiActionDefinition = {
  key: "recurring.pause",
  title: "Pause recurring item",
  description: "Pause an active recurring item.",
  domains: ["recurring"],
  contextFields: ["recurringRules"],
  generatedInputSchema: recurringToggleGeneratedInputSchema,
  normalizedInputSchema: recurringToggleNormalizedInputSchema,
  routeScopes: ["recurring", "overview"],
  normalize: (context, input) =>
    resolveRecurringToggleAction(context, input, false),
  execute: async (client, input) => {
    const parsed = recurringToggleNormalizedInputSchema.parse(input)
    await client.mutation(api.recurring.toggleRecurringRule, {
      ruleId: parsed.ruleId as any,
      active: parsed.active,
    })

    return {
      message: `Recurring item paused: ${parsed.recurringDescription}.`,
    }
  },
}

export const recurringResumeDefinition: AiActionDefinition = {
  key: "recurring.resume",
  title: "Resume recurring item",
  description: "Resume a paused recurring item.",
  domains: ["recurring"],
  contextFields: ["recurringRules"],
  generatedInputSchema: recurringToggleGeneratedInputSchema,
  normalizedInputSchema: recurringToggleNormalizedInputSchema,
  routeScopes: ["recurring", "overview"],
  normalize: (context, input) =>
    resolveRecurringToggleAction(context, input, true),
  execute: async (client, input) => {
    const parsed = recurringToggleNormalizedInputSchema.parse(input)
    await client.mutation(api.recurring.toggleRecurringRule, {
      ruleId: parsed.ruleId as any,
      active: parsed.active,
    })

    return {
      message: `Recurring item resumed: ${parsed.recurringDescription}.`,
    }
  },
}

export const recurringConfirmDefinition: AiActionDefinition = {
  key: "recurring.confirm_due",
  title: "Confirm recurring item",
  description: "Confirm a due recurring item and create its transaction.",
  domains: ["recurring"],
  contextFields: ["recurringRules"],
  generatedInputSchema: recurringConfirmGeneratedInputSchema,
  normalizedInputSchema: recurringConfirmNormalizedInputSchema,
  routeScopes: ["recurring", "overview"],
  normalize: resolveRecurringConfirmAction,
  execute: async (client, input) => {
    const parsed = recurringConfirmNormalizedInputSchema.parse(input)
    await client.mutation(api.recurring.confirmRecurringRule, {
      ruleId: parsed.ruleId as any,
      date: parsed.date,
    })

    return {
      message: `Recurring item confirmed: ${parsed.recurringDescription}.`,
    }
  },
}
