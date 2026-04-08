import { v } from "convex/values"
import { query } from "./_generated/server"
import { getGlobalSearchResults as getGlobalSearchResultsModel } from "./model/search"

export const getGlobalSearchResults = query({
  args: {
    query: v.string(),
    currentMonth: v.optional(v.string()),
  },
  handler: (ctx, args) => getGlobalSearchResultsModel(ctx, args),
})
