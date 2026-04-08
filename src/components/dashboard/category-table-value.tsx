import { CategoryNameCell } from "@/components/dashboard/category-name-cell"

export function CategoryTableValue({
  name,
  icon,
  color,
}: {
  name?: string | null
  icon?: string | null
  color?: string | null
}) {
  if (!name) {
    return <span className="text-muted-foreground">—</span>
  }

  return <CategoryNameCell name={name} icon={icon} color={color} />
}
