import { AccountIconAvatar } from "@/components/dashboard/account-icon-avatar"
import { getAccountDisplayName } from "@/lib/dashboard-i18n"

export function AccountNameCell({
  name,
  icon,
  color,
}: {
  name?: string | null
  icon?: string | null
  color?: string | null
}) {
  return (
    <div className="flex items-center gap-2">
      <AccountIconAvatar icon={icon} color={color} />
      <span>{getAccountDisplayName(name)}</span>
    </div>
  )
}
