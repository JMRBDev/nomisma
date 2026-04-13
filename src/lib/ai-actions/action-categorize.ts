import { api } from "../../../convex/_generated/api"
import {
  categorizeGeneratedInputSchema,
  categorizeNormalizedInputSchema,
} from "./actions-types"
import { resolveCategory, resolveTransactions } from "./actions-resolvers"
import type {
  AiActionDefinition,
  NormalizeResult,
  PlannerContext,
} from "./actions-types"
import type { z } from "zod"

function normalizeCategorizeAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof categorizeNormalizedInputSchema>> {
  const parsed = categorizeGeneratedInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { type: "no_match", reason: "The categorize input was invalid." }
  }
  if (!parsed.data.categoryName) {
    return {
      type: "clarify",
      question: "Which category should I use?",
      missingFields: ["categoryName"],
      options: context.categories
        .filter((category) => !category.archived)
        .slice(0, 8)
        .map((category) => ({
          id: category.id,
          label: category.name,
        })),
    }
  }
  const resolvedCategory = resolveCategory(context, parsed.data.categoryName)
  if (Array.isArray(resolvedCategory)) {
    return {
      type: "clarify",
      question: "Which category did you mean?",
      missingFields: ["categoryName"],
      options: resolvedCategory.slice(0, 8),
    }
  }
  if (!resolvedCategory || !resolvedCategory.id) {
    return { type: "no_match", reason: "I couldn't find that category." }
  }
  const transactionResolution = resolveTransactions(context, parsed.data)
  if (transactionResolution.type !== "ready") {
    return transactionResolution
  }
  const transactions = transactionResolution.normalizedInput.filter(
    (transaction) => transaction.type !== "transfer"
  )
  if (transactions.length === 0) {
    return {
      type: "no_match",
      reason: "I can only categorize income or expense transactions.",
    }
  }
  const normalizedInput = {
    categoryId: resolvedCategory.id,
    categoryName: resolvedCategory.name,
    transactionIds: transactions.map((transaction) => transaction.id),
    transactionDescriptions: transactions.map(
      (transaction) => transaction.description
    ),
  }
  return {
    type: "ready",
    normalizedInput,
    summary: `This will categorize ${transactions.length} transaction${transactions.length === 1 ? "" : "s"} as ${resolvedCategory.name}.`,
  }
}

export const categorizeDefinition: AiActionDefinition = {
  key: "transaction.categorize",
  title: "Categorize transactions",
  description: "Apply one category to one or more transactions.",
  domains: ["transaction"],
  contextFields: ["categories", "transactions"],
  generatedInputSchema: categorizeGeneratedInputSchema,
  normalizedInputSchema: categorizeNormalizedInputSchema,
  routeScopes: ["transactions"],
  requiresTransactions: true,
  normalize: normalizeCategorizeAction,
  execute: async (client, input) => {
    const parsed = categorizeNormalizedInputSchema.parse(input)
    const result = await client.mutation(api.aiActions.categorizeTransactions, {
      categoryId: parsed.categoryId as any,
      transactionIds: parsed.transactionIds as any,
    })
    return {
      message: `Categorized ${result.count} transaction${result.count === 1 ? "" : "s"} as ${parsed.categoryName}.`,
    }
  },
}
