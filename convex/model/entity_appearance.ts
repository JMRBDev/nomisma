import { ConvexError } from "convex/values"

export function requireEntityAppearance(
  values: {
    color: string
    icon: string
  },
  entityName: string
) {
  const color = values.color.trim()
  const icon = values.icon.trim()

  if (!color) {
    throw new ConvexError(`${entityName} color is required.`)
  }

  if (!icon) {
    throw new ConvexError(`${entityName} icon is required.`)
  }

  return {
    color,
    icon,
  }
}
