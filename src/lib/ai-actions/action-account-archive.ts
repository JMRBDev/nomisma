import { api } from "../../../convex/_generated/api"
import {
  accountArchiveGeneratedInputSchema,
  accountArchiveNormalizedInputSchema,
} from "./actions-types"
import { resolveAccount } from "./actions-resolvers"
import type {
  AiActionDefinition,
  NormalizeResult,
  PlannerContext,
} from "./actions-types"
import type { z } from "zod"

function normalizeArchiveAccountAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof accountArchiveNormalizedInputSchema>> {
  const parsed = accountArchiveGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The account input was invalid." }
  }

  if (!parsed.data.accountName) {
    const activeAccounts = context.accounts.filter((a) => !a.archived)

    if (activeAccounts.length === 0) {
      return { type: "no_match", reason: "There are no active accounts." }
    }

    return {
      type: "clarify",
      question: "Which account do you want to archive?",
      missingFields: ["accountName"],
      options: activeAccounts.slice(0, 8).map((a) => ({
        id: a.id,
        label: a.name,
      })),
    }
  }

  const resolved = resolveAccount(context, parsed.data.accountName)

  if (Array.isArray(resolved)) {
    return {
      type: "clarify",
      question: "Which account did you mean?",
      missingFields: ["accountName"],
      options: resolved.slice(0, 8),
    }
  }

  if (!resolved) {
    return {
      type: "no_match",
      reason: `I couldn't find an account named "${parsed.data.accountName}".`,
    }
  }

  const account = context.accounts.find((a) => a.id === resolved.id)

  if (!account) {
    return { type: "no_match", reason: "I couldn't resolve that account." }
  }

  const archived = parsed.data.archived ?? true

  if (account.archived === archived) {
    return {
      type: "no_match",
      reason: account.archived
        ? `"${account.name}" is already archived.`
        : `"${account.name}" is already active.`,
    }
  }

  return {
    type: "ready",
    normalizedInput: {
      accountId: account.id,
      accountName: account.name,
      archived,
    },
    summary: archived
      ? `This will archive the "${account.name}" account. It will no longer appear in totals, but its data is preserved.`
      : `This will restore the "${account.name}" account and include it in totals again.`,
  }
}

export const accountArchiveDefinition: AiActionDefinition = {
  key: "account.archive",
  title: "Archive account",
  description:
    "Archive (close) or restore an account. Archived accounts are hidden from totals but their data is preserved.",
  domains: ["account"],
  contextFields: ["accounts"],
  generatedInputSchema: accountArchiveGeneratedInputSchema,
  normalizedInputSchema: accountArchiveNormalizedInputSchema,
  routeScopes: ["accounts", "overview"],
  normalize: normalizeArchiveAccountAction,
  execute: async (client, input) => {
    const parsed = accountArchiveNormalizedInputSchema.parse(input)
    await client.mutation(api.accounts.toggleAccountArchived, {
      accountId: parsed.accountId as any,
      archived: parsed.archived,
    })

    return {
      message: parsed.archived
        ? `Account "${parsed.accountName}" has been archived.`
        : `Account "${parsed.accountName}" has been restored.`,
    }
  },
}
