import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const accountTypeValidator = v.union(
  v.literal("checking"),
  v.literal("savings"),
  v.literal("cash"),
  v.literal("wallet")
)

export const categoryKindValidator = v.union(
  v.literal("income"),
  v.literal("expense")
)

export const transactionTypeValidator = v.union(
  v.literal("income"),
  v.literal("expense"),
  v.literal("transfer")
)

export const transactionStatusValidator = v.union(
  v.literal("posted"),
  v.literal("planned")
)

export const recurringFrequencyValidator = v.union(
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("yearly")
)

export default defineSchema({
  userSettings: defineTable({
    userId: v.string(),
    baseCurrency: v.string(),
    monthStartsOn: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  accounts: defineTable({
    userId: v.string(),
    name: v.string(),
    type: accountTypeValidator,
    openingBalance: v.number(),
    includeInTotals: v.boolean(),
    archived: v.boolean(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_archived", ["userId", "archived"]),

  categories: defineTable({
    userId: v.string(),
    kind: categoryKindValidator,
    name: v.string(),
    archived: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_kind", ["userId", "kind"])
    .index("by_userId_kind_sortOrder", ["userId", "kind", "sortOrder"]),

  transactions: defineTable({
    userId: v.string(),
    type: transactionTypeValidator,
    amount: v.number(),
    date: v.string(),
    month: v.string(),
    status: transactionStatusValidator,
    accountId: v.id("accounts"),
    toAccountId: v.optional(v.id("accounts")),
    categoryId: v.optional(v.id("categories")),
    description: v.string(),
    note: v.optional(v.string()),
    recurringRuleId: v.optional(v.id("recurringRules")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"])
    .index("by_userId_month", ["userId", "month"])
    .index("by_accountId_date", ["accountId", "date"])
    .index("by_recurringRuleId", ["recurringRuleId"]),

  budgets: defineTable({
    userId: v.string(),
    month: v.string(),
    categoryKey: v.string(),
    categoryId: v.optional(v.id("categories")),
    limitAmount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_month", ["userId", "month"])
    .index("by_userId_month_categoryKey", ["userId", "month", "categoryKey"]),

  recurringRules: defineTable({
    userId: v.string(),
    type: categoryKindValidator,
    amount: v.number(),
    accountId: v.id("accounts"),
    categoryId: v.id("categories"),
    description: v.string(),
    frequency: recurringFrequencyValidator,
    startDate: v.string(),
    nextDueDate: v.string(),
    endDate: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_active", ["userId", "active"])
    .index("by_userId_nextDueDate", ["userId", "nextDueDate"]),
})
