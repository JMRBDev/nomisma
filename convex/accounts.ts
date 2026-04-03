import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import * as Accounts from "./model/accounts"
import { accountTypeValidator } from "./schema"

export const getAccountsPageData = query({
  args: {},
  handler: (ctx) => Accounts.getAccountsPageData(ctx),
})

export const createAccount = mutation({
  args: {
    name: v.string(),
    type: accountTypeValidator,
    openingBalance: v.number(),
    includeInTotals: v.boolean(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: (ctx, args) => Accounts.createAccount(ctx, args),
})

export const toggleAccountArchived = mutation({
  args: {
    accountId: v.id("accounts"),
    archived: v.boolean(),
  },
  handler: (ctx, args) => Accounts.toggleAccountArchived(ctx, args),
})
