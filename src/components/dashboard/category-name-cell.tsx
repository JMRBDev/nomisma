import { CategoryIconAvatar } from "@/components/dashboard/category-icon-avatar"

export function CategoryNameCell({
  name,
  icon,
  color,
}: {
  name: string
  icon?: string | null
  color?: string | null
}) {
  return (
    <div className="flex items-center gap-2">
      <CategoryIconAvatar icon={icon} color={color} />
      <span>{name}</span>
    </div>
  )
}
