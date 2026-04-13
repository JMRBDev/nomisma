/* eslint-disable max-lines */
import { api } from "../../../convex/_generated/api"
import {
  categoryCreateGeneratedInputSchema,
  categoryCreateNormalizedInputSchema,
  categoryUpdateGeneratedInputSchema,
  categoryUpdateNormalizedInputSchema,
} from "./actions-types"
import { resolveCategory } from "./actions-resolvers"
import type {
  AiActionDefinition,
  NormalizeResult,
  PlannerContext,
} from "./actions-types"
import type { z } from "zod"

function pickCategoryAppearance(name: string) {
  const normalized = name.trim().toLowerCase()

  if (
    normalized.includes("food") ||
    normalized.includes("restaurant") ||
    normalized.includes("dining")
  ) {
    return { color: "bg-amber-600", icon: "utensils-crossed" }
  }

  if (
    normalized.includes("shop") ||
    normalized.includes("grocery") ||
    normalized.includes("market")
  ) {
    return { color: "bg-emerald-600", icon: "shopping-cart" }
  }

  if (
    normalized.includes("home") ||
    normalized.includes("rent") ||
    normalized.includes("housing")
  ) {
    return { color: "bg-sky-600", icon: "house" }
  }

  if (
    normalized.includes("car") ||
    normalized.includes("transport") ||
    normalized.includes("travel")
  ) {
    return { color: "bg-violet-600", icon: "car-front" }
  }

  if (
    normalized.includes("salary") ||
    normalized.includes("income") ||
    normalized.includes("work")
  ) {
    return { color: "bg-lime-600", icon: "briefcase-business" }
  }

  return { color: "bg-emerald-600", icon: "shopping-cart" }
}

function normalizeCreateCategoryAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof categoryCreateNormalizedInputSchema>> {
  const parsed = categoryCreateGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The category input was invalid." }
  }

  if (!parsed.data.name) {
    return {
      type: "clarify",
      question: "What should I name the category?",
      missingFields: ["name"],
    }
  }

  const resolvedCategory = resolveCategory(context, parsed.data.name)

  if (Array.isArray(resolvedCategory)) {
    return {
      type: "clarify",
      question: "Which category did you mean?",
      missingFields: ["name"],
      options: resolvedCategory.slice(0, 8),
    }
  }

  if (resolvedCategory) {
    const category = context.categories.find(
      (candidate) => candidate.id === resolvedCategory.id
    )

    return {
      type: "no_match",
      reason: category?.archived
        ? "An archived category with that name already exists."
        : "An active category with that name already exists.",
    }
  }

  const normalizedInput = {
    name: parsed.data.name.trim(),
    ...pickCategoryAppearance(parsed.data.name),
  }

  return {
    type: "ready",
    normalizedInput,
    summary: `This will create the ${normalizedInput.name} category.`,
  }
}

function normalizeUpdateCategoryAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof categoryUpdateNormalizedInputSchema>> {
  const parsed = categoryUpdateGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The category input was invalid." }
  }

  if (!parsed.data.categoryName) {
    return {
      type: "clarify",
      question: "Which category should I update?",
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
      question: "Which category should I update?",
      missingFields: ["categoryName"],
      options: resolvedCategory.slice(0, 8),
    }
  }

  if (!resolvedCategory?.id) {
    return { type: "no_match", reason: "I couldn't find that category." }
  }

  const category = context.categories.find(
    (candidate) => candidate.id === resolvedCategory.id
  )

  if (!category) {
    return { type: "no_match", reason: "I couldn't find that category." }
  }

  const newName = parsed.data.newName?.trim() || category.name
  const defaults = pickCategoryAppearance(newName)
  const color = parsed.data.color?.trim() || category.color || defaults.color
  const icon = parsed.data.icon?.trim() || category.icon || defaults.icon

  if (
    newName === category.name &&
    color === category.color &&
    icon === category.icon
  ) {
    return {
      type: "no_match",
      reason: "There is nothing to update for that category.",
    }
  }

  const normalizedInput = {
    categoryId: category.id,
    categoryName: category.name,
    newName,
    color,
    icon,
  }

  return {
    type: "ready",
    normalizedInput,
    summary: `This will update ${category.name} to ${newName}.`,
  }
}

export const categoryCreateDefinition: AiActionDefinition = {
  key: "category.create",
  title: "Create category",
  description: "Create a new category.",
  domains: ["category"],
  contextFields: ["categories"],
  generatedInputSchema: categoryCreateGeneratedInputSchema,
  normalizedInputSchema: categoryCreateNormalizedInputSchema,
  routeScopes: ["transactions", "budgets", "recurring"],
  normalize: normalizeCreateCategoryAction,
  execute: async (client, input) => {
    const parsed = categoryCreateNormalizedInputSchema.parse(input)
    await client.mutation(api.categories.createCategory, parsed)

    return {
      message: `Category created: ${parsed.name}.`,
    }
  },
}

export const categoryUpdateDefinition: AiActionDefinition = {
  key: "category.update",
  title: "Update category",
  description: "Rename or restyle a category.",
  domains: ["category"],
  contextFields: ["categories"],
  generatedInputSchema: categoryUpdateGeneratedInputSchema,
  normalizedInputSchema: categoryUpdateNormalizedInputSchema,
  routeScopes: ["transactions", "budgets", "recurring"],
  normalize: normalizeUpdateCategoryAction,
  execute: async (client, input) => {
    const parsed = categoryUpdateNormalizedInputSchema.parse(input)
    await client.mutation(api.categories.updateCategory, {
      categoryId: parsed.categoryId as any,
      name: parsed.newName,
      color: parsed.color,
      icon: parsed.icon,
    })

    return {
      message: `Category updated: ${parsed.newName}.`,
    }
  },
}
