import { query } from "./_generated/server"
import * as Overview from "./model/overview"

export const getOverviewData = query({
  args: {},
  handler: (ctx) => Overview.getOverviewData(ctx),
})
