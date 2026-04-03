import { ConvexError } from "convex/values"
import { getCategoriesByUserId, getOwnedCategory, requireUser } from "./shared"
import type { MutationCtx } from "../_generated/server"

export async function createCategory(
  ctx: MutationCtx,
  args: {
    kind: "income" | "expense"
    name: string
  }
) {
  const user = await requireUser(ctx)

  const name = args.name.trim()
  if (!name) {
    throw new ConvexError("Category name is required.")
  }

  const categories = await getCategoriesByUserId(ctx, user._id)
  const sameKind = categories.filter((category) => category.kind === args.kind)
  const maxSortOrder = sameKind.reduce(
    (currentMax, category) => Math.max(currentMax, category.sortOrder),
    0
  )
  const timestamp = Date.now()

  return ctx.db.insert("categories", {
    userId: user._id,
    kind: args.kind,
    name,
    archived: false,
    sortOrder: maxSortOrder + 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

export async function updateCategory(
  ctx: MutationCtx,
  args: {
    categoryId: Parameters<typeof getOwnedCategory>[2]
    name: string
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
    updatedAt: Date.now(),
  })
}

export async function moveCategory(
  ctx: MutationCtx,
  args: {
    categoryId: Parameters<typeof getOwnedCategory>[2]
    direction: "up" | "down"
  }
) {
  const user = await requireUser(ctx)
  const category = await getOwnedCategory(ctx, user._id, args.categoryId)
  const categories = [...(await getCategoriesByUserId(ctx, user._id))]
    .filter((item) => item.kind === category.kind)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const currentIndex = categories.findIndex((item) => item._id === category._id)
  if (currentIndex === -1) return

  const targetIndex =
    args.direction === "up" ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= categories.length) return

  const target = categories[targetIndex]
  await ctx.db.patch(category._id, {
    sortOrder: target.sortOrder,
    updatedAt: Date.now(),
  })
  await ctx.db.patch(target._id, {
    sortOrder: category.sortOrder,
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
