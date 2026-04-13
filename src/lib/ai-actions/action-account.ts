import { api } from "../../../convex/_generated/api"
import {
  accountCreateGeneratedInputSchema,
  accountCreateNormalizedInputSchema,
} from "./actions-types"
import {
  formatCurrency,
  resolveNonNegativeAmount,
} from "./actions-helpers"
import { resolveAccount } from "./actions-resolvers"
import type {
  AiActionDefinition,
  NormalizeResult,
  PlannerContext,
  accountTypeValues,
} from "./actions-types"
import type { z } from "zod"

const accountAppearanceByType: Record<
  (typeof accountTypeValues)[number],
  { color: string; icon: string }
> = {
  checking: { color: "bg-sky-600", icon: "landmark" },
  savings: { color: "bg-emerald-600", icon: "piggy-bank" },
  cash: { color: "bg-amber-600", icon: "hand-coins" },
  wallet: { color: "bg-violet-600", icon: "wallet" },
}

function normalizeCreateAccountAction(
  context: PlannerContext,
  rawInput: Record<string, unknown>
): NormalizeResult<z.infer<typeof accountCreateNormalizedInputSchema>> {
  const parsed = accountCreateGeneratedInputSchema.safeParse(rawInput)

  if (!parsed.success) {
    return { type: "no_match", reason: "The account input was invalid." }
  }

  if (!parsed.data.name) {
    return {
      type: "clarify",
      question: "What should I name the account?",
      missingFields: ["name"],
    }
  }

  const existingAccount = resolveAccount(context, parsed.data.name, {
    includeArchived: true,
  })

  if (Array.isArray(existingAccount)) {
    return {
      type: "clarify",
      question: "Which account name did you mean?",
      missingFields: ["name"],
      options: existingAccount.slice(0, 8),
    }
  }

  if (existingAccount) {
    const account = context.accounts.find(
      (candidate) => candidate.id === existingAccount.id
    )

    if (!account) {
      return { type: "no_match", reason: "I couldn't resolve that account." }
    }

    return {
      type: "no_match",
      reason: account.archived
        ? "An archived account with that name already exists."
        : "An active account with that name already exists.",
    }
  }

  const type = parsed.data.type ?? "checking"
  const openingBalance =
    parsed.data.openingBalance === undefined
      ? 0
      : resolveNonNegativeAmount(parsed.data.openingBalance)

  if (openingBalance === null) {
    return {
      type: "clarify",
      question: "What opening balance should I use?",
      missingFields: ["openingBalance"],
    }
  }

  const normalizedInput = {
    name: parsed.data.name.trim(),
    type,
    openingBalance,
    includeInTotals: parsed.data.includeInTotals ?? true,
    ...accountAppearanceByType[type],
  }

  return {
    type: "ready",
    normalizedInput,
    summary: `This will create the ${normalizedInput.name} account as ${normalizedInput.type} with an opening balance of ${formatCurrency(openingBalance, context.settings?.baseCurrency, context.locale)}.`,
  }
}

export const accountCreateDefinition: AiActionDefinition = {
  key: "account.create",
  title: "Create account",
  description: "Create a new account.",
  domains: ["account"],
  contextFields: ["accounts"],
  generatedInputSchema: accountCreateGeneratedInputSchema,
  normalizedInputSchema: accountCreateNormalizedInputSchema,
  routeScopes: ["accounts", "overview"],
  normalize: normalizeCreateAccountAction,
  execute: async (client, input) => {
    const parsed = accountCreateNormalizedInputSchema.parse(input)
    await client.mutation(api.accounts.createAccount, parsed)

    return {
      message: `Account created: ${parsed.name}.`,
    }
  },
}
