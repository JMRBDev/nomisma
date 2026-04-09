import { ConvexError } from "convex/values"
import type { AppLocale } from "../../shared/i18n"
import type { WeekStartsOnPreference } from "../../shared/settings"
import { groupCategories } from "./read_models_categories"
import {
  getAccountsByUserId,
  getCategoriesByUserId,
  getResolvedSettings,
  requireUser,
} from "./queries"
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

export async function getUserSettings(ctx: QueryCtx) {
  const user = await requireUser(ctx)
  const { settings, savedLocale } = await getResolvedSettings(ctx, user._id)

  return {
    settings,
    savedLocale,
  }
}

export async function upsertSettings(
  ctx: MutationCtx,
  args: {
    baseCurrency: string
    locale: AppLocale
    weekStartsOn: WeekStartsOnPreference
  }
) {
  const user = await requireUser(ctx)
  const baseCurrency = args.baseCurrency.trim()
  const locale = args.locale
  const weekStartsOn = args.weekStartsOn

  if (!baseCurrency) {
    throw new ConvexError("Currency is required.")
  }

  const { settingsDoc: existingSettings } = await getResolvedSettings(
    ctx,
    user._id
  )

  if (existingSettings) {
    await ctx.db.replace(existingSettings._id, {
      userId: existingSettings.userId,
      baseCurrency,
      locale,
      weekStartsOn,
      createdAt: existingSettings.createdAt,
      updatedAt: Date.now(),
    })
    return existingSettings._id
  }

  return ctx.db.insert("userSettings", {
    userId: user._id,
    baseCurrency,
    locale,
    weekStartsOn,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}
