/* eslint-disable max-lines */
import { api } from "../../../convex/_generated/api"
import {
  transactionAutocategorizeGeneratedInputSchema,
  transactionAutocategorizeNormalizedInputSchema,
  transactionCreateGeneratedInputSchema,
  transactionCreateNormalizedInputSchema,
  transactionDeleteGeneratedInputSchema,
  transactionDeleteNormalizedInputSchema,
  transactionUpdateGeneratedInputSchema,
  transactionUpdateNormalizedInputSchema,
} from "./actions-types"
import { formatCurrency, resolveAmount, resolveDate } from "./actions-helpers"
import {
  resolveAccount,
  resolveCategory,
  resolveTransactions,
} from "./actions-resolvers"
import type {
  AiActionDefinition,
  NormalizeResult,
  PlannerContext,
  PlannerTransaction,
} from "./actions-types"
import type { z } from "zod"

function inferTransactionType(input: {
  type?: "expense" | "income" | "transfer"
  toAccountName?: string
}) {
  if (input.type) {
    return input.type
  }

  return input.toAccountName ? "transfer" : null
}

function summarizeTransaction(
  transaction: Pick<PlannerTransaction, "description" | "date" | "amount">
) {
  return `"${transaction.description}" on ${transaction.date}`
}

function resolveCreateTransactionAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof transactionCreateNormalizedInputSchema>> {
  const parsed = transactionCreateGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The transaction input was invalid." }
  }

  const type = inferTransactionType(parsed.data)

  if (!type) {
    return {
      type: "clarify",
      question: "Is this an expense, income, or transfer?",
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

  const date = resolveDate(parsed.data.date, context.today)

  if (!date) {
    return {
      type: "clarify",
      question: "Which date should I use? Please answer with YYYY-MM-DD.",
      missingFields: ["date"],
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
      options: context.accounts
        .filter((account) => !account.archived)
        .slice(0, 8)
        .map((account) => ({
          id: account.id,
          label: account.name,
        })),
    }
  }

  let toAccountId: string | undefined
  let toAccountName: string | undefined

  if (type === "transfer") {
    const resolvedToAccount = resolveAccount(context, parsed.data.toAccountName)

    if (Array.isArray(resolvedToAccount)) {
      return {
        type: "clarify",
        question: "Which destination account should I use?",
        missingFields: ["toAccountName"],
        options: resolvedToAccount.slice(0, 8),
      }
    }

    if (!resolvedToAccount) {
      return {
        type: "clarify",
        question: "Which destination account should I use?",
        missingFields: ["toAccountName"],
      }
    }

    if (resolvedToAccount.id === resolvedAccount.id) {
      return {
        type: "clarify",
        question: "Pick a different destination account for the transfer.",
        missingFields: ["toAccountName"],
      }
    }

    toAccountId = resolvedToAccount.id
    toAccountName = resolvedToAccount.name
  }

  let categoryId: string | undefined
  let categoryName: string | undefined

  if (type !== "transfer") {
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
        options: context.categories
          .filter((category) => !category.archived)
          .slice(0, 8)
          .map((category) => ({
            id: category.id,
            label: category.name,
          })),
      }
    }

    categoryId = resolvedCategory.id
    categoryName = resolvedCategory.name
  }

  const normalizedInput = {
    type,
    amount,
    date,
    status: parsed.data.status ?? "posted",
    accountId: resolvedAccount.id,
    accountName: resolvedAccount.name,
    toAccountId,
    toAccountName,
    categoryId,
    categoryName,
    description: parsed.data.description?.trim() ?? "",
    note: parsed.data.note?.trim() || undefined,
  }

  return {
    type: "ready",
    normalizedInput,
    summary: `This will create a ${type} for ${formatCurrency(amount, context.settings?.baseCurrency, context.locale)} on ${date}${type === "transfer" ? ` from ${resolvedAccount.name} to ${toAccountName}` : ` in ${categoryName} from ${resolvedAccount.name}`}.`,
  }
}

function resolveUpdateTransactionAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof transactionUpdateNormalizedInputSchema>> {
  const parsed = transactionUpdateGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The transaction input was invalid." }
  }

  const transactionResolution = resolveTransactions(context, parsed.data)

  if (transactionResolution.type !== "ready") {
    return transactionResolution
  }

  const transaction = transactionResolution.normalizedInput[0]
  const type = parsed.data.type ?? transaction.type
  const amount =
    parsed.data.amount === undefined
      ? transaction.amount
      : resolveAmount(parsed.data.amount)

  if (!amount) {
    return {
      type: "clarify",
      question: "What amount should I use?",
      missingFields: ["amount"],
    }
  }

  const date = resolveDate(parsed.data.date, transaction.date)

  if (!date) {
    return {
      type: "clarify",
      question: "Which date should I use? Please answer with YYYY-MM-DD.",
      missingFields: ["date"],
    }
  }

  const resolvedAccount = parsed.data.accountName
    ? resolveAccount(context, parsed.data.accountName)
    : transaction.accountId
      ? {
          id: transaction.accountId,
          name: transaction.accountName ?? "Account",
        }
      : null

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

  let toAccountId: string | undefined
  let toAccountName: string | undefined

  if (type === "transfer") {
    const resolvedToAccount = parsed.data.toAccountName
      ? resolveAccount(context, parsed.data.toAccountName)
      : transaction.toAccountId
        ? {
            id: transaction.toAccountId,
            name: transaction.toAccountName ?? "Account",
          }
        : null

    if (Array.isArray(resolvedToAccount)) {
      return {
        type: "clarify",
        question: "Which destination account should I use?",
        missingFields: ["toAccountName"],
        options: resolvedToAccount.slice(0, 8),
      }
    }

    if (!resolvedToAccount) {
      return {
        type: "clarify",
        question: "Which destination account should I use?",
        missingFields: ["toAccountName"],
      }
    }

    if (resolvedToAccount.id === resolvedAccount.id) {
      return {
        type: "clarify",
        question: "Pick a different destination account for the transfer.",
        missingFields: ["toAccountName"],
      }
    }

    toAccountId = resolvedToAccount.id
    toAccountName = resolvedToAccount.name
  }

  let categoryId: string | undefined
  let categoryName: string | undefined

  if (type !== "transfer") {
    const resolvedCategory = parsed.data.categoryName
      ? resolveCategory(context, parsed.data.categoryName)
      : transaction.categoryId
        ? {
            id: transaction.categoryId,
            name: transaction.categoryName ?? "Category",
          }
        : null

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

    categoryId = resolvedCategory.id
    categoryName = resolvedCategory.name
  }

  const description = parsed.data.description?.trim() ?? transaction.description
  const note = parsed.data.note?.trim() || transaction.note || undefined
  const normalizedInput = {
    transactionId: transaction.id,
    transactionDescription: transaction.description,
    type,
    amount,
    date,
    status: parsed.data.status ?? transaction.status,
    accountId: resolvedAccount.id,
    accountName: resolvedAccount.name,
    toAccountId,
    toAccountName,
    categoryId,
    categoryName,
    description,
    note,
  }

  if (
    normalizedInput.type === transaction.type &&
    normalizedInput.amount === transaction.amount &&
    normalizedInput.date === transaction.date &&
    normalizedInput.status === transaction.status &&
    normalizedInput.accountId === transaction.accountId &&
    (normalizedInput.toAccountId ?? null) === transaction.toAccountId &&
    (normalizedInput.categoryId ?? null) === transaction.categoryId &&
    normalizedInput.description === transaction.description &&
    (normalizedInput.note ?? null) === transaction.note
  ) {
    return {
      type: "no_match",
      reason: "There is nothing to update for that transaction.",
    }
  }

  return {
    type: "ready",
    normalizedInput,
    summary: `This will update ${summarizeTransaction(transaction)}.`,
  }
}

function resolveDeleteTransactionAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof transactionDeleteNormalizedInputSchema>> {
  const parsed = transactionDeleteGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The transaction input was invalid." }
  }

  const transactionResolution = resolveTransactions(context, parsed.data)

  if (transactionResolution.type !== "ready") {
    return transactionResolution
  }

  const transaction = transactionResolution.normalizedInput[0]

  return {
    type: "ready",
    normalizedInput: {
      transactionId: transaction.id,
      transactionDescription: transaction.description,
    },
    summary: `This will delete ${summarizeTransaction(transaction)}.`,
  }
}

function normalizeTransactionPattern(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\d+/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function scoreCategoryMatch(
  transaction: PlannerTransaction,
  history: Array<PlannerTransaction>
) {
  const pattern = normalizeTransactionPattern(transaction.description)

  if (!pattern) {
    return null
  }

  const scores = new Map<string, { score: number; name: string }>()

  for (const item of history) {
    if (!item.categoryId || !item.categoryName) {
      continue
    }

    const itemPattern = normalizeTransactionPattern(item.description)
    let score = 0

    if (itemPattern === pattern) {
      score = 5
    } else if (itemPattern.includes(pattern) || pattern.includes(itemPattern)) {
      score = 3
    }

    if (score === 0) {
      continue
    }

    const current = scores.get(item.categoryId)
    scores.set(item.categoryId, {
      score: (current?.score ?? 0) + score,
      name: item.categoryName,
    })
  }

  const ranked = [...scores.entries()].sort((left, right) => {
    if (left[1].score === right[1].score) {
      return left[1].name.localeCompare(right[1].name)
    }

    return right[1].score - left[1].score
  })

  const best = ranked.at(0)
  const second = ranked.at(1)

  if (!best) {
    return null
  }

  if (best[1].score < 3) {
    return null
  }

  if (second && best[1].score <= second[1].score) {
    return null
  }

  return {
    categoryId: best[0],
    categoryName: best[1].name,
  }
}

function getAutocategorizeCandidates(
  context: PlannerContext,
  input: z.infer<typeof transactionAutocategorizeGeneratedInputSchema>
) {
  const resolution = resolveTransactions(context, input)

  if (resolution.type === "ready") {
    return resolution.normalizedInput
      .filter(
        (transaction) =>
          transaction.type !== "transfer" && transaction.categoryId === null
      )
      .slice(0, 25)
  }

  if (context.selectedTransactions.length > 0) {
    return context.selectedTransactions.filter(
      (transaction) =>
        transaction.type !== "transfer" && transaction.categoryId === null
    )
  }

  return context.recentTransactions
    .filter(
      (transaction) =>
        transaction.type !== "transfer" && transaction.categoryId === null
    )
    .slice(0, 25)
}

function resolveAutocategorizeAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<
  z.infer<typeof transactionAutocategorizeNormalizedInputSchema>
> {
  const parsed =
    transactionAutocategorizeGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The categorize input was invalid." }
  }

  const candidates = getAutocategorizeCandidates(context, parsed.data)

  if (candidates.length === 0) {
    return {
      type: "no_match",
      reason: "I couldn't find uncategorized income or expense transactions.",
    }
  }

  const history = context.recentTransactions.filter(
    (transaction) =>
      transaction.categoryId !== null &&
      transaction.type !== "transfer" &&
      !candidates.some((candidate) => candidate.id === transaction.id)
  )
  const assignments = candidates
    .map((transaction) => {
      const match = scoreCategoryMatch(transaction, history)

      if (!match) {
        return null
      }

      return {
        transactionId: transaction.id,
        transactionDescription: transaction.description,
        categoryId: match.categoryId,
        categoryName: match.categoryName,
      }
    })
    .filter(
      (
        assignment
      ): assignment is z.infer<
        typeof transactionAutocategorizeNormalizedInputSchema
      >["assignments"][number] => Boolean(assignment)
    )

  if (assignments.length === 0) {
    return {
      type: "no_match",
      reason:
        "I couldn't find confident category matches from your recent history.",
    }
  }

  return {
    type: "ready",
    normalizedInput: { assignments },
    summary: `This will auto-categorize ${assignments.length} uncategorized transaction${assignments.length === 1 ? "" : "s"} using your recent patterns.`,
  }
}

