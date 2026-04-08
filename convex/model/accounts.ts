import { ConvexError } from "convex/values"
import {
  getAccountNameConflicts,
  normalizeEntityName,
} from "./account_name_conflicts"
import { requireEntityAppearance } from "./entity_appearance"
import { buildMappedTransactions } from "./read_models_transactions"
import {
  buildAccountSummaries,
  groupAccountSummaries,
} from "./read_models_accounts"
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
    color: string
    icon: string
  }
) {
  const user = await requireUser(ctx)
  const name = args.name.trim()
  const appearance = requireEntityAppearance(args, "Account")
  if (!name) {
    throw new ConvexError("Account name is required.")
  }
  if (args.openingBalance < 0) {
    throw new ConvexError(
      "Opening balance cannot be negative for this version of the app."
    )
  }

  const conflicts = await getAccountNameConflicts(ctx, user._id, name)
  if (conflicts.some((account) => !account.archived)) {
    throw new ConvexError("An active account with this name already exists.")
  }
  const timestamp = Date.now()
  return ctx.db.insert("accounts", {
    userId: user._id,
    name,
    type: args.type,
    openingBalance: args.openingBalance,
    includeInTotals: args.includeInTotals,
    archived: false,
    color: appearance.color,
    icon: appearance.icon,
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
  if (!args.archived) {
    const conflicts = await getAccountNameConflicts(
      ctx,
      user._id,
      account.name,
      account._id
    )

    if (conflicts.some((item) => !item.archived)) {
      throw new ConvexError(
        "An active account with this name already exists. Rename it before restoring this one."
      )
    }
  }

  await ctx.db.patch(account._id, {
    archived: args.archived,
    updatedAt: Date.now(),
  })
}

export async function updateAccount(
  ctx: MutationCtx,
  args: {
    accountId: Parameters<typeof getOwnedAccount>[2]
    name: string
    type: "checking" | "savings" | "cash" | "wallet"
    includeInTotals: boolean
    color: string
    icon: string
  }
) {
  const user = await requireUser(ctx)
  const account = await getOwnedAccount(ctx, user._id, args.accountId)
  const name = args.name.trim()
  const appearance = requireEntityAppearance(args, "Account")
  if (!name) {
    throw new ConvexError("Account name is required.")
  }

  if (normalizeEntityName(account.name) !== normalizeEntityName(name)) {
    const conflicts = await getAccountNameConflicts(
      ctx,
      user._id,
      name,
      account._id
    )

    if (conflicts.some((item) => !item.archived)) {
      throw new ConvexError("An active account with this name already exists.")
    }
  }

  await ctx.db.patch(account._id, {
    name,
    type: args.type,
    includeInTotals: args.includeInTotals,
    color: appearance.color,
    icon: appearance.icon,
    updatedAt: Date.now(),
  })
}
