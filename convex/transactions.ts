import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import * as Transactions from "./model/transactions"
import { transactionStatusValidator, transactionTypeValidator } from "./schema"

export const getTransactionsPageData = query({
  args: {},
  handler: (ctx) => Transactions.getTransactionsPageData(ctx),
})

export const createTransaction = mutation({
  args: {
    type: transactionTypeValidator,
    amount: v.number(),
    date: v.string(),
    status: transactionStatusValidator,
    accountId: v.id("accounts"),
    toAccountId: v.optional(v.id("accounts")),
    categoryId: v.optional(v.id("categories")),
    description: v.string(),
    note: v.optional(v.string()),
    recurringRuleId: v.optional(v.id("recurringRules")),
  },
  handler: (ctx, args) => Transactions.createTransaction(ctx, args),
})

export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    type: transactionTypeValidator,
    amount: v.number(),
    date: v.string(),
    status: transactionStatusValidator,
    accountId: v.id("accounts"),
    toAccountId: v.optional(v.id("accounts")),
    categoryId: v.optional(v.id("categories")),
    description: v.string(),
    note: v.optional(v.string()),
  },
  handler: (ctx, args) => Transactions.updateTransaction(ctx, args),
})

export const deleteTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: (ctx, args) => Transactions.deleteTransaction(ctx, args),
})
