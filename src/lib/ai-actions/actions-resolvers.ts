/* eslint-disable max-lines */
import { normalizeText, resolveAmount, resolveDate } from "./actions-helpers"
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

type ResolvedAccount =
  | {
      id: string
      name: string
    }
  | Array<ClarifyOption>
  | null

type ResolvedRecurringRule =
  | {
      id: string
      description: string
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

function resolveNamedEntity<T extends { id: string; name: string }>(
  entities: Array<T>,
  name?: string
) {
  if (!name) {
    return null
  }

  const normalized = normalizeText(name)
  const exactMatches = entities.filter(
    (entity) => normalizeText(entity.name) === normalized
  )

  if (exactMatches.length === 1) {
    const [match] = exactMatches
    return { id: match.id, name: match.name }
  }

  const partialMatches = entities.filter((entity) =>
    normalizeText(entity.name).includes(normalized)
  )

  if (partialMatches.length === 1) {
    const [match] = partialMatches
    return { id: match.id, name: match.name }
  }

  if (partialMatches.length > 1) {
    return partialMatches.map((entity) => ({
      id: entity.id,
      label: entity.name,
    }))
  }

  return null
}

export function resolveAccount(
  context: PlannerContext,
  accountName?: string,
  options?: {
    includeArchived?: boolean
    fallbackToSingleActive?: boolean
  }
): ResolvedAccount {
  const accounts = context.accounts.filter(
    (account) => options?.includeArchived || !account.archived
  )

  if (!accountName) {
    const activeAccounts = accounts.filter((account) => !account.archived)

    if (options?.fallbackToSingleActive && activeAccounts.length === 1) {
      const [match] = activeAccounts
      return { id: match.id, name: match.name }
    }

    return null
  }

  return resolveNamedEntity(accounts, accountName)
}

export function resolveRecurringRule(
  context: PlannerContext,
  input: {
    ruleId?: string
    recurringDescription?: string
    activeOnly?: boolean
  }
): ResolvedRecurringRule {
  const recurringRules = context.recurringRules.filter(
    (rule) => !input.activeOnly || rule.active
  )

  if (input.ruleId) {
    const exact = recurringRules.find((rule) => rule.id === input.ruleId)

    if (exact) {
      return {
        id: exact.id,
        description: exact.description,
      }
    }
  }

  if (!input.recurringDescription) {
    return null
  }

  const namedRules = recurringRules.map((rule) => ({
    id: rule.id,
    name: rule.description,
  }))
  const resolved = resolveNamedEntity(namedRules, input.recurringDescription)

  if (!resolved) {
    return null
  }

  if (Array.isArray(resolved)) {
    return resolved
  }

  return {
    id: resolved.id,
    description: resolved.name,
  }
}

function buildTransactionOptionLabel(transaction: PlannerTransaction) {
  return `${transaction.description} (${transaction.date}, ${transaction.amount})`
}

function getAvailableTransactions(context: PlannerContext) {
  const uniqueTransactions = new Map<string, PlannerTransaction>()

  for (const transaction of [
    ...context.selectedTransactions,
    ...context.recentTransactions,
  ]) {
    uniqueTransactions.set(transaction.id, transaction)
  }

  return [...uniqueTransactions.values()]
}

export function resolveTransactions(
  context: PlannerContext,
  input: {
    transactionId?: string
    transactionIds?: Array<string>
    transactionDescription?: string
    transactionDate?: string
    transactionAmount?: number | string
  }
): NormalizeResult<Array<PlannerTransaction>> {
  const available = getAvailableTransactions(context)
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
  const requestedDate = resolveDate(input.transactionDate)
  const requestedAmount = resolveAmount(input.transactionAmount)
  const hasSearchInput =
    Boolean(input.transactionDescription?.trim()) ||
    Boolean(requestedDate) ||
    requestedAmount !== null

  if (context.selectedTransactions.length > 0 && !hasSearchInput) {
    return {
      type: "ready",
      normalizedInput: context.selectedTransactions,
      summary: "",
    }
  }
  if (!hasSearchInput) {
    return {
      type: "clarify",
      question:
        "Select a transaction first or mention which transaction you mean.",
      missingFields: ["transaction"],
    }
  }
  const query = input.transactionDescription
    ? normalizeText(input.transactionDescription)
    : null
  const matches = available.filter((transaction) => {
    if (query && !normalizeText(transaction.description).includes(query)) {
      return false
    }

    if (requestedDate && transaction.date !== requestedDate) {
      return false
    }

    if (
      requestedAmount !== null &&
      Math.abs(transaction.amount - requestedAmount) > 0.0001
    ) {
      return false
    }

    return true
  })
  if (matches.length === 1)
    return { type: "ready", normalizedInput: matches, summary: "" }
  if (matches.length > 1) {
    return {
      type: "clarify",
      question: "Which transaction do you want to use?",
      missingFields: ["transaction"],
      options: matches.slice(0, 6).map((transaction) => ({
        id: transaction.id,
        label: buildTransactionOptionLabel(transaction),
      })),
    }
  }
  return { type: "no_match", reason: "I couldn't find a matching transaction." }
}
