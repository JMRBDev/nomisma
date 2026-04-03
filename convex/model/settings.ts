import { ConvexError } from "convex/values"
import { groupCategories } from "./readModels"
import {
  getAccountsByUserId,
  getCategoriesByUserId,
  getResolvedSettings,
  requireUser,
} from "./shared"
import type { MutationCtx, QueryCtx } from "../_generated/server"

export async function getSettingsPageData(ctx: QueryCtx) {
  const user = await requireUser(ctx)
  const [{ settings }, accounts, categories] = await Promise.all([
    getResolvedSettings(ctx, user._id),
    getAccountsByUserId(ctx, user._id),
    getCategoriesByUserId(ctx, user._id),
  ])

  return {
    settings,
    categories: groupCategories(categories),
    accounts: {
      archived: [...accounts]
        .filter((account) => account.archived)
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
  }
}

export async function upsertSettings(
  ctx: MutationCtx,
  args: {
    baseCurrency: string
    monthStartsOn: number
  }
) {
  const user = await requireUser(ctx)

  if (!args.baseCurrency.trim()) {
    throw new ConvexError("Currency is required.")
  }

  if (args.monthStartsOn < 1 || args.monthStartsOn > 28) {
    throw new ConvexError("Month start must be between 1 and 28.")
  }

  const { settingsDoc: existingSettings } = await getResolvedSettings(
    ctx,
    user._id
  )

  if (existingSettings) {
    await ctx.db.patch(existingSettings._id, {
      baseCurrency: args.baseCurrency.trim(),
      monthStartsOn: args.monthStartsOn,
      updatedAt: Date.now(),
    })
    return existingSettings._id
  }

  return ctx.db.insert("userSettings", {
    userId: user._id,
    baseCurrency: args.baseCurrency.trim(),
    monthStartsOn: args.monthStartsOn,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}
