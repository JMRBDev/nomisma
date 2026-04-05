import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import * as Settings from "./model/settings"

export const getSettingsPageData = query({
  args: {},
  handler: (ctx) => Settings.getSettingsPageData(ctx),
})

export const upsertSettings = mutation({
  args: {
    baseCurrency: v.string(),
  },
  handler: (ctx, args) => Settings.upsertSettings(ctx, args),
})
