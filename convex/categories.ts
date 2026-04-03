import { v } from "convex/values"
import { mutation } from "./_generated/server"
import * as Categories from "./model/categories"
import { categoryKindValidator } from "./schema"

export const createCategory = mutation({
  args: {
    kind: categoryKindValidator,
    name: v.string(),
  },
  handler: (ctx, args) => Categories.createCategory(ctx, args),
})

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
  },
  handler: (ctx, args) => Categories.updateCategory(ctx, args),
})

export const moveCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: (ctx, args) => Categories.moveCategory(ctx, args),
})

export const toggleCategoryArchived = mutation({
  args: {
    categoryId: v.id("categories"),
    archived: v.boolean(),
  },
  handler: (ctx, args) => Categories.toggleCategoryArchived(ctx, args),
})
