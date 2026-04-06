import { ConvexError } from "convex/values"
import { buildMappedTransactions } from "./read-models-transactions"
import {
  buildAccountSummaries,
  groupAccountSummaries,
} from "./read-models-accounts"
import {
  getAccountsByUserId,
  getCategoriesByUserId,
  getOwnedAccount,
  getResolvedSettings,
  getTransactionsByUserId,
  requireUser,
} from "./queries"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export async function getAccountsPageData(ctx: QueryCtx) {
  const user = await requireUser(ctx)
  const [{ settings }, accounts, categories, transactions] = await Promise.all([
    getResolvedSettings(ctx, user._id),
    getAccountsByUserId(ctx, user._id),
    getCategoriesByUserId(ctx, user._id),
    getTransactionsByUserId(ctx, user._id),
  ])

  const dashboardTransactions = buildMappedTransactions(
    accounts,
    categories,
    transactions
  )
  const accountSummaries = buildAccountSummaries(
    accounts,
    transactions,
    dashboardTransactions
  )

  return {
    settings,
    accounts: groupAccountSummaries(accountSummaries),
  }
}

export async function createAccount(
  ctx: MutationCtx,
  args: {
    name: string
    type: "checking" | "savings" | "cash" | "wallet"
    openingBalance: number
    includeInTotals: boolean
    color?: string
    icon?: string
  }
) {
  const user = await requireUser(ctx)

  if (!args.name.trim()) {
    throw new ConvexError("Account name is required.")
  }

  if (args.openingBalance < 0) {
    throw new ConvexError(
      "Opening balance cannot be negative for this version of the app."
    )
  }

  const timestamp = Date.now()

  return ctx.db.insert("accounts", {
    userId: user._id,
    name: args.name.trim(),
    type: args.type,
    openingBalance: args.openingBalance,
    includeInTotals: args.includeInTotals,
    archived: false,
    color: args.color?.trim() || undefined,
    icon: args.icon?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

export async function toggleAccountArchived(
  ctx: MutationCtx,
  args: {
    accountId: Parameters<typeof getOwnedAccount>[2]
    archived: boolean
  }
) {
  const user = await requireUser(ctx)
  const account = await getOwnedAccount(ctx, user._id, args.accountId)

  await ctx.db.patch(account._id, {
    archived: args.archived,
    updatedAt: Date.now(),
  })
}