export const transactionCreateDefinition: AiActionDefinition = {
  key: "transaction.create",
  title: "Create transaction",
  description: "Create a new transaction.",
  domains: ["transaction"],
  contextFields: ["accounts", "categories"],
  generatedInputSchema: transactionCreateGeneratedInputSchema,
  normalizedInputSchema: transactionCreateNormalizedInputSchema,
  routeScopes: ["overview", "transactions", "accounts"],
  normalize: resolveCreateTransactionAction,
  execute: async (client, input) => {
    const parsed = transactionCreateNormalizedInputSchema.parse(input)
    await client.mutation(api.transactions.createTransaction, {
      type: parsed.type,
      amount: parsed.amount,
      date: parsed.date,
      status: parsed.status,
      accountId: parsed.accountId as any,
      toAccountId: parsed.toAccountId as any,
      categoryId: parsed.categoryId as any,
      description: parsed.description,
      note: parsed.note,
    })

    return {
      message: "Transaction created.",
    }
  },
}

export const transactionUpdateDefinition: AiActionDefinition = {
  key: "transaction.update",
  title: "Update transaction",
  description: "Update an existing transaction.",
  domains: ["transaction"],
  contextFields: ["accounts", "categories", "transactions"],
  generatedInputSchema: transactionUpdateGeneratedInputSchema,
  normalizedInputSchema: transactionUpdateNormalizedInputSchema,
  routeScopes: ["transactions", "overview", "accounts"],
  requiresTransactions: true,
  normalize: resolveUpdateTransactionAction,
  execute: async (client, input) => {
    const parsed = transactionUpdateNormalizedInputSchema.parse(input)
    await client.mutation(api.transactions.updateTransaction, {
      transactionId: parsed.transactionId as any,
      type: parsed.type,
      amount: parsed.amount,
      date: parsed.date,
      status: parsed.status,
      accountId: parsed.accountId as any,
      toAccountId: parsed.toAccountId as any,
      categoryId: parsed.categoryId as any,
      description: parsed.description,
      note: parsed.note,
    })

    return {
      message: `Transaction updated: ${parsed.transactionDescription}.`,
    }
  },
}

export const transactionDeleteDefinition: AiActionDefinition = {
  key: "transaction.delete",
  title: "Delete transaction",
  description: "Delete a transaction.",
  domains: ["transaction"],
  contextFields: ["transactions"],
  generatedInputSchema: transactionDeleteGeneratedInputSchema,
  normalizedInputSchema: transactionDeleteNormalizedInputSchema,
  routeScopes: ["transactions", "overview", "accounts"],
  requiresTransactions: true,
  normalize: resolveDeleteTransactionAction,
  execute: async (client, input) => {
    const parsed = transactionDeleteNormalizedInputSchema.parse(input)
    await client.mutation(api.transactions.deleteTransaction, {
      transactionId: parsed.transactionId as any,
    })

    return {
      message: `Transaction deleted: ${parsed.transactionDescription}.`,
    }
  },
}

export const transactionAutocategorizeDefinition: AiActionDefinition = {
  key: "transaction.autocategorize_uncategorized",
  title: "Auto-categorize uncategorized transactions",
  description:
    "Categorize uncategorized income or expense transactions using recent history.",
  domains: ["transaction"],
  contextFields: ["categories", "transactions"],
  generatedInputSchema: transactionAutocategorizeGeneratedInputSchema,
  normalizedInputSchema: transactionAutocategorizeNormalizedInputSchema,
  routeScopes: ["overview", "transactions"],
  requiresTransactions: true,
  normalize: resolveAutocategorizeAction,
  execute: async (client, input) => {
    const parsed = transactionAutocategorizeNormalizedInputSchema.parse(input)
    const result = await client.mutation(
      api.aiActions.autoCategorizeTransactions,
      {
        assignments: parsed.assignments.map((assignment) => ({
          transactionId: assignment.transactionId as any,
          categoryId: assignment.categoryId as any,
        })),
      }
    )

    return {
      message: `Auto-categorized ${result.count} transaction${result.count === 1 ? "" : "s"}.`,
    }
  },
}
