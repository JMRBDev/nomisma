import { ConvexError } from "convex/values"
import { requireEntityAppearance } from "./entity_appearance"
import { getCategoriesByUserId, getOwnedCategory, requireUser } from "./queries"
import type { MutationCtx } from "../_generated/server"

function normalizeEntityName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase()
}

async function getCategoryNameConflicts(
  ctx: MutationCtx,
  userId: string,
  args: {
    name: string
    excludedCategoryId?: Parameters<typeof getOwnedCategory>[2]
  }
) {
  const normalizedName = normalizeEntityName(args.name)
  const categories = await getCategoriesByUserId(ctx, userId)

  return categories.filter((category) => {
    if (args.excludedCategoryId && category._id === args.excludedCategoryId) {
      return false
    }

    return normalizeEntityName(category.name) === normalizedName
  })
}

export async function createCategory(
  ctx: MutationCtx,
  args: {
    name: string
    color: string
    icon: string
  }
) {
  const user = await requireUser(ctx)

  const name = args.name.trim()
  const appearance = requireEntityAppearance(args, "Category")
  if (!name) {
    throw new ConvexError("Category name is required.")
  }

  const conflicts = await getCategoryNameConflicts(ctx, user._id, {
    name,
  })

  if (conflicts.some((category) => !category.archived)) {
    throw new ConvexError("An active category with this name already exists.")
  }

  const timestamp = Date.now()

  return ctx.db.insert("categories", {
    userId: user._id,
    name,
    color: appearance.color,
    icon: appearance.icon,
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
    color: string
    icon: string
  }
) {
  const user = await requireUser(ctx)
  const category = await getOwnedCategory(ctx, user._id, args.categoryId)
  const name = args.name.trim()
  const appearance = requireEntityAppearance(args, "Category")

  if (!name) {
    throw new ConvexError("Category name is required.")
  }

  if (normalizeEntityName(category.name) !== normalizeEntityName(name)) {
    const conflicts = await getCategoryNameConflicts(ctx, user._id, {
      name,
      excludedCategoryId: category._id,
    })

    if (conflicts.some((item) => !item.archived)) {
      throw new ConvexError("An active category with this name already exists.")
    }
  }

  await ctx.db.patch(category._id, {
    name,
    color: appearance.color,
    icon: appearance.icon,
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

  if (!args.archived) {
    const conflicts = await getCategoryNameConflicts(ctx, user._id, {
      name: category.name,
      excludedCategoryId: category._id,
    })

    if (conflicts.some((item) => !item.archived)) {
      throw new ConvexError(
        "An active category with this name already exists. Rename it before restoring this one."
      )
    }
  }

  await ctx.db.patch(category._id, {
    archived: args.archived,
    updatedAt: Date.now(),
  })
}
