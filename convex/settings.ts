import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { appLocaleValidator, weekStartsOnPreferenceValidator } from "./schema"
import * as Settings from "./model/settings"

export const getSettingsPageData = query({
  args: {},
  handler: (ctx) => Settings.getSettingsPageData(ctx),
})

export const getUserSettings = query({
  args: {},
  handler: (ctx) => Settings.getUserSettings(ctx),
})

export const upsertSettings = mutation({
  args: {
    baseCurrency: v.string(),
    locale: appLocaleValidator,
    weekStartsOn: weekStartsOnPreferenceValidator,
  },
  handler: (ctx, args) => Settings.upsertSettings(ctx, args),
})
