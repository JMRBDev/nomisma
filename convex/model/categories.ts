import { ConvexError } from "convex/values"
import { getOwnedCategory, requireUser } from "./queries"
import type { MutationCtx } from "../_generated/server"

export async function createCategory(
  ctx: MutationCtx,
  args: {
    kind: "income" | "expense"
    name: string
    color?: string
    icon?: string
  }
) {
  const user = await requireUser(ctx)

  const name = args.name.trim()
  if (!name) {
    throw new ConvexError("Category name is required.")
  }

  const timestamp = Date.now()

  return ctx.db.insert("categories", {
    userId: user._id,
    kind: args.kind,
    name,
    color: args.color?.trim() || undefined,
    icon: args.icon?.trim() || undefined,
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

export async function updateCategory(
  ctx: MutationCtx,
  args: {
    categoryId: Parameters<typeof getOwnedCategory>[2]
    name: string
    color?: string
    icon?: string
  }
) {
  const user = await requireUser(ctx)
  const category = await getOwnedCategory(ctx, user._id, args.categoryId)
  const name = args.name.trim()

  if (!name) {
    throw new ConvexError("Category name is required.")
  }

  await ctx.db.patch(category._id, {
    name,
    color: args.color?.trim() || undefined,
    icon: args.icon?.trim() || undefined,
    updatedAt: Date.now(),
  })
}

export async function toggleCategoryArchived(
  ctx: MutationCtx,
  args: {
    categoryId: Parameters<typeof getOwnedCategory>[2]
    archived: boolean
  }
) {
  const user = await requireUser(ctx)
  const category = await getOwnedCategory(ctx, user._id, args.categoryId)

  await ctx.db.patch(category._id, {
    archived: args.archived,
    updatedAt: Date.now(),
  })
}
