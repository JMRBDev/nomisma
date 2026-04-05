import { v } from "convex/values"
import { query } from "./_generated/server"
import * as Overview from "./model/overview"

export const getOverviewData = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: (ctx, args) => Overview.getOverviewData(ctx, args),
})
