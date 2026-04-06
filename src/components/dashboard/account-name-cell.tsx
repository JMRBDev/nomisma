import { AccountIconAvatar } from "@/components/dashboard/account-icon-avatar"

export function AccountNameCell({
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
      <AccountIconAvatar icon={icon} color={color} />
      <span>{name}</span>
    </div>
  )
}
