import { CategoryNameCell } from "@/components/dashboard/category-name-cell"

export function CategoryTableValue({
  name,
  icon,
  color,
  emptyLabel,
}: {
  name?: string | null
  icon?: string | null
  color?: string | null
  emptyLabel?: string
}) {
  if (!name) {
    return <span className="text-muted-foreground">{emptyLabel ?? "—"}</span>
  }

  return <CategoryNameCell name={name} icon={icon} color={color} />
}
