import { api } from "../../../convex/_generated/api"
import {
  frequencyOptions,
  recurringGeneratedInputSchema,
  recurringNormalizedInputSchema,
} from "./actions-types"
import { resolveTransactions } from "./actions-resolvers"
import type {
  AiActionDefinition,
  NormalizeResult,
  PlannerContext,
} from "./actions-types"
import type { z } from "zod"

type RecurringActionVerb = "create" | "mark"

function normalizeRecurringAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>,
  verb: RecurringActionVerb
): NormalizeResult<z.infer<typeof recurringNormalizedInputSchema>> {
  const parsed = recurringGeneratedInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { type: "no_match", reason: "The recurring input was invalid." }
  }
  const transactionResolution = resolveTransactions(context, parsed.data)
  if (transactionResolution.type !== "ready") {
    return transactionResolution
  }
  const transaction = transactionResolution.normalizedInput[0]
  if (transaction.type === "transfer") {
    return {
      type: "no_match",
      reason: "Transfers cannot become recurring reminders.",
    }
  }
  if (!transaction.categoryId) {
    return {
      type: "no_match",
      reason:
        "This transaction needs a category before it can become recurring.",
    }
  }
  if (transaction.recurringRuleId) {
    return {
      type: "no_match",
      reason: "This transaction is already linked to a recurring reminder.",
    }
  }
  if (!parsed.data.frequency) {
    return {
      type: "clarify",
      question: "How often should this repeat?",
      missingFields: ["frequency"],
      options: frequencyOptions,
    }
  }
  const startDate =
    parsed.data.startDate && /^\d{4}-\d{2}-\d{2}$/.test(parsed.data.startDate)
      ? parsed.data.startDate
      : transaction.date
  const nextDueDate =
    parsed.data.nextDueDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(parsed.data.nextDueDate)
      ? parsed.data.nextDueDate
      : transaction.date < context.today
        ? context.today
        : transaction.date
  const endDate =
    parsed.data.endDate && /^\d{4}-\d{2}-\d{2}$/.test(parsed.data.endDate)
      ? parsed.data.endDate
      : undefined
  if (endDate && endDate < nextDueDate) {
    return {
      type: "clarify",
      question:
        "The end date must be on or after the first due date. Which end date should I use?",
      missingFields: ["endDate"],
    }
  }
  const normalizedInput = {
    transactionId: transaction.id,
    transactionDescription: transaction.description,
    frequency: parsed.data.frequency,
    startDate,
    nextDueDate,
    endDate,
  }
  return {
    type: "ready",
    normalizedInput,
    summary: `${verb === "create" ? "This will create a recurring reminder" : "This will mark the transaction as recurring"} using a ${parsed.data.frequency} schedule for "${transaction.description}".`,
  }
}

function createRecurringDefinition(
  key: string,
  title: string,
  description: string,
  routeScopes: Array<"transactions" | "recurring">,
  verb: RecurringActionVerb,
  successMessage: (transactionDescription: string) => string
): AiActionDefinition {
  return {
    key,
    title,
    description,
    domains: ["recurring", "transaction"],
    contextFields: ["transactions"],
    generatedInputSchema: recurringGeneratedInputSchema,
    normalizedInputSchema: recurringNormalizedInputSchema,
    routeScopes,
    requiresTransactions: true,
    normalize: (context, input) =>
      normalizeRecurringAction(context, input, verb),
    execute: async (client, input) => {
      const parsed = recurringNormalizedInputSchema.parse(input)
      await client.mutation(api.aiActions.createRecurringRuleFromTransaction, {
        transactionId: parsed.transactionId as any,
        frequency: parsed.frequency,
        startDate: parsed.startDate,
        nextDueDate: parsed.nextDueDate,
        endDate: parsed.endDate,
      })
      return {
        message: successMessage(parsed.transactionDescription),
      }
    },
  }
}

export const recurringCreateDefinition = createRecurringDefinition(
  "reminder.create_from_transaction",
  "Create reminder from transaction",
  "Create a recurring reminder from an existing transaction.",
  ["transactions", "recurring"],
  "create",
  (transactionDescription) =>
    `Recurring reminder created from "${transactionDescription}".`
)

export const recurringMarkDefinition = createRecurringDefinition(
  "transaction.mark_recurring",
  "Mark transaction as recurring",
  "Mark one transaction as recurring by creating a recurring rule from it.",
  ["transactions"],
  "mark",
  (transactionDescription) =>
    `Transaction "${transactionDescription}" is now recurring.`
)
