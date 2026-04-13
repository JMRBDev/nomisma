import { api } from "../../../convex/_generated/api"
import {
  budgetGeneratedInputSchema,
  budgetNormalizedInputSchema,
} from "./actions-types"
import {
  formatCurrency,
  formatMonth,
  resolveAmount,
  resolveMonth,
} from "./actions-helpers"
import { resolveCategory } from "./actions-resolvers"
import type {
  AiActionDefinition,
  NormalizeResult,
  PlannerContext,
} from "./actions-types"
import type { z } from "zod"

type BudgetActionVerb = "create" | "adjust"

function normalizeBudgetAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>,
  verb: BudgetActionVerb
): NormalizeResult<z.infer<typeof budgetNormalizedInputSchema>> {
  const parsed = budgetGeneratedInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { type: "no_match", reason: "The budget input was invalid." }
  }
  const month = resolveMonth(parsed.data.month, context.currentMonth)
  if (!month) {
    return {
      type: "clarify",
      question: "Which month should I use? Please answer with YYYY-MM.",
      missingFields: ["month"],
    }
  }
  const amount = resolveAmount(parsed.data.amount)
  if (!amount) {
    return {
      type: "clarify",
      question: "What budget amount should I use?",
      missingFields: ["amount"],
    }
  }
  const resolvedCategory = resolveCategory(context, parsed.data.categoryName)
  if (!parsed.data.categoryName) {
    return {
      type: "clarify",
      question: "Which category should I use for the budget?",
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
  if (Array.isArray(resolvedCategory)) {
    return {
      type: "clarify",
      question: "Which category did you mean?",
      missingFields: ["categoryName"],
      options: resolvedCategory.slice(0, 8),
    }
  }
  if (!resolvedCategory) {
    return { type: "no_match", reason: "I couldn't find that category." }
  }
  const existingBudget = context.budgets.find(
    (budget) =>
      budget.month === month &&
      (budget.categoryId ?? undefined) === resolvedCategory.id
  )
  if (verb === "adjust" && !existingBudget) {
    return {
      type: "clarify",
      question:
        "I couldn't find an existing budget to adjust. Do you want me to create it instead?",
      missingFields: ["existingBudget"],
      options: [{ id: "create", label: "Create a new budget" }],
    }
  }
  const normalizedInput = {
    categoryId: resolvedCategory.id,
    categoryName: resolvedCategory.name,
    amount,
    month,
    budgetId: existingBudget?.id,
  }
  return {
    type: "ready",
    normalizedInput,
    summary: `This will ${verb} the ${normalizedInput.categoryName} budget to ${formatCurrency(amount, context.settings?.baseCurrency, context.locale)} for ${formatMonth(month, context.locale)}.`,
  }
}

async function upsertBudget(
  client: Parameters<AiActionDefinition["execute"]>[0],
  input: z.infer<typeof budgetNormalizedInputSchema>
) {
  await client.mutation(api.budgets.upsertBudget, {
    month: input.month,
    categoryId: input.categoryId as any,
    limitAmount: input.amount,
  })
}

function createBudgetDefinition(
  key: string,
  title: string,
  description: string,
  verb: BudgetActionVerb,
  successMessage: string
): AiActionDefinition {
  return {
    key,
    title,
    description,
    generatedInputSchema: budgetGeneratedInputSchema,
    normalizedInputSchema: budgetNormalizedInputSchema,
    routeScopes: ["budgets"],
    normalize: (context, input) => normalizeBudgetAction(context, input, verb),
    execute: async (client, input) => {
      const parsed = budgetNormalizedInputSchema.parse(input)
      await upsertBudget(client, parsed)
      return { message: `${successMessage} ${parsed.categoryName}.` }
    },
  }
}

export const budgetCreateDefinition = createBudgetDefinition(
  "budget.create",
  "Create budget",
  "Create a new budget for a category or total spending.",
  "create",
  "Budget saved for"
)

export const budgetAdjustDefinition = createBudgetDefinition(
  "budget.adjust",
  "Adjust budget",
  "Change the amount of an existing budget.",
  "adjust",
  "Budget updated for"
)
