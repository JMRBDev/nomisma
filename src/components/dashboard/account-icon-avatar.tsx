import { ACCOUNT_ICON_MAP } from "@/components/dashboard/accounts/accounts-shared"
import { IconAvatar } from "@/components/icon-avatar"

export function AccountIconAvatar({
  icon,
  color,
}: {
  icon?: string | null
  color?: string | null
}) {
  return <IconAvatar icon={icon} color={color} iconMap={ACCOUNT_ICON_MAP} />
}
