import { CATEGORY_ICON_MAP } from "@/components/dashboard/transactions/categories-shared"
import { IconAvatar } from "@/components/icon-avatar"

export function CategoryIconAvatar({
  icon,
  color,
}: {
  icon?: string | null
  color?: string | null
}) {
  return <IconAvatar icon={icon} color={color} iconMap={CATEGORY_ICON_MAP} />
}
