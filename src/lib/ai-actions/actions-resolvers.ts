import { normalizeText } from "./actions-helpers"
import type {
  ClarifyOption,
  NormalizeResult,
  PlannerContext,
  PlannerTransaction,
} from "./actions-types"

type ResolvedCategory =
  | {
      id: string | undefined
      name: string
    }
  | Array<ClarifyOption>
  | null

export function resolveCategory(
  context: PlannerContext,
  categoryName?: string
): ResolvedCategory {
  if (!categoryName) return null
  const normalized = normalizeText(categoryName)
  if (["total", "overall", "all"].includes(normalized))
    return { id: undefined, name: "Total" }
  const exactMatches = context.categories.filter(
    (category) =>
      !category.archived && normalizeText(category.name) === normalized
  )
  if (exactMatches.length === 1) {
    const [match] = exactMatches
    return { id: match.id, name: match.name }
  }
  const partialMatches = context.categories.filter(
    (category) =>
      !category.archived && normalizeText(category.name).includes(normalized)
  )
  if (partialMatches.length === 1) {
    const [match] = partialMatches
    return { id: match.id, name: match.name }
  }

  if (partialMatches.length > 1) {
    return partialMatches.map((category) => ({
      id: category.id,
      label: category.name,
    }))
  }

  return null
}

export function resolveTransactions(
  context: PlannerContext,
  input: {
    transactionId?: string
    transactionIds?: Array<string>
    transactionDescription?: string
  }
): NormalizeResult<Array<PlannerTransaction>> {
  const available = [
    ...context.selectedTransactions,
    ...context.recentTransactions,
  ]
  const availableMap = new Map(
    available.map((transaction) => [transaction.id, transaction])
  )
  const requestedIds =
    input.transactionIds?.filter(Boolean) ??
    (input.transactionId ? [input.transactionId] : [])
  if (requestedIds.length > 0) {
    const resolved = requestedIds
      .map((id) => availableMap.get(id))
      .filter((t): t is PlannerTransaction => Boolean(t))
    if (resolved.length === requestedIds.length)
      return { type: "ready", normalizedInput: resolved, summary: "" }
  }
  if (context.selectedTransactions.length > 0) {
    return {
      type: "ready",
      normalizedInput: context.selectedTransactions,
      summary: "",
    }
  }
  if (!input.transactionDescription) {
    return {
      type: "clarify",
      question:
        "Select a transaction first or mention which transaction you mean.",
      missingFields: ["transaction"],
    }
  }
  const query = normalizeText(input.transactionDescription)
  const matches = context.recentTransactions.filter((transaction) =>
    normalizeText(transaction.description).includes(query)
  )
  if (matches.length === 1)
    return { type: "ready", normalizedInput: matches, summary: "" }
  if (matches.length > 1) {
    return {
      type: "clarify",
      question: "Which transaction do you want to use?",
      missingFields: ["transaction"],
      options: matches.slice(0, 6).map((transaction) => ({
        id: transaction.id,
        label: `${transaction.description} (${transaction.date})`,
      })),
    }
  }
  return { type: "no_match", reason: "I couldn't find a matching transaction." }
}
